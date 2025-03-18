from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
import pandas as pd
import numpy as np
import os
import pickle
from geopy.distance import geodesic
from sklearn.preprocessing import StandardScaler
from pymongo import MongoClient
import time

# ✅ Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

# ✅ Get MongoDB URI from .env file
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("❌ Error: MONGO_URI is not set in .env file!")
    exit(1)  # Exit script if MONGO_URI is missing

# ✅ Initialize MongoDB connection
client = MongoClient(MONGO_URI)
db = client["test"]  # ✅ Explicitly define the database

# ✅ Debugging: Print MongoDB cluster connection
print("🔍 Connecting to MongoDB cluster:", MONGO_URI.split('@')[-1])

# ✅ Check MongoDB connection
def check_mongo_connection():
    retry_count = 5
    for attempt in range(retry_count):
        try:
            print(f"🔍 Attempting to connect to MongoDB (Attempt {attempt+1}/{retry_count})...")
            db.command("ping")  # Check if database is accessible
            print("✅ Connected to MongoDB successfully!")
            return True
        except Exception as e:
            print(f"❌ MongoDB Error: {e}")
        time.sleep(3)  # Wait before retrying

    print("❌ Could not establish MongoDB connection. Exiting.")
    exit(1)

check_mongo_connection()

# ✅ Load pre-trained models
MODEL_FOLDER = "Design_Travel_Itinerary/travel-itinerary-generator/backend/models"  # Updated path for uploaded models

file_paths = {
    "hotel": os.path.join(MODEL_FOLDER, "hotel_model.pkl"),
    "restaurant": os.path.join(MODEL_FOLDER, "restaurant_model.pkl"),
    "attraction_dbscan": os.path.join(MODEL_FOLDER, "attraction_dbscan.pkl"),
    "attraction_pca": os.path.join(MODEL_FOLDER, "attraction_pca.pkl"),
    "attractions_pca_data": os.path.join(MODEL_FOLDER, "attractions_pca_data.pkl"),
}

print("🔍 Checking model files in 'models/' directory...")
for key, path in file_paths.items():
    print(f"📂 {key}: {path} {'✅ Exists' if os.path.exists(path) else '❌ Missing'}")

# ✅ Function to safely load models
def load_model(model_key):
    model_path = file_paths[model_key]
    
    if not os.path.exists(model_path):
        print(f"❌ Error: Model file not found -> {model_path}")
        return None
    
    try:
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        print(f"✅ Model '{model_key}' loaded successfully!")
        return model
    except Exception as e:
        print(f"❌ Error loading model '{model_key}': {e}")
        return None

# ✅ Load models
hotel_model = load_model("hotel")
restaurant_model = load_model("restaurant")
attraction_model_dbscan = load_model("attraction_dbscan")
attraction_model_pca = load_model("attraction_pca")

# ✅ Load PCA Data
try:
    attractions_pca_data = np.load(file_paths["attractions_pca_data"], allow_pickle=True)
    print("✅ PCA data loaded successfully!")
except Exception as e:
    print(f"❌ Error loading PCA data: {e}")
    attractions_pca_data = None

# ✅ Load datasets from MongoDB safely
def load_data_from_mongo(collection_name):
    if collection_name not in db.list_collection_names():
        print(f"❌ Collection '{collection_name}' does not exist in the database!")
        return pd.DataFrame()  # Return an empty DataFrame
    
    data = list(db[collection_name].find({}, {'_id': 0}))  # Exclude _id field
    if not data:  # Check if collection is empty
        print(f"⚠️ No data found in '{collection_name}' collection!")
        return pd.DataFrame()
    
    return pd.DataFrame(data)

hotels = load_data_from_mongo("Hotels")
restaurants = load_data_from_mongo("Restaurants")
attractions = load_data_from_mongo("Attractions")

# ✅ Check missing columns and handle errors
def ensure_columns(df, required_columns):
    for col in required_columns:
        if col not in df.columns:
            print(f"⚠️ Warning: Column '{col}' is missing in the dataset.")
            df[col] = np.nan  # Assign NaN to avoid KeyError
    return df

hotels = ensure_columns(hotels, ["rating", "pricelevel"])
restaurants = ensure_columns(restaurants, ["rating", "pricelevel_lkr"])
attractions = ensure_columns(attractions, ["rating", "latitude", "longitude"])

# ✅ Standardize Data
scaler = StandardScaler()
hotels_scaled = scaler.fit_transform(hotels[['rating', 'pricelevel']].fillna(0))
restaurants_scaled = scaler.fit_transform(restaurants[['rating', 'pricelevel_lkr']].fillna(0))
attractions_scaled = scaler.fit_transform(attractions[['rating', 'latitude', 'longitude']].fillna(0))

# Function to allocate days
def allocate_days(user):
    destinations = [col.replace("destination_", "").lower().replace(" ", "_") for col in user if col.startswith("destination_") and user[col] == 1]
    num_days = user["numberofdays"]
    days_per_destination = {dest: num_days // len(destinations) for dest in destinations}
    for i in range(num_days % len(destinations)):
        days_per_destination[destinations[i]] += 1
    return days_per_destination

# Function to get nearby options
def get_nearby_options(lat, lon, options_df, max_distance_km):
    return sorted([
        (row, geodesic((lat, lon), (row['latitude'], row['longitude'])).km)
        for _, row in options_df.iterrows()
        if geodesic((lat, lon), (row['latitude'], row['longitude'])).km <= max_distance_km
    ], key=lambda x: x[1])

# Function to Recommend Hotels (Using Hotel Model)
def recommend_hotels(user):
    user_features = np.array([[user["hotelBudget"]]])
    predicted_ratings = hotel_model.predict(user_features)
    hotels["predicted_rating"] = predicted_ratings
    best_hotel = hotels.sort_values(by="predicted_rating", ascending=False).iloc[0]["name"]
    return best_hotel

# Function to Recommend Attractions (Using PCA + DBSCAN)
def recommend_attractions(user, lat, lon):
    max_distance_km = user["maximum_distance"]
    user_features = np.array([[user["activities_preference_Historical Sites"], user["activities_preference_Religious"]]])
    
    # Transform features using PCA
    user_pca_transformed = attraction_model_pca.transform(user_features)
    
    # Predict the cluster
    cluster_label = attraction_model_dbscan.fit_predict(user_pca_transformed.reshape(1, -1))
    
    # Select attractions from the predicted cluster
    filtered_attractions = attractions[attractions["cluster"] == cluster_label[0]]
    
    if filtered_attractions.empty:
        return ["No attractions available"]
    
    # Find nearby attractions
    nearby = get_nearby_options(lat, lon, filtered_attractions, max_distance_km)
    return [x[0]['name'] for x in nearby[:4]]

# Function to Recommend Restaurants (Using Restaurant Model)
def recommend_restaurants(user, lat, lon):
    max_distance_km = user["maximum_distance"]
    user_features = np.array([[user["cuisine_preference_Chinese"], user["cuisine_preference_Italian"], user["food_preference"]]])
    
    # Predict restaurant category
    predicted_class = restaurant_model.predict(user_features)
    filtered_restaurants = restaurants[restaurants["rating_class"] == predicted_class]
    
    if filtered_restaurants.empty:
        return {"breakfast": "No Restaurant Available", "lunch": "No Restaurant Available", "dinner": "No Restaurant Available"}
    
    # Find nearby restaurants
    nearby = get_nearby_options(lat, lon, filtered_restaurants, max_distance_km)
    
    return {
        "breakfast": nearby[0][0]['name'] if len(nearby) > 0 else "No Restaurant Available",
        "lunch": nearby[1][0]['name'] if len(nearby) > 1 else "No Restaurant Available",
        "dinner": nearby[2][0]['name'] if len(nearby) > 2 else "No Restaurant Available"
    }

@app.route('/generate_itinerary', methods=['POST'])
def generate_itinerary():
    data = request.json
    username = data["username"]
    itinerary_name = data["name"]

    # Fetch user data from preitineraries
    user = db.preitineraries.find_one({"username": username, "name": itinerary_name}, {'_id': 0})
    if not user:
        return jsonify({"error": "User itinerary not found"}), 404

    # Allocate days to destinations
    days_per_destination = allocate_days(user)

    itinerary = {}
    for destination, days in days_per_destination.items():
        formatted_destination = destination.replace("_", " ").title()
        hotel_name = recommend_hotels(user)
        hotel_info = hotels[hotels["name"] == hotel_name].iloc[0]
        hotel_lat, hotel_lon = hotel_info["latitude"], hotel_info["longitude"]

        for day in range(days):
            attractions_list = recommend_attractions(user, hotel_lat, hotel_lon)
            restaurants_list = recommend_restaurants(user, hotel_lat, hotel_lon)

            itinerary[f'{formatted_destination} - Day {day + 1}'] = {
                'Hotel': hotel_name,
                'Restaurants': restaurants_list,
                'Attractions': attractions_list
            }

    # Save itinerary to MongoDB under generated_itineraries
    db.generated_itineraries.insert_one({
        "username": username,
        "itinerary_name": itinerary_name,
        "itinerary": itinerary
    })

    return jsonify({"message": "Itinerary generated successfully", "itinerary": itinerary}), 201

if __name__ == '__main__':
    app.run(debug=True)
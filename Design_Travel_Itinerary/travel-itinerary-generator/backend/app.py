from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
import pandas as pd
import numpy as np
import os
from geopy.distance import geodesic
from sklearn.preprocessing import StandardScaler
from pymongo import MongoClient
import time

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

# ✅ Get MongoDB URI from .env file
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("❌ Error: MONGO_URI is not set in .env file!")
    exit(1)

# ✅ Initialize MongoDB connection
client = MongoClient(MONGO_URI)
db = client["test"]  # ✅ Explicitly define the database

# ✅ Debugging: Print MongoDB cluster connection
print("🔍 Connecting to MongoDB cluster:", MONGO_URI.split('@')[-1])

# Check MongoDB connection
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

@app.route('/')
def home():
    return "Flask server is running!", 200

@app.route('/favicon.ico')
def favicon():
    return '', 204  # Returns an empty response with HTTP 204 (No Content)


# ✅ Load pre-trained models
MODEL_FOLDER = "/workspaces/Pearl_Path/Design_Travel_Itinerary/travel-itinerary-generator/backend/models"  # Updated path for uploaded models

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
import joblib

# ✅ Function to safely load models using joblib
def load_model(model_key):
    model_path = file_paths[model_key]
    if not os.path.exists(model_path):
        print(f"❌ Error: Model file not found -> {model_path}")
        return None 
    try:
        model = joblib.load(model_path)  # ✅ Use joblib instead of pickle
        print(f"✅ Model '{model_key}' loaded successfully!")
        return model
    except Exception as e:
        print(f"❌ Error loading model '{model_key}': {e}")
        return None

# ✅ Load models using joblib
hotel_model = load_model("hotel")
restaurant_model = load_model("restaurant")
attraction_model_dbscan = load_model("attraction_dbscan")
attraction_model_pca = load_model("attraction_pca")

# ✅ Load PCA Data
try:
    attractions_pca_data = joblib.load(file_paths["attractions_pca_data"])  # ✅ Use joblib
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

# Check missing columns and handle errors
def ensure_columns(df, required_columns):
    for col in required_columns:
        if col not in df.columns:
            print(f"⚠️ Warning: Column '{col}' is missing in the dataset.")
            df[col] = np.nan  # Assign NaN to avoid KeyError
    return df

# Updating dataset column names to lowercase to ensure consistency
# Function to convert column names to lowercase
def convert_columns_to_lowercase(df):
    df.columns = map(str.lower, df.columns)
    return df

# Convert all datasets
hotels = convert_columns_to_lowercase(hotels)
restaurants = convert_columns_to_lowercase(restaurants)
attractions = convert_columns_to_lowercase(attractions)

hotels = ensure_columns(hotels, ["rating", "pricelevel"])
restaurants = ensure_columns(restaurants, ["rating", "pricelevel_lkr"])
attractions = ensure_columns(attractions, ["rating", "latitude", "longitude"])

# ✅ Standardize Data
scaler = StandardScaler()
hotels_scaled = scaler.fit_transform(hotels[['rating', 'pricelevel']].fillna(0))
restaurants_scaled = scaler.fit_transform(restaurants[['rating', 'pricelevel_lkr']].fillna(0))
attractions_scaled = scaler.fit_transform(attractions[['rating', 'latitude', 'longitude']].fillna(0))


# Allocate Days
def allocate_days(user):
    destinations = [col.replace("destination_", "").lower() for col in user if col.startswith("destination_") and user[col] == 1]
    num_days = user["numberofdays"]
    starting_destination = user.get("startingDestination", "").lower().replace(" ", "_")
    if starting_destination in destinations:
        destinations.remove(starting_destination)
    destinations.insert(0, starting_destination)
    days_per_destination = {dest: num_days // len(destinations) for dest in destinations}
    for i in range(num_days % len(destinations)):
        days_per_destination[destinations[i]] += 1
    return days_per_destination

# Assign Hotels
def assign_hotels_for_user(user):
    budget = user['hotelBudget']
    max_distance = user['maximum_distance']
    filtered_hotels = hotels[(hotels['pricelevel'] <= budget)]
    sorted_hotels = filtered_hotels.sort_values(by='rating', ascending=False)
    for _, hotel in sorted_hotels.iterrows():
        distance = geodesic((hotel['latitude'], hotel['longitude']), (user['starting_latitude'], user['starting_longitude'])).km
        if distance <= max_distance:
            return hotel['name']
    return "No suitable hotels available"

# Recommend Attractions
def recommend_attractions(user, hotel_lat, hotel_lon):
    max_distance_km = user["maximum_distance"]
    filtered_attractions = attractions.copy()
    filtered_attractions['distance'] = filtered_attractions.apply(
        lambda row: geodesic((hotel_lat, hotel_lon), (row['Latitude'], row['Longitude'])).km, axis=1)
    filtered_attractions = filtered_attractions[filtered_attractions['distance'] <= max_distance_km]
    return filtered_attractions.sort_values(by="Rating", ascending=False)["Name"].tolist()[:4] if not filtered_attractions.empty else ["No attractions available"]

# Recommend Restaurants
def recommend_restaurants(user, hotel_lat, hotel_lon):
    max_distance_km = user['maximum_distance']
    filtered_restaurants = restaurants.copy()
    filtered_restaurants['distance'] = filtered_restaurants.apply(
        lambda row: geodesic((hotel_lat, hotel_lon), (row['latitude'], row['longitude'])).km, axis=1)
    filtered_restaurants = filtered_restaurants[filtered_restaurants['distance'] <= max_distance_km]
    return filtered_restaurants.sort_values(by="rating", ascending=False)["name"].tolist()[:3] if not filtered_restaurants.empty else ["No restaurants available"]

# Generate Itinerary
@app.route('/generate_itinerary', methods=['POST'])
def generate_itinerary():
    data = request.json
    username = data["username"]
    itinerary_name = data["name"]

    user = db.preitineraries.find_one({"username": username, "name": itinerary_name}, {'_id': 0})
    if not user:
        return jsonify({"error": "User itinerary not found"}), 404

    days_per_destination = allocate_days(user)
    itinerary = {}
    
    for destination, days in days_per_destination.items():
        hotel_name = assign_hotels_for_user(user)
        hotel_info = hotels[hotels['name'] == hotel_name].iloc[0] if hotel_name else None
        hotel_lat, hotel_lon = hotel_info['latitude'], hotel_info['longitude'] if hotel_info is not None else (0, 0)
        for day in range(days):
            itinerary[f'{destination} - Day {day + 1}'] = {
                'Hotel': hotel_name,
                'Restaurants': recommend_restaurants(user, hotel_lat, hotel_lon),
                'Attractions': recommend_attractions(user, hotel_lat, hotel_lon)
            }

    return jsonify({"message": "Itinerary generated successfully", "itinerary": itinerary}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5004)
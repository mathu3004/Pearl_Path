from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
import pandas as pd
import numpy as np
import os
from geopy.distance import geodesic
from sklearn.preprocessing import StandardScaler
from pymongo import MongoClient
import time
import joblib
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
db = client["test"]  # Explicitly define the database

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

@app.route('/api/itinerary/<name>', methods=['GET'])
def get_itinerary_by_name(name):
    itinerary = db.generated_itineraries.find_one({"name": name.lower()}, {'_id': 0})
    if itinerary:
        return jsonify(itinerary), 200
    else:
        return jsonify({"error": "Itinerary not found"}), 404

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

# Unique tracking sets
visited_restaurants = set()
visited_attractions = set()

# Allocate Days
def allocate_days_to_destinations(user, num_days):
    # Extract destinations and starting destination
    destinations = [
        col.replace("destination_", "").lower().replace(" ", "_") 
        for col in user.keys() if col.startswith("destination_") and user[col] == 1
    ]

    starting_destination_list = [
        col.replace("startingDestination_", "").lower().replace(" ", "_") 
        for col in user.keys() if col.startswith("startingDestination_") and user[col] == 1
    ]

    # Ensure starting_destination is a string, not a list
    starting_destination = starting_destination_list[0] if starting_destination_list else None

    # Ensure starting destination is at the beginning
    if starting_destination:
        if starting_destination in destinations:
            destinations.remove(starting_destination)  # Remove if exists
        destinations.insert(0, starting_destination)  # Insert at start

    # **Edge Case: If destinations are empty**
    if not destinations:
        return {}  # Return an empty dictionary instead of causing ZeroDivisionError

    # Allocate days evenly across destinations
    num_destinations = len(destinations)
    base_days = num_days // num_destinations
    extra_days = num_days % num_destinations

    days_per_destination = {dest: base_days for dest in destinations}

    # Distribute extra days to the first `extra_days` destinations
    for i in range(extra_days):
        days_per_destination[destinations[i]] += 1

    return days_per_destination


def get_nearby_options(lat, lon, options, max_distance_km):
    return sorted([
        (row, geodesic((lat, lon), (row['latitude'], row['longitude'])).km)
        for _, row in options.iterrows()
        if geodesic((lat, lon), (row['latitude'], row['longitude'])).km <= max_distance_km
    ], key=lambda x: x[1])

def assign_hotels_for_user(user):
    budget = user.get('hotelBudget', None)
    max_distance = user.get('maximum_distance', None)

    if budget is None or max_distance is None:
        print("❌ Error: 'hotelBudget' or 'maximum_distance' is missing in user data!")
        return None

    print(f"🏨 Searching for hotels within budget: {budget} and max distance: {max_distance} km...")

    filtered_hotels = hotels[(hotels['pricelevel'] <= budget)]
    
    if filtered_hotels.empty:
        print("❌ No hotels found within the budget range!")
        return None

    sorted_hotels = filtered_hotels.sort_values(by='rating', ascending=False)

    for _, hotel in sorted_hotels.iterrows():
        if 'latitude' in hotel and 'longitude' in hotel:
            return hotel['name']  # ✅ Returns hotel name
        else:
            print(f"❌ Warning: Hotel {hotel['name']} is missing latitude/longitude!")
    
    return None

# Recommend Attractions
def recommend_attractions(user, hotel_lat, hotel_lon):
    max_distance_km = user.get("maximum_distance", 10)  # Default to 10 km if missing

    # ✅ Ensure DataFrame columns are lowercase
    filtered_attractions = attractions.copy()
    
    if 'latitude' not in filtered_attractions.columns or 'longitude' not in filtered_attractions.columns:
        print("❌ Error: 'latitude' or 'longitude' column is missing in attractions DataFrame!")
        return ["No attractions available"]

    filtered_attractions['distance'] = filtered_attractions.apply(
        lambda row: geodesic((hotel_lat, hotel_lon), (row['latitude'], row['longitude'])).km, axis=1)

    filtered_attractions = filtered_attractions[filtered_attractions['distance'] <= max_distance_km]

    if filtered_attractions.empty:
        print("❌ No attractions found within the specified distance!")
        return ["No attractions available"]

    return filtered_attractions.sort_values(by="rating", ascending=False)["name"].tolist()[:4]

# Recommend Restaurants
def recommend_restaurants(user, hotel_lat, hotel_lon):
    max_distance_km = user['maximum_distance']
    filtered_restaurants = restaurants.copy()
    filtered_restaurants['distance'] = filtered_restaurants.apply(
        lambda row: geodesic((hotel_lat, hotel_lon), (row['latitude'], row['longitude'])).km, axis=1)
    filtered_restaurants = filtered_restaurants[filtered_restaurants['distance'] <= max_distance_km]
    return filtered_restaurants.sort_values(by="rating", ascending=False)["name"].tolist()[:3] if not filtered_restaurants.empty else ["No restaurants available"]

@app.route('/generate_itinerary', methods=['POST'])
def generate_itinerary():
    print("🔍 Received request to generate itinerary...")

    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received!"}), 400

        username = data.get("username")
        itinerary_name = data.get("name")

        if not isinstance(username, str) or not isinstance(itinerary_name, str):
            return jsonify({"error": "username and itinerary name must be strings"}), 400

        print(f"🔍 Searching for itinerary in MongoDB: username={username}, name={itinerary_name}")

        # ✅ Fetch user itinerary from MongoDB
        user = db.preitineraries.find_one({"username": username, "name": itinerary_name}, {'_id': 0})

        if not user or not isinstance(user, dict):
            return jsonify({"error": "User itinerary not found or invalid format!"}), 404

        print("✅ User itinerary found! Allocating days...")

        # ✅ Assign starting latitude/longitude from selected hotel
        hotel_name = assign_hotels_for_user(user)
        print(f"🏨 Selected Hotel: {hotel_name}")

        if hotel_name:
            hotel_info = hotels[hotels['name'] == hotel_name]
            if not hotel_info.empty:
                user['starting_latitude'] = hotel_info.iloc[0]['latitude']
                user['starting_longitude'] = hotel_info.iloc[0]['longitude']
                print(f"📍 Assigned 'starting_latitude': {user['starting_latitude']}, 'starting_longitude': {user['starting_longitude']}")
            else:
                print("❌ No hotel found in database! Assigning default coordinates.")
                user['starting_latitude'], user['starting_longitude'] = None, None

        # If still missing, return an error
        if 'starting_latitude' not in user or 'starting_longitude' not in user or user['starting_latitude'] is None:
            raise jsonify("❌ Error: Could not determine starting latitude and longitude!")

        days_per_destination = allocate_days_to_destinations(user, user['numberofdays'])
        itinerary = {}

        for destination, days in days_per_destination.items():
            print(f"🔍 Processing destination: {destination} for {days} days...")
            for day in range(days):
                print(f"📅 Generating itinerary for {destination} - Day {day + 1}")

                itinerary[f'{destination} - Day {day + 1}'] = {
                    'Hotel': hotel_name,
                    'Restaurants': recommend_restaurants(user, user['starting_latitude'], user['starting_longitude']),
                    'Attractions': recommend_attractions(user, user['starting_latitude'], user['starting_longitude'])
                }

        print("Itinerary generation complete!")

        # Attempt to update existing itinerary or insert if new
        print("Attempting to save itinerary to MongoDB...")

        try:
            save_result = db.generated_itineraries.update_one(
    {"username": username, "name": itinerary_name},
    {
        "$set": {
            "username": username,
            "name": itinerary_name,
            "itinerary": itinerary
        }
    },
    upsert=True
)

            
            if save_result.matched_count > 0:
                print(f"✅ Existing itinerary updated successfully for {username}, {itinerary_name}")
            elif save_result.upserted_id:
                print(f"✅ New itinerary created with ID: {save_result.upserted_id}")
            else:
                print("⚠️ Warning: No modifications were made.")

        except Exception as e:
            print(f"❌ Error saving itinerary to MongoDB: {e}")
            return jsonify({"error": str(e)}), 500
        
        # ✅ Return successful response
        return jsonify({
            "message": "✅ Itinerary generated successfully!",
            "itinerary": itinerary
        }), 200

    except Exception as e:
        print(f"🚨 CRITICAL ERROR: {e}")
        return jsonify({"error": str(e)}), 500

# At the bottom of app.py
if __name__ == '__main__':
    import sys

    username = sys.argv[1]
    itinerary_name = sys.argv[2]

    print(f"Running itinerary generation for {username}, {itinerary_name}")

    with app.test_request_context(method='POST', json={
        'username': username,
        'name': itinerary_name
    }):
        response, status_code = generate_itinerary()
        print("✅ Response JSON:", response.get_json())
        print("📦 Status Code:", status_code)
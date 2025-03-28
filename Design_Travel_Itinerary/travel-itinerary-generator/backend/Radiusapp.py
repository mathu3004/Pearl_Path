# app.py
# Import required libraries
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
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

app = Flask(__name__) 

# Get MongoDB URI from .env file
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("Error: MONGO_URI is not set in .env file!")
    exit(1)

# Initialize MongoDB connection
client = MongoClient(MONGO_URI)
db = client["test"]

# Debugging: Print MongoDB cluster connection
print("Connecting to MongoDB cluster:", MONGO_URI.split('@')[-1])

# Check MongoDB connection
def check_mongo_connection():
    retry_count = 5
    for attempt in range(retry_count):
        try:
            print(f"Attempting to connect to MongoDB (Attempt {attempt+1}/{retry_count})...")
            db.command("ping")
            print("Connected to MongoDB successfully!")
            return True
        except Exception as e:
            print(f"MongoDB Error: {e}")
        time.sleep(3)  # Wait before retrying

    print("Could not establish MongoDB connection. Exiting.")
    exit(1)

check_mongo_connection()

@app.route('/')
def home():
    return "Flask server is running!", 200

@app.route('/favicon.ico')
def favicon():
    return '', 204  # Returns an empty response with HTTP 204 (No Content)

# Load pre-trained models
MODEL_FOLDER = "/workspaces/Pearl_Path/Design_Travel_Itinerary/travel-itinerary-generator/backend/models"

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

print("Checking model files in 'models/' directory...")
for key, path in file_paths.items():
    print(f"{key}: {path} {'Exists' if os.path.exists(path) else '❌ Missing'}")

# Function to safely load models
import joblib

# Function to safely load models using joblib
def load_model(model_key):
    model_path = file_paths[model_key]
    if not os.path.exists(model_path):
        print(f"Error: Model file not found -> {model_path}")
        return None 
    try:
        model = joblib.load(model_path)  
        print(f"Model '{model_key}' loaded successfully!")
        return model
    except Exception as e:
        print(f"Error loading model '{model_key}': {e}")
        return None

# Load models using joblib
hotel_model = load_model("hotel")
restaurant_model = load_model("restaurant")
attraction_model_dbscan = load_model("attraction_dbscan")
attraction_model_pca = load_model("attraction_pca")

# Load PCA Data
try:
    attractions_pca_data = joblib.load(file_paths["attractions_pca_data"])
    print("PCA data loaded successfully!")
except Exception as e:
    print(f"Error loading PCA data: {e}")
    attractions_pca_data = None

hotel_model_features = joblib.load(os.path.join(MODEL_FOLDER, "hotel_model_features.pkl"))
restaurant_model_features = joblib.load(os.path.join(MODEL_FOLDER, "restaurant_model_features.pkl"))

# Load datasets from MongoDB safely
def load_data_from_mongo(collection_name):
    if collection_name not in db.list_collection_names():
        print(f"Collection '{collection_name}' does not exist in the database!")
        return pd.DataFrame()  # Return an empty DataFrame
    
    data = list(db[collection_name].find({}, {'_id': 0}))  # Exclude _id field
    if not data:  # Check if collection is empty
        print(f"No data found in '{collection_name}' collection!")
        return pd.DataFrame()
    
    return pd.DataFrame(data)

hotels = load_data_from_mongo("Hotels")
restaurants = load_data_from_mongo("Restaurants")
attractions = load_data_from_mongo("Attractions")

# Check missing columns and handle errors
def ensure_columns(df, required_columns):
    for col in required_columns:
        if col not in df.columns:
            print(f"Warning: Column '{col}' is missing in the dataset.")
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

# Standardize Data
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

    # *Edge Case: If destinations are empty*
    if not destinations:
        return {}  # Return an empty dictionary instead of causing ZeroDivisionError

    # Allocate days evenly across destinations
    num_destinations = len(destinations)
    base_days = num_days // num_destinations
    extra_days = num_days % num_destinations

    days_per_destination = {dest: base_days for dest in destinations}

    # Distribute extra days to the first extra_days destinations
    for i in range(extra_days):
        days_per_destination[destinations[i]] += 1

    return days_per_destination

def get_nearby_options(lat, lon, options, max_distance_km):
    return sorted([
        (row, geodesic((lat, lon), (row['latitude'], row['longitude'])).km)
        for _, row in options.iterrows()
        if geodesic((lat, lon), (row['latitude'], row['longitude'])).km <= max_distance_km
    ], key=lambda x: x[1])

def assign_hotel_for_destination(user, destination):
    budget = user.get('hotelBudget', None)
    if budget is None:
        print(f"⚠ No hotel budget provided for {destination}")
        return None, []
    city_aliases = {
    "nuwara_eliya": "eliya", }
    fixed_dest = city_aliases.get(destination, destination)

    city_col = f"city_{fixed_dest.lower().replace(' ', '_')}"
    if city_col not in hotels.columns:
        print(f"⚠ No hotel city column found: {city_col}")
        return None, []

    city_hotels = hotels[hotels[city_col] == 1].copy()
    city_hotels = city_hotels[city_hotels['pricelevel'] <= budget]
    
    if city_hotels.empty:
        print(f"⚠ No hotels in {destination} within budget. Retrying without budget filter.")
        city_hotels = hotels[hotels[city_col] == 1]

    if city_hotels.empty:
        print(f"❌ Still no hotels found in {destination}")
        return None, []

    # ML Integration — Predict hotel rating
    hotel_inputs = city_hotels.reindex(columns=hotel_model_features, fill_value=0)
    try:
        city_hotels['predicted_rating'] = hotel_model.predict(hotel_inputs.to_numpy())
        top_hotels = city_hotels.sort_values(by='predicted_rating', ascending=False)
    except Exception as e:
        print(f"[ML Hotel] Fallback to manual rating due to: {e}")
        top_hotels = city_hotels.sort_values(by='rating', ascending=False)

    best = top_hotels.iloc[0]
    alternatives = top_hotels.iloc[1:4]

    main_hotel = {
        "name": str(best["name"]),
        "latitude": float(best["latitude"]),
        "longitude": float(best["longitude"]),
        "rating": float(best["rating"]),
        "pricelevel": int(best["pricelevel"]),
        "city": destination.title()
    }

    alt_hotels = [{
        "name": str(row["name"]),
        "latitude": float(row["latitude"]),
        "longitude": float(row["longitude"]),
        "rating": float(row["rating"]),
        "pricelevel": int(row["pricelevel"]),
        "city": destination.title()
    } for _, row in alternatives.iterrows()]

    return main_hotel, alt_hotels

# Recommend Attractions
def recommend_attractions_for_destination(user, destination, hotel_lat, hotel_lon, used_attractions):
    max_distance_km = user['maximum_distance']
    city_aliases = {
    "nuwara_eliya": "eliya"
    }
    fixed_dest = city_aliases.get(destination, destination)
    city_col = f"city_{fixed_dest}"

    # Step 1: Filter attractions by city
    if city_col in attractions.columns:
        city_attractions = attractions[attractions[city_col] == 1].copy()
    else:
        print(f"❌ City column not found: {city_col} — skipping attractions for {destination}")
        return [], {}

    # Step 2: Activity preference filtering
    user_activities = [col for col in user.keys() if col.startswith("activities_preference_") and user[col] == 1]
    matching_cols = [col for col in user_activities if col in city_attractions.columns]
    if matching_cols:
        city_attractions = city_attractions[city_attractions[matching_cols].sum(axis=1) > 0]

    # Step 3: Distance filtering
    city_attractions['distance'] = city_attractions.apply(
        lambda row: geodesic((hotel_lat, hotel_lon), (row['latitude'], row['longitude'])).km, axis=1)
    city_attractions = city_attractions[city_attractions['distance'] <= max_distance_km]

    # Step 4: Remove used
    city_attractions = city_attractions[~city_attractions['name'].isin(used_attractions)]

    # Step 5: Apply PCA + DBSCAN Clustering
    try:
        cluster_input = city_attractions[['rating', 'latitude', 'longitude']].fillna(0)
        cluster_input_scaled = StandardScaler().fit_transform(cluster_input)
        pca_data = attraction_model_pca.transform(cluster_input_scaled)
        cluster_labels = attraction_model_dbscan.fit_predict(pca_data)
        city_attractions['cluster'] = cluster_labels

        # Filter out noise cluster (-1)
        clustered_attractions = city_attractions[city_attractions['cluster'] != -1]
        clustered_attractions = clustered_attractions.sort_values(by='rating', ascending=False)
    except Exception as e:
        clustered_attractions = city_attractions.sort_values(by="rating", ascending=False)

    clustered_attractions = clustered_attractions.head(40)

    main = []
    alternatives = {}

    for i in range(4):
        group = clustered_attractions.iloc[i * 4: (i + 1) * 4]
        if group.empty:
            continue

        main_attraction = group.iloc[0]
        alt_group = group.iloc[1:4]
        
        main_obj = {
            "name": str(main_attraction["name"]),
            "latitude": float(main_attraction["latitude"]),
            "longitude": float(main_attraction["longitude"]),
            "rating": float(main_attraction["rating"]),
            "city": destination.title()
        }
        alt_group = alt_group[~alt_group['name'].isin(used_attractions)]

        alt_objs = [ {
            "name": str(row["name"]),
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "rating": float(row["rating"]),
            "city": destination.title()
        } for _, row in alt_group.iterrows()]

        main.append(main_obj)
        alternatives[main_obj["name"]] = alt_objs
        used_attractions.add(main_obj["name"])
        used_attractions.update(alt_group['name'].tolist())

    return main, alternatives

# Recommend Restaurants
def recommend_restaurants_for_destination(user, destination, hotel_lat, hotel_lon, used_restaurants):
    max_distance_km = user['maximum_distance']
    city_aliases = {
    "nuwara_eliya": "eliya"}
    fixed_dest = city_aliases.get(destination, destination)
    city_col = f"city_{fixed_dest}"

    # Filter by city
    if city_col in restaurants.columns:
        city_restaurants = restaurants[restaurants[city_col] == 1].copy()
    else:
        print(f"❌ City column not found: {city_col} — skipping restaurants for {destination}")
        return {}, {}

    # Dietary filtering
    dietary = 'dietary_veg' if user.get('food_preference_veg') == 1 else 'dietary_non-veg'
    if dietary in city_restaurants.columns:
        city_restaurants = city_restaurants[city_restaurants[dietary] == 1]

    # Cuisine filtering
    user_cuisines = [col.replace("cuisine_preference_", "cuisine_") for col in user.keys()
                     if col.startswith("cuisine_preference_") and user[col] == 1]
    valid_cuisines = [c for c in user_cuisines if c in city_restaurants.columns]
    if valid_cuisines:
        city_restaurants = city_restaurants[city_restaurants[valid_cuisines].sum(axis=1) > 0]

    # Add distance column
    city_restaurants['distance'] = city_restaurants.apply(
        lambda row: geodesic((hotel_lat, hotel_lon), (row['latitude'], row['longitude'])).km, axis=1)
    city_restaurants = city_restaurants[city_restaurants['distance'] <= max_distance_km]

    # Load model features list
    try:
        restaurant_model_features = joblib.load(os.path.join(MODEL_FOLDER, "restaurant_model_features.pkl"))
    except Exception as e:
        print("Error loading restaurant model features:", e)
        restaurant_model_features = []

    # Add missing features
    for col in restaurant_model_features:
        if col not in city_restaurants.columns:
            city_restaurants[col] = 0

    # Apply ML model prediction
    try:
        feature_data = city_restaurants[restaurant_model_features].to_numpy()
        city_restaurants['predicted_rating_class'] = restaurant_model.predict(feature_data)
        city_restaurants = city_restaurants.sort_values(by='predicted_rating_class', ascending=False)
    except Exception as e:
        print(f"[ML Restaurant] Prediction failed, fallback to rating: {e}")
        city_restaurants = city_restaurants.sort_values(by="rating", ascending=False)

    # Filter out used
    top_restaurants = city_restaurants[
        ~city_restaurants['name'].isin(used_restaurants)
    ].head(12)

    # Track used restaurant names
    used_restaurants.update(top_restaurants['name'].tolist())

    # Split into meals
    meals = ['breakfast', 'lunch', 'dinner']
    best = {}
    alternatives = {}

    for i, meal in enumerate(meals):
        start = i * 4
        end = start + 4
        group = top_restaurants.iloc[start:end]

        if not group.empty:
            best_restaurant = group.iloc[0]
            best[meal] = {
                "name": str(best_restaurant['name']),
                "latitude": float(best_restaurant['latitude']),
                "longitude": float(best_restaurant['longitude']),
                "city": destination.replace('_', ' ').title(),
                "rating": float(best_restaurant['rating'])
            }

            alt_group = group.iloc[1:4]
            alternatives[meal] = [{
                "name": str(row["name"]),
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "rating": float(row["rating"]),
                "city": destination.replace('_', ' ').title()
            } for _, row in alt_group.iterrows()]
        else:
            best[meal] = {}
            alternatives[meal] = []

    return best, alternatives

# --- Transport Mode Helpers ---
def get_user_transport_modes(username, name):
    pre_itinerary = db["preitineraries"].find_one({
        "username": username,
        "name": name
    })

    if not pre_itinerary:
        return ["walk"]

    transport_modes = []
    for key in pre_itinerary:
        if key.startswith("transportation_mode_") and pre_itinerary[key] == 1:
            mode = key.replace("transportation_mode_", "").lower()
            transport_modes.append(mode)

    return transport_modes if transport_modes else ["walk"]

def assign_transport_modes_to_itinerary(itinerary, transport_modes):
    updated_itinerary = {}

    for i, (day_key, day_data) in enumerate(itinerary.items()):
        mode = transport_modes[i % len(transport_modes)]
        day_data["transportationMode"] = mode
        updated_itinerary[day_key] = day_data

    return updated_itinerary

# Flask route for itinerary generation
@app.route('/generate_itinerary', methods=['POST'])
def generate_itinerary():
    try:
        data = request.json
        username = data.get("username")
        itinerary_name = data.get("name")

        user = db.preitineraries.find_one({"username": username, "name": itinerary_name}, {'_id': 0})
        if not user:
            return jsonify({"error": "User itinerary not found"}), 404

        days_per_destination = allocate_days_to_destinations(user, user['numberofdays'])
        itinerary = {}
        used_attractions = set()
        used_restaurants = set()


        for destination, days in days_per_destination.items():
            destination_key = destination.replace('_', ' ').title()
            for day in range(days):
                hotel, alt_hotels = assign_hotel_for_destination(user, destination)
                if not hotel:
                    continue

                user['starting_latitude'] = hotel['latitude']
                user['starting_longitude'] = hotel['longitude']

                attractions_list, alt_attractions = recommend_attractions_for_destination(
                    user, destination, hotel['latitude'], hotel['longitude'], used_attractions
                )

                restaurants_list, alt_restaurants = recommend_restaurants_for_destination(
                    user, destination, hotel['latitude'], hotel['longitude'], used_restaurants
                )

                itinerary[f'{destination_key} - Day {day+1}'] = {
                    "Hotel": hotel,
                    "Alternative Hotels": alt_hotels,
                    "Attractions": attractions_list,
                    "Alternative Attractions": alt_attractions,
                    "Restaurants": restaurants_list,
                    "Alternative Restaurants": alt_restaurants
                }

        transport_modes = get_user_transport_modes(username, itinerary_name)  # Get selected transport modes

        db.generated_itineraries.update_one(
            {"username": username, "name": itinerary_name},
            {"$set": {
                "username": username,
                "name": itinerary_name,
                "itinerary": itinerary,
                "transport_modes": transport_modes,  # ✅ save user-selected transport modes
                "last_updated": datetime.now(timezone.utc)
            }},
            upsert=True
        )


        return jsonify({"message": "Itinerary generated successfully", "itinerary": itinerary}), 200

    except Exception as e:
        print("Error in itinerary generation:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/itineraries/<username>/<name>', methods=['GET'])
def get_itinerary_by_user_and_name(username, name):
    itinerary = db.generated_itineraries.find_one(
        {"username": username, "name": name}, {'_id': 0}
    )
    if not itinerary or "itinerary" not in itinerary:
        return jsonify({"error": "Itinerary not found"}), 404

    # ✅ Inject transport modes
    transport_modes = get_user_transport_modes(username, name)
    updated_itinerary = assign_transport_modes_to_itinerary(itinerary["itinerary"], transport_modes)
    itinerary["itinerary"] = updated_itinerary

    return jsonify(itinerary), 200

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
        print("Response JSON:", response.get_json())
        print("Status Code:", status_code)
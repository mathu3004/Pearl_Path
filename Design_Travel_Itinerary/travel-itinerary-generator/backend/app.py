from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
import pandas as pd
import numpy as np
import random
from geopy.distance import geodesic
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.mixture import GaussianMixture
from sklearn.model_selection import train_test_split
import pickle

app = Flask(__name__)

# MongoDB Connection
app.config["MONGO_URI"] = "mongodb+srv://Pearlpath:DMEN2425@pearlpath.lq9jq.mongodb.net/?retryWrites=true&w=majority&appName=PearlPath"
mongo = PyMongo(app)

# Load pre-trained models
import pickle

file_path_hotel = "hotel_model.pkl"
file_path_rest = "restaurant_model.pkl"
file_path_attraction = "attraction_model.pkl"

try:
    with open(file_path_hotel, "rb") as f:
        hotel_model = pickle.load(f)
    with open(file_path_rest, "rb") as f:
        rest_model = pickle.load(f)
    with open(file_path_attraction, "rb") as f:
        attraction_model = pickle.load(f)
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")


# Load datasets from MongoDB
def load_data_from_mongo(collection_name):
    if collection_name not in mongo.db.list_collection_names():
        print(f"❌ Collection '{collection_name}' does not exist in the database!")
        return pd.DataFrame()  # Return an empty DataFrame
    
    data = list(mongo.db[collection_name].find({}, {'_id': 0}))  # Exclude _id field
    
    if not data:  # Check if collection is empty
        print(f"❌ No data found in '{collection_name}' collection!")
        return pd.DataFrame()
    
    return pd.DataFrame(data)

hotels = load_data_from_mongo("Hotels")
restaurants = load_data_from_mongo("Restaurants")
attractions = load_data_from_mongo("Attractions")

# Standardize Data
scaler = StandardScaler()
hotels_scaled = scaler.fit_transform(hotels[['rating', 'pricelevel']])
restaurants_scaled = scaler.fit_transform(restaurants[['rating', 'pricelevel_lkr']])
attractions_scaled = scaler.fit_transform(attractions[['rating', 'latitude', 'longitude']])

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

# Function to recommend hotels
def recommend_hotels(user):
    city_col = f"city_{user['startingDestination'].lower().replace(' ', '_')}"
    filtered_hotels = hotels[hotels[city_col] == 1].copy()
    budget = user["hotelBudget"]
    budget_hotels = filtered_hotels[filtered_hotels["pricelevel"] <= budget]
    if budget_hotels.empty:
        budget_hotels = filtered_hotels
    best_hotel = budget_hotels.sort_values(by="rating", ascending=False).iloc[0]["name"]
    return best_hotel

# Function to recommend attractions
def recommend_attractions(user, lat, lon):
    max_distance_km = user["maximum_distance"]
    city_col = f"city_{user['startingDestination'].lower().replace(' ', '_')}"
    filtered_attractions = attractions[attractions[city_col] == 1]
    nearby = get_nearby_options(lat, lon, filtered_attractions, max_distance_km)
    return [x[0]['name'] for x in nearby[:4]]

# Function to recommend restaurants
def recommend_restaurants(user, lat, lon):
    max_distance_km = user["maximum_distance"]
    city_col = f"city_{user['startingDestination'].lower().replace(' ', '_')}"
    filtered_restaurants = restaurants[restaurants[city_col] == 1]
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
    user = mongo.db.preitineraries.find_one({"username": username, "name": itinerary_name}, {'_id': 0})
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
    mongo.db.generated_itineraries.insert_one({
        "username": username,
        "itinerary_name": itinerary_name,
        "itinerary": itinerary
    })

    return jsonify({"message": "Itinerary generated successfully", "itinerary": itinerary}), 201

if __name__ == '__main__':
    app.run(debug=True)
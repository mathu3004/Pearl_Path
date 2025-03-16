import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
import numpy as np
from geopy.distance import geodesic
from sklearn.ensemble import RandomForestClassifier
from sklearn.mixture import GaussianMixture
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# MongoDB Connection
mongo_uri = "mongodb+srv://Pearlpath:DMEN2425@pearlpath.lq9jq.mongodb.net/?retryWrites=true&w=majority&appName=PearlPath"
client = MongoClient(mongo_uri)
db = client["test"]

# Fetch data from MongoDB
def fetch_latest_data():
    hotels = pd.DataFrame(list(db["Hotels"].find()))
    restaurants = pd.DataFrame(list(db["Restaurants"].find()))
    attractions = pd.DataFrame(list(db["Attractions"].find()))
    itineraries = pd.DataFrame(list(db["preitineraries"].find()))

    for df in [hotels, restaurants, attractions, itineraries]:
        if "_id" in df.columns:
            df.drop(columns=["_id"], inplace=True)

    return hotels, restaurants, attractions, itineraries

# Train GMM for hotel clustering
def train_hotel_gmm(hotels, n_clusters=5):
    features = hotels[['latitude', 'longitude', 'pricelevel', 'hotelclass', 'rating']].fillna(0)
    gmm = GaussianMixture(n_components=n_clusters, random_state=42)
    hotel_clusters = gmm.fit_predict(features)
    hotels['cluster'] = hotel_clusters
    return gmm, hotels

# Train RandomForest Classifier
def train_optimized_hotel_classifier(X_train, y_train):
    model = RandomForestClassifier(n_estimators=50, max_depth=10, min_samples_split=5, random_state=42)
    model.fit(X_train, y_train)
    return model

# Train XGBoost model
def train_xgboost_classifier(X_train, y_train):
    model = XGBClassifier(n_estimators=50, max_depth=6, learning_rate=0.1, random_state=42)
    model.fit(X_train, y_train)
    return model

# Allocate days to destinations
def allocate_days_to_destinations(destinations, num_days):
    allocation_rules = {1: (1, 1), 2: (1, 2), 3: (1, 3), 4: (1, 4), 5: (1, 4)}
    min_dest, max_dest = allocation_rules.get(num_days, (1, 1))
    num_destinations = min(max_dest, len(destinations))
    selected_destinations = destinations[:num_destinations]

    days_per_destination = {dest: 1 for dest in selected_destinations}
    remaining_days = num_days - len(selected_destinations)

    index = 0
    while remaining_days > 0 and selected_destinations:
        dest = selected_destinations[index]
        days_per_destination[dest] += 1
        remaining_days -= 1
        index = (index + 1) % len(selected_destinations)

    return days_per_destination

# Get nearby options based on distance
def get_nearby_options(lat, lon, options, max_distance_km):
    return sorted([
        (row, geodesic((lat, lon), (row['latitude'], row['longitude'])).km)
        for _, row in options.iterrows()
        if geodesic((lat, lon), (row['latitude'], row['longitude'])).km <= max_distance_km
    ], key=lambda x: x[1])

# Generate Itinerary
def generate_itinerary(username, itinerary_name):
    print(f"✅ Generating Itinerary for User: {username}, Itinerary: {itinerary_name}")

    hotels, restaurants, attractions, itineraries = fetch_latest_data()
    user_itinerary = itineraries[itineraries["username"] == username]

    if user_itinerary.empty:
        print(f"❌ Error: No itinerary found for user '{username}'")
        return

    user_itinerary = user_itinerary.iloc[0]
    num_days = int(user_itinerary['numberofdays'])
    max_distance = float(user_itinerary['maximum_distance'])
    # ✅ Extract destinations dynamically from one-hot encoding
    destination_columns = [col for col in user_itinerary.index if col.startswith('destination_') and user_itinerary[col] == 1]

    # ✅ Convert column names to actual destination names
    selected_destinations = [col.replace('destination_', '').strip() for col in destination_columns]

    if not selected_destinations:
        print("❌ Error: No destinations found for this itinerary!")
        print("Available columns:", user_itinerary.keys())
        return

    print(f"✅ Selected Destinations: {selected_destinations}")


    # Train Hotel Model
    gmm_model, hotels = train_hotel_gmm(hotels)

    features = ['latitude', 'longitude', 'hotelclass', 'rating']
    X = hotels[features]
    y = hotels['cluster']
    
    smote = SMOTE(random_state=42, k_neighbors=1)
    X_resampled, y_resampled = smote.fit_resample(X, y)
    X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, random_state=42)
    
    rf_model = train_optimized_hotel_classifier(X_train, y_train)
    xgb_model = train_xgboost_classifier(X_train, y_train)

    days_per_destination = allocate_days_to_destinations(selected_destinations, num_days)
    itinerary = {}

    for destination, days in days_per_destination.items():
        itinerary[destination] = {
            "days_allocated": days,
            "hotels": [],
            "restaurants": [],
            "attractions": []
        }

        # ✅ Check for city columns dynamically (one-hot encoding)
        city_columns = [col for col in hotels.columns if col.startswith('city_')]

        # ✅ Extract cities from one-hot encoding
        hotels['city'] = hotels[city_columns].idxmax(axis=1).str.replace('city_', '')

        # ✅ Now filter by city name
        hotel_options = hotels[hotels['city'].str.contains(destination, case=False, na=False)]

        if not hotel_options.empty:
            selected_hotel = hotel_options.sample(1).iloc[0]
            itinerary[destination]["hotels"].append(selected_hotel['name'])

        restaurant_options = restaurants[restaurants['city'].str.contains(destination, case=False, na=False)]
        nearby_restaurants = get_nearby_options(selected_hotel['latitude'], selected_hotel['longitude'], restaurant_options, max_distance)
        itinerary[destination]["restaurants"] = [res[0]['name'] for res in nearby_restaurants[:3]]

        attraction_options = attractions[attractions['city'].str.contains(destination, case=False, na=False)]
        nearby_attractions = get_nearby_options(selected_hotel['latitude'], selected_hotel['longitude'], attraction_options, max_distance)
        itinerary[destination]["attractions"] = [attr[0]['name'] for attr in nearby_attractions[:4]]

    db["generated_itineraries"].insert_one({"username": username, "name": itinerary_name, "itinerary": itinerary})

    return itinerary

@app.route('/generate_itinerary', methods=['POST'])
def generate_itinerary_api():
    data = request.json  
    username = data.get('username')
    itinerary_name = data.get('name')

    if not username or not itinerary_name:
        return jsonify({"error": "Username and itinerary name required"}), 400

    itinerary = generate_itinerary(username, itinerary_name)

    return jsonify({"itinerary": itinerary})

@app.route('/')
def home():
    return "✅ Flask Server is Running!"

if __name__ == '__main__':
    if len(sys.argv) == 3:
        generate_itinerary(sys.argv[1], sys.argv[2])
    else:
        print("ℹ️ Running Flask Server...")
        app.run(debug=True, port=5001)

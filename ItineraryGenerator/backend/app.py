import pandas as pd
import numpy as np
import re
from pymongo import MongoClient
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse.linalg import svds
import sys
import traceback
import json

#  Fix Unicode printing on Windows
if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8')

#  MongoDB Connection
mongo_uri = "mongodb+srv://Pearlpath:DMEN2425@pearlpath.lq9jq.mongodb.net/?retryWrites=true&w=majority&appName=PearlPath"
client = MongoClient(mongo_uri)
db = client["itinerary_recommendations"]

#  Step 1: Get CLI arguments
if len(sys.argv) < 3:
    print(" Error: Username and itinerary name required")
    sys.exit(1)

username = sys.argv[1].strip().lower()
itinerary_name = sys.argv[2].strip().lower()

#  Step 2: Load and Normalize Preprocessed User Data
user_input_record = db["PreUserInputs"].find_one({
    "username": username,
    "itineraryName": itinerary_name
})

if not user_input_record:
    print(" Preprocessed user input not found.")
    sys.exit(1)

#  Step 3: Normalize and Rename Columns
user_inputs_df = pd.DataFrame([user_input_record])
rename_dict = {
    "destinations": "destination",
    "numberOfDays": "numberofdays",
    "foodPreferences": "food_preference",
    "transportationMode": "transportation_mode",
    "budgetRangePerDay": "budget_per_day",
    "peopleCount": "peoplecount",
    "cuisines": "cuisine_preference",
    "activities": "activities_preference",
    "startingDestination": "startingDestination"
}
user_inputs_df.rename(columns=rename_dict, inplace=True)
user_inputs_df.columns = [col.replace(' ', '_') for col in user_inputs_df.columns]

list_columns = ['destination', 'cuisine_preference', 'activities_preference']
for col in list_columns:
    if col in user_inputs_df.columns and isinstance(user_inputs_df[col].iloc[0], list):
        user_inputs_df[col] = user_inputs_df[col].apply(lambda x: ", ".join(map(str, x)))

Hotels = pd.DataFrame(list(db["Hotels"].find()))
Restaurants = pd.DataFrame(list(db["Restaurants"].find()))
Attractions = pd.DataFrame(list(db["Attractions"].find()))
GeneratedItineraries = db["GeneratedItineraries"]

if 'Name' not in Attractions.columns:
    name_like_cols = [col for col in Attractions.columns if col.lower() == 'name']
    if name_like_cols:
        Attractions.rename(columns={name_like_cols[0]: 'Name'}, inplace=True)
    else:
        print(" 'Name' column not found in Attractions data.")
        sys.exit(1)

Attractions.columns = [col if col == 'Name' else col.replace(' ', '_') for col in Attractions.columns]

Hotels.columns = [col.replace(' ', '_') for col in Hotels.columns]
Restaurants.columns = [col.replace(' ', '_') for col in Restaurants.columns]
user_inputs_df.columns = [col.replace(' ', '_') for col in user_inputs_df.columns]

# ---------------------------- #
# Step 3: Encoding Destinations, Cuisines, Amenities, and Dietary Preferences
# ---------------------------- #

# Allowed destinations
allowed_destinations = {'Kandy', 'Ella', 'Colombo', 'Nuwara Eliya'}

# Encode destinations
all_destinations = set()
for dest in user_inputs_df['destination'].dropna():
    all_destinations.update(dest.split(', '))
destination_encoder = {dest: idx + 1 for idx, dest in enumerate(sorted(all_destinations)) if dest in allowed_destinations}

def encode_destinations(destination_str):
    return [destination_encoder.get(dest.strip()) for dest in destination_str.split(', ') if dest.strip() in destination_encoder]

user_inputs_df['encoded_destination'] = user_inputs_df['destination'].apply(encode_destinations)

# Encode cuisines in restaurants
all_cuisines = set()
for cuisines in Restaurants['cuisines'].dropna():
    all_cuisines.update(cuisines.split(', '))
cuisine_encoder = {cuisine: idx + 1 for idx, cuisine in enumerate(sorted(all_cuisines))}

# Encode amenities in hotels
all_amenities = set()
for amenities in Hotels['all_amenities'].dropna():
    all_amenities.update(amenities.split(', '))
amenity_encoder = {amenity: idx + 1 for idx, amenity in enumerate(sorted(all_amenities))}

# Encode dietary restrictions in restaurants
veg_friendly = {'Vegetarian friendly', 'Vegan options', 'Halal', 'Gluten free options'}
non_veg_friendly = {'No Special Dietary'}

def encode_dietary_restrictions(dietary_str):
    if pd.isna(dietary_str):
        return set()
    restrictions = set(dietary_str.split(', '))
    if restrictions & veg_friendly:
        return {1}  # Veg
    elif restrictions & non_veg_friendly:
        return {3}  # Non-Veg
    return set()

Restaurants['encoded_dietaryrestrictions'] = Restaurants['dietaryrestrictions'].apply(encode_dietary_restrictions)

# Apply encoding
Restaurants['encoded_cuisines'] = Restaurants['cuisines'].apply(lambda x: {cuisine_encoder[c] for c in x.split(', ')} if pd.notna(x) else set())
Hotels['encoded_amenities'] = Hotels['all_amenities'].apply(lambda x: {amenity_encoder[a] for a in x.split(', ')} if pd.notna(x) else set())

# Encode user's food preference
food_preference_encoder = {'Veg': 1, 'Non-Veg': 3}
user_inputs_df['encoded_food_preference'] = user_inputs_df['food_preference'].map(food_preference_encoder)

# Define the encoding for meal types
meal_type_encoder = {'Breakfast': 3, 'Lunch': 1, 'Dinner': 2, 'General': 1 | 2 | 3}

# Function to encode meal types
def encode_mealtypes(mealtypes_str):
    if pd.isna(mealtypes_str):
        return set()
    return {meal_type_encoder.get(meal.strip(), 0) for meal in mealtypes_str.split(', ')}

# Apply encoding to mealtypes
Restaurants['encoded_mealtypes'] = Restaurants['mealtypes'].apply(encode_mealtypes)

# ---------------------------- #
# Step 4: Extract City Information
# ---------------------------- #
def extract_city(address):
    match = re.search(r'([A-Za-z ]+),? Sri Lanka', str(address))
    return match.group(1).strip() if match else None

Hotels['extracted_city'] = Hotels['address'].apply(extract_city)

# ---------------------------- #
# Step 5: Clean Price Data (Attractions, Restaurants, Hotels, and User Budget)
# ---------------------------- #

# Function to clean the prices
def clean_price(price_str):
    if pd.isna(price_str):
        return None
    if 'No price mentioned' in price_str:
        return None
    price_str = price_str.replace('LKR', '').replace(',', '').strip()
    try:
        return float(price_str)
    except ValueError:
        return None

# Clean 'Lowest_Price' in Attractions
Attractions['Lowest_Price'] = Attractions['Lowest_Price'].apply(clean_price)

# Clean 'priceRange_LKR' in Hotels
Hotels['pricerange'] = Hotels['pricerange'].apply(clean_price)

# Clean 'budget_per_day' in user inputs
def clean_budget(budget_str):
    if pd.isna(budget_str):
        return None
    if 'Rs.' not in budget_str:
        return None
    budget_str = budget_str.replace('Rs.', '').replace(',', '').strip()
    if '-' in budget_str:
        lower, upper = budget_str.split(' - ')
        return (float(lower.strip()), float(upper.strip()))
    elif '+' in budget_str:
        return float(budget_str.replace('+', '').strip())
    return float(budget_str.strip())

user_inputs_df['cleaned_budget_per_day'] = user_inputs_df['budget_per_day'].apply(clean_budget)

# ---------------------------- #
# Step 6: Matching Functions (With Budget Constraints)
# ---------------------------- #

def match_best_hotels(user_budget, user_destination, hotels_df):
    hotels_in_city = hotels_df[hotels_df['extracted_city'] == user_destination]
    hotels_in_city = hotels_in_city[hotels_in_city['pricerange'] <= user_budget] if isinstance(user_budget, float) else hotels_in_city
    return hotels_in_city.sort_values(by=['rating', 'rankingposition'], ascending=[False, True])

def match_best_restaurants(user_cuisine_pref, user_food_pref, user_destination, restaurants_df, user_budget):
    if user_destination not in allowed_destinations:
        return pd.DataFrame()

    # Filter restaurants based on meal types
    restaurants_in_city = restaurants_df[restaurants_df['addressobj_city'] == user_destination].copy()

    # Get user's encoded cuisines and food preference
    user_encoded_cuisines = {cuisine_encoder.get(c, 0) for c in user_cuisine_pref.split(', ') if c in cuisine_encoder}
    user_encoded_food_pref = food_preference_encoder.get(user_food_pref, 3)

    # Ensure the meal type is part of the restaurant's offering
    available_mealtypes = {1, 2, 3}  # Include all meals by default (Lunch, Dinner, Breakfast)

    def calculate_match_score(row):
        cuisine_score = len(user_encoded_cuisines.intersection(row['encoded_cuisines']))
        dietary_score = int(user_encoded_food_pref in row['encoded_dietaryrestrictions'])
        meal_type_score = len(available_mealtypes.intersection(row['encoded_mealtypes']))
        return cuisine_score + dietary_score + meal_type_score

    restaurants_in_city['match_score'] = restaurants_in_city.apply(calculate_match_score, axis=1)

    # Filter by budget
    restaurants_in_city = restaurants_in_city[restaurants_in_city['pricelevel_lkr'] <= user_budget] if isinstance(user_budget, float) else restaurants_in_city

    # Sort by match score, highest to lowest
    return restaurants_in_city.sort_values(by='match_score', ascending=False)


# ---------------------------- #
# Step 7: Matching Attractions Based on User Preferences
# ---------------------------- #

# Define activity categories with relevant keywords
activity_keywords = {
    "Historical Sites": ["historical", "heritage", "ancient", "ruins", "museum"],
    "Nature Trails": ["nature", "trail", "hike", "park", "forest", "waterfall"],
    "Cultural": ["cultural", "tradition", "heritage", "art", "festival"],
    "Adventurous": ["adventure", "extreme", "zipline", "rafting", "hiking"],
    "Shopping": ["shopping", "mall", "market", "bazaar"],
    "Wildlife": ["wildlife", "safari", "zoo", "sanctuary", "animal"],
    "Religious": ["temple", "church", "mosque", "buddhist", "hindu", "shrine"],
    "Spa and Wellness": ["spa", "wellness", "retreat", "ayurveda", "massage"]
}

# Flatten the activity keywords into a single list for vectorization
activity_labels = list(activity_keywords.keys())
activity_texts = [" ".join(words) for words in activity_keywords.values()]

# Train TF-IDF vectorizer on activity categories
vectorizer = TfidfVectorizer()
activity_vectors = vectorizer.fit_transform(activity_texts)

# Function to match attractions based on activity preference and budget
def match_best_attractions(user_budget, user_destination, user_activities, attractions_df):
    if user_destination not in allowed_destinations:
        return pd.DataFrame()

    # Step 1: Filter attractions by location and budget
    if isinstance(user_budget, tuple):
        min_budget, max_budget = user_budget
        attractions_filtered = attractions_df[(attractions_df['City'] == user_destination) &
                                              (attractions_df['Lowest_Price'] >= min_budget) &
                                              (attractions_df['Lowest_Price'] <= max_budget)]
    else:
        attractions_filtered = attractions_df[(attractions_df['City'] == user_destination) &
                                              (attractions_df['Lowest_Price'] <= user_budget)]

    if attractions_filtered.empty:
        return pd.DataFrame()  # No valid attractions found

    # Step 2: Extract attraction names and vectorize them
    attraction_names = attractions_filtered['Name'].fillna("").astype(str).tolist()
    attraction_vectors = vectorizer.transform(attraction_names)

    # Step 3: Get user's activity preference and compute similarity scores
    user_activity_text = " ".join(activity_keywords[activity] for activity in user_activities if activity in activity_keywords)
    user_vector = vectorizer.transform([user_activity_text])

    # Compute similarity between attraction names and user's activity preferences
    similarity_scores = cosine_similarity(user_vector, attraction_vectors).flatten()

    # Step 4: Add similarity scores to DataFrame and sort recommendations
    attractions_filtered = attractions_filtered.copy()
    attractions_filtered['similarity_score'] = similarity_scores
    attractions_filtered = attractions_filtered.sort_values(by=['similarity_score', 'Rating', 'Ranking_Position'],
                                                            ascending=[False, False, True])

    return attractions_filtered


# ---------------------------- #
# Step 8: Feature Engineering for Content-Based Filtering
# ---------------------------- #

def replace_not_rated(value, median_value):
    return median_value if value == 'not rated' else value

def replace_no_ranking(value, median_value):
    return median_value if value == 'no ranking' else value

# Convert 'not rated' and 'no ranking' values to NaN, compute median, and replace
Attractions['Rating'] = pd.to_numeric(Attractions['Rating'], errors='coerce')
median_attraction_rating = Attractions['Rating'].median()
Attractions['Rating'] = Attractions['Rating'].fillna(median_attraction_rating)

Hotels['rating'] = pd.to_numeric(Hotels['rating'], errors='coerce')
median_hotel_rating = Hotels['rating'].median()
Hotels['rating'] = Hotels['rating'].fillna(median_hotel_rating)

Attractions['Ranking_Position'] = pd.to_numeric(Attractions['Ranking_Position'], errors='coerce')
median_attraction_ranking = Attractions['Ranking_Position'].median()
Attractions['Ranking_Position'] = Attractions['Ranking_Position'].fillna(median_attraction_ranking)

Hotels['rankingposition'] = pd.to_numeric(Hotels['rankingposition'], errors='coerce')
median_hotel_ranking = Hotels['rankingposition'].median()
Hotels['rankingposition'] = Hotels['rankingposition'].fillna(median_hotel_ranking)

# Normalize and transform data for similarity calculations
def create_feature_matrix(df, feature_columns):
    scaler = StandardScaler()
    feature_matrix = scaler.fit_transform(df[feature_columns].fillna(0))
    return feature_matrix

# Feature columns for hotels and attractions
hotel_features = ['rating', 'rankingposition', 'pricerange']
attraction_features = ['Rating', 'Ranking_Position', 'Lowest_Price']

Hotels['feature_matrix'] = list(create_feature_matrix(Hotels, hotel_features))
Attractions['feature_matrix'] = list(create_feature_matrix(Attractions, attraction_features))

# ---------------------------- #
# Step 9: Content-Based Filtering for Hotels
# ---------------------------- #

def recommend_similar_hotels(hotel_df, user_budget, user_destination, top_n=5):
    hotels_in_city = hotel_df[hotel_df['extracted_city'] == user_destination].copy()
    if isinstance(user_budget, float):
        hotels_in_city = hotels_in_city[hotels_in_city['pricerange'] <= user_budget]

    if hotels_in_city.empty:
        return pd.DataFrame()

    feature_matrix = np.stack(hotels_in_city['feature_matrix'].values)
    similarity_matrix = cosine_similarity(feature_matrix)

    # Rank hotels based on similarity to all other hotels
    avg_similarity = similarity_matrix.mean(axis=1)
    hotels_in_city.loc[:, 'similarity_score'] = avg_similarity
    return hotels_in_city.sort_values(by=['similarity_score', 'rating', 'rankingposition'], ascending=[False, False, True]).head(top_n)

# ---------------------------- #
# Step 10: Collaborative Filtering for Hotels
# ---------------------------- #

# Create a pseudo user-item matrix where hotels are treated as "users" and ratings as interactions
hotel_ratings_matrix = Hotels[['name', 'rating', 'rankingposition']].copy()

# Normalize data
scaler = StandardScaler()
hotel_ratings_matrix[['rating', 'rankingposition']] = scaler.fit_transform(
    hotel_ratings_matrix[['rating', 'rankingposition']]
)

# Pivot table to create an implicit user-item matrix
hotel_ratings_pivot = hotel_ratings_matrix.pivot_table(index='name', values='rating', fill_value=0)

# Convert DataFrame to NumPy array
hotel_ratings_pivot_np = hotel_ratings_pivot.to_numpy()

# Get matrix dimensions
num_hotels, num_features = hotel_ratings_pivot_np.shape

# Ensure k is within valid range
valid_k = max(1, min(50, min(num_hotels, num_features) - 1))

# Print debug info
print(f"Matrix shape: {hotel_ratings_pivot_np.shape}")
print(f"Valid k: {valid_k}")
print(f"Contains NaN: {np.isnan(hotel_ratings_pivot_np).any()}")
print(f"Contains Inf: {np.isinf(hotel_ratings_pivot_np).any()}")
print(f"All Zeros: {np.all(hotel_ratings_pivot_np == 0)}")

# Handle potential issues before SVD
if np.isnan(hotel_ratings_pivot_np).any():
    print("Replacing NaN values with 0.")
    hotel_ratings_pivot_np = np.nan_to_num(hotel_ratings_pivot_np)

if np.all(hotel_ratings_pivot_np == 0):
    print("All-zero matrix detected. Skipping SVD.")
else:
    try:
        # Perform Singular Value Decomposition (SVD)
        U, sigma, Vt = svds(hotel_ratings_pivot_np, k=valid_k)
        sigma = np.diag(sigma)  # Convert sigma into a diagonal matrix
        print("SVD completed successfully!")
    except Exception as e:
        print(f"Error in SVD: {e}")
        U = sigma = Vt = None  # Ensure these variables are set to None if SVD fails

# Proceed only if SVD was successful
if U is not None and sigma is not None and Vt is not None:
    # Compute predicted ratings
    predicted_ratings = np.dot(np.dot(U, sigma), Vt)
    hotel_pred_df = pd.DataFrame(predicted_ratings, index=hotel_ratings_pivot.index, columns=hotel_ratings_pivot.columns)

    # Function to recommend hotels based on predicted ratings
    def recommend_collaborative_hotels(hotels_df, top_n=5):
        avg_ratings = hotel_pred_df.mean(axis=1)  # Average predicted rating per hotel
        recommended_hotels = hotels_df[hotels_df['name'].isin(avg_ratings.index)].copy()
        recommended_hotels['predicted_rating'] = recommended_hotels['name'].map(avg_ratings)

        return recommended_hotels.sort_values(by=['predicted_rating', 'rating', 'rankingposition'],
                                              ascending=[False, False, True]).head(top_n)
else:
    print("SVD failed, skipping hotel recommendation.")

# ---------------------------- #
# Step 11: Collaborative Filtering for Attractions
# ---------------------------- #

# Create a pseudo user-item matrix where attractions are treated as "users" and ratings as interactions
attraction_ratings_matrix = Attractions[['Name', 'Rating', 'Ranking_Position']].copy()

# Normalize data
scaler = StandardScaler()
attraction_ratings_matrix[['Rating', 'Ranking_Position']] = scaler.fit_transform(
    attraction_ratings_matrix[['Rating', 'Ranking_Position']]
)

# Pivot table to create an implicit user-item matrix
attraction_ratings_pivot = attraction_ratings_matrix.pivot_table(index='Name', values='Rating', fill_value=0)

# Convert DataFrame to NumPy array
attraction_ratings_pivot_np = attraction_ratings_pivot.to_numpy()

# Get matrix dimensions
num_attractions, num_features = attraction_ratings_pivot_np.shape

# Ensure k is within valid range
valid_k = max(1, min(50, min(num_attractions, num_features) - 1))

# Print debug info
print(f"Matrix shape: {attraction_ratings_pivot_np.shape}")
print(f"Valid k: {valid_k}")
print(f"Contains NaN: {np.isnan(attraction_ratings_pivot_np).any()}")
print(f"Contains Inf: {np.isinf(attraction_ratings_pivot_np).any()}")
print(f"All Zeros: {np.all(attraction_ratings_pivot_np == 0)}")

# Handle potential issues before SVD
if np.isnan(attraction_ratings_pivot_np).any():
    print("Replacing NaN values with 0.")
    attraction_ratings_pivot_np = np.nan_to_num(attraction_ratings_pivot_np)

if np.all(attraction_ratings_pivot_np == 0):
    print("All-zero matrix detected. Skipping SVD.")
else:
    try:
        # Perform Singular Value Decomposition (SVD)
        U, sigma, Vt = svds(attraction_ratings_pivot_np, k=valid_k)
        sigma = np.diag(sigma)  # Convert sigma into a diagonal matrix
        print("SVD completed successfully!")
    except Exception as e:
        print(f"Error in SVD: {e}")
        U = sigma = Vt = None  # Ensure these variables are set to None if SVD fails

# Proceed only if SVD was successful
if U is not None and sigma is not None and Vt is not None:
    # Compute predicted ratings
    predicted_ratings_attractions = np.dot(np.dot(U, sigma), Vt)
    attraction_pred_df = pd.DataFrame(predicted_ratings_attractions, index=attraction_ratings_pivot.index, columns=attraction_ratings_pivot.columns)

    # Function to recommend attractions based on predicted ratings
    def recommend_collaborative_attractions(attractions_df, top_n=5):
        avg_ratings = attraction_pred_df.mean(axis=1)  # Average predicted rating per attraction
        recommended_attractions = attractions_df[attractions_df['Name'].isin(avg_ratings.index)].copy()
        recommended_attractions['predicted_rating'] = recommended_attractions['Name'].map(avg_ratings)

        return recommended_attractions.sort_values(by=['predicted_rating', 'Rating', 'Ranking_Position'],
                                                   ascending=[False, False, True]).head(top_n)
else:
    print("SVD failed, skipping attraction recommendation.")


#  Step 12: Generate and store itinerary to MongoDB

GeneratedItineraries = db["GeneratedItineraries"]

#  Utility: Clean unserializable types for MongoDB
def clean_for_mongo(obj):
    if isinstance(obj, dict):
        return {k: clean_for_mongo(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_for_mongo(i) for i in obj]
    elif isinstance(obj, set):
        return list(obj)
    elif isinstance(obj, (np.float64, np.int64, np.int32, np.float32)):
        return float(obj)
    elif pd.isna(obj):
        return None
    else:
        return obj

for index, user in user_inputs_df.iterrows():
    destinations = user['destination'].split(', ')
    num_days = user['numberofdays']
    selected_destinations = destinations[:2] if num_days >= 4 else [destinations[0]]

    hotel_stay_counter = 0
    current_hotel = None
    used_restaurants = set()
    used_attractions = set()

    final_itinerary = {
        "username": user['username'],
        "itineraryName": user['itineraryName'],
        "startingDestination": user.get('startingDestination', destinations[0]),
        "food_preference": user.get('food_preference', ''),
        "cuisine_preference": user.get('cuisine_preference', ''),
        "budget_per_day": user.get('budget_per_day', ''),
        "days": []
    }

    for day in range(num_days):
        current_destination = selected_destinations[min(day // 2, len(selected_destinations) - 1)]

        hotel_note = ""
        recommended_hotels = recommend_similar_hotels(Hotels, user['cleaned_budget_per_day'], current_destination)
        if recommended_hotels.empty:
            fallback_hotels = Hotels[Hotels['extracted_city'] == current_destination]
            if not fallback_hotels.empty:
                current_hotel = fallback_hotels.sort_values(by='rating', ascending=False).iloc[0]
                hotel_note = f"Fallback: Best rated ({current_hotel['rating']})"
            else:
                continue
        else:
            current_hotel = recommended_hotels.iloc[0]

        restaurant_note = ""
        recommended_restaurants = match_best_restaurants(
            user['cuisine_preference'], user['food_preference'],
            current_destination, Restaurants, user['cleaned_budget_per_day']
        )

        recommended_restaurants = recommended_restaurants[~recommended_restaurants['name'].isin(used_restaurants)]
        if len(recommended_restaurants) < 3:
            fallback_restaurants = Restaurants[Restaurants['addressobj_city'] == current_destination]
            fallback_restaurants = fallback_restaurants[~fallback_restaurants['name'].isin(used_restaurants)]
            if len(fallback_restaurants) >= 3:
                recommended_restaurants = fallback_restaurants.sort_values(by='rating', ascending=False)
                restaurant_note = "Fallback: Using highest rated restaurants"
            else:
                continue

        attraction_note = ""
        recommended_attractions = match_best_attractions(
            user['cleaned_budget_per_day'], current_destination,
            user['activities_preference'], Attractions
        )

        if 'Name' not in recommended_attractions.columns and 'Name' in Attractions.columns:
            recommended_attractions = pd.merge(
                recommended_attractions,
                Attractions[['Name']],
                left_index=True,
                right_index=True,
                how='left'
            )

        recommended_attractions = recommended_attractions[~recommended_attractions['Name'].isin(used_attractions)]

        if len(recommended_attractions) < 2:
            fallback_attractions = Attractions[Attractions['City'] == current_destination].copy()
            fallback_attractions = fallback_attractions[~fallback_attractions['Name'].isin(used_attractions)]
            if len(fallback_attractions) >= 2:
                recommended_attractions = fallback_attractions.sort_values(by='Rating', ascending=False)
                attraction_note = "Fallback: Using top-rated attractions"
            else:
                recommended_attractions = pd.DataFrame(columns=Attractions.columns)

        breakfast_restaurant = recommended_restaurants.iloc[0]
        lunch_restaurant = recommended_restaurants.iloc[1]
        dinner_restaurant = recommended_restaurants.iloc[2]

        attraction_1 = recommended_attractions.iloc[0]
        attraction_2 = recommended_attractions.iloc[1]

        def extract_attraction_url(row):
            if row.get('website', '').lower() != 'no website':
                return row.get('website')
            return row.get('URL_1', '') if row.get('URL_1', '').lower() != 'no url' else ''


        used_restaurants.update([
            breakfast_restaurant['name'],
            lunch_restaurant['name'],
            dinner_restaurant['name']
        ])
        used_attractions.update([
            attraction_1['Name'],
            attraction_2['Name']
        ])

        final_itinerary["days"].append({
            "day": day + 1,
            "destination": current_destination,
            "hotel": {
                "name": current_hotel['name'],
                "rating": current_hotel['rating'],
                "price": current_hotel.get('pricerange', ''),
                "note": hotel_note,
                "latitude": current_hotel.get('latitude'),
                "longitude": current_hotel.get('longitude'),
                "weburl": current_hotel.get('weburl', '')
            },
            "meals": {
                "breakfast": {
                    "name": breakfast_restaurant['name'],
                    "cuisines": breakfast_restaurant.get('cuisines', ''),
                    "dietaryrestrictions": breakfast_restaurant.get('dietaryrestrictions', ''),
                    "pricelevel_lkr": breakfast_restaurant.get('pricelevel_lkr', ''),
                     "latitude": breakfast_restaurant.get('latitude'),
                    "longitude": breakfast_restaurant.get('longitude'),
                    "mealtypes": breakfast_restaurant.get('mealtypes', ''),
                    "weburl": breakfast_restaurant.get('weburl', '')
                },
            "lunch": {
                    "name": lunch_restaurant['name'],
                    "cuisines": lunch_restaurant.get('cuisines', ''),
                    "dietaryrestrictions": lunch_restaurant.get('dietaryrestrictions', ''),
                    "pricelevel_lkr": lunch_restaurant.get('pricelevel_lkr', ''),
                    "latitude": lunch_restaurant.get('latitude'),
                    "longitude": lunch_restaurant.get('longitude'),
                    "mealtypes": lunch_restaurant.get('mealtypes', ''),
                    "weburl": lunch_restaurant.get('weburl', '')
                },
            "dinner": {
                    "name": dinner_restaurant['name'],
                    "cuisines": dinner_restaurant.get('cuisines', ''),
                    "dietaryrestrictions": dinner_restaurant.get('dietaryrestrictions', ''),
                    "pricelevel_lkr": dinner_restaurant.get('pricelevel_lkr', ''),
                    "latitude": dinner_restaurant.get('latitude'),
                    "longitude": dinner_restaurant.get('longitude'),
                    "mealtypes": dinner_restaurant.get('mealtypes', ''),
                    "weburl": dinner_restaurant.get('weburl', '')
                },
            "note": restaurant_note
            },
            "attractions": [
                {
                    "name": attraction_1['Name'],
                    "price": attraction_1.get('Lowest_Price', ''),
                    "rating": attraction_1.get('Rating', ''),
                    "latitude": attraction_1.get('latitude'),
                    "longitude": attraction_1.get('longitude'),
                    "weburl": extract_attraction_url(attraction_1)
                },
                {
                    "name": attraction_2['Name'],
                    "price": attraction_2.get('Lowest_Price', ''),
                    "rating": attraction_2.get('Rating', ''),
                    "latitude": attraction_2.get('latitude'),
                    "longitude": attraction_2.get('longitude'),
                    "weburl": attraction_2.get('website', ''),
                    "weburl": extract_attraction_url(attraction_2)
                }
            ],
            "attraction_note": attraction_note
        })

    cleaned_itinerary = clean_for_mongo(final_itinerary)

    #  Print output to logs for verification
    try:
        print(" FINAL GENERATED ITINERARY:")
        print(json.dumps(cleaned_itinerary, indent=2))  # Log formatted output
    except Exception as e:
        print(f" Error printing itinerary JSON: {e}")
        traceback.print_exc()

    #  Save to MongoDB
    try:
        GeneratedItineraries.replace_one(
            {"username": user['username'], "itineraryName": user['itineraryName']},
            cleaned_itinerary,
            upsert=True
        )
        print(f" Itinerary saved to MongoDB for {user['username']} - {user['itineraryName']}")
    except Exception as e:
        print(f" Error saving itinerary: {e}")
        traceback.print_exc()

    print(f" Itinerary saved to MongoDB for {user['username']} - {user['itineraryName']}")

#  change_recommendation.py (final fully working version with replacements)
import pandas as pd
import numpy as np
import sys
import json
import re
from pymongo import MongoClient
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from bson import ObjectId

# CLI usage check
if len(sys.argv) < 5:
    print(json.dumps({"error": "Usage: change_recommendation.py <username> <itinerary_name> <dayIndex> <type> [mealType|attractionIndex]"}))
    sys.exit(1)

username = sys.argv[1].strip().lower()
itinerary_name = sys.argv[2].strip().lower()
day_index = int(sys.argv[3])
type_ = sys.argv[4].strip().lower()
extra = sys.argv[5] if len(sys.argv) > 5 else None

client = MongoClient("mongodb+srv://Pearlpath:DMEN2425@pearlpath.lq9jq.mongodb.net/?retryWrites=true&w=majority&appName=PearlPath")
db = client["itinerary_recommendations"]

user_input = db["PreUserInputs"].find_one({"username": username, "itineraryName": itinerary_name})
itinerary = db["GeneratedItineraries"].find_one({"username": username, "itineraryName": itinerary_name})

if not user_input or not itinerary:
    print(json.dumps({"error": "User data or itinerary not found."}))
    sys.exit(1)

# Collect all restaurants already used across the itinerary
all_restaurant_names = set()
for day in itinerary['days']:
    meals = day.get('meals', {})
    for meal_type in ['breakfast', 'lunch', 'dinner']:
        if meal_type in meals and 'name' in meals[meal_type]:
            all_restaurant_names.add(meals[meal_type]['name'])

# Collect all attractions already used across the itinerary
all_attraction_names = set()
for day in itinerary['days']:
    attractions = day.get('attractions', [])
    for attr in attractions:
        if 'Name' in attr:
            all_attraction_names.add(attr['Name'])
        elif 'name' in attr:
            all_attraction_names.add(attr['name'])


Hotels = pd.DataFrame(list(db["Hotels"].find()))
Restaurants = pd.DataFrame(list(db["Restaurants"].find()))
Attractions = pd.DataFrame(list(db["Attractions"].find()))

activities = user_input.get("activities", [])
cuisines = user_input.get("cuisines", [])
food_pref = user_input.get("foodPreferences", "")
budget_str = user_input.get("budgetRangePerDay", "")

# --- Budget Parse ---
budget = None
if 'Rs.' in budget_str:
    try:
        budget_str = budget_str.replace('Rs.', '').replace(',', '').strip()
        if '-' in budget_str:
            _, upper = budget_str.split('-')
            budget = float(upper.strip())
        elif '+' in budget_str:
            budget = float(budget_str.replace('+', '').strip())
        else:
            budget = float(budget_str)
    except:
        budget = None

current_day = itinerary['days'][day_index]
city = current_day['destination']

# Fix extracted_city if missing
if 'extracted_city' not in Hotels.columns:
    def extract_city(address):
        match = re.search(r'([A-Za-z ]+),? Sri Lanka', str(address))
        return match.group(1).strip() if match else None
    Hotels['extracted_city'] = Hotels['address'].apply(extract_city)

# Track change history
itinerary.setdefault('change_history', {})
key = f"{type_}_{day_index}_{extra}" if extra else f"{type_}_{day_index}"
previous_names = itinerary['change_history'].get(key, [])

# Also track same-day restaurant meals to avoid repeats
same_day_meal_names = set()
if type_ == "restaurant":
    for meal in ['breakfast', 'lunch', 'dinner']:
        if meal in current_day['meals']:
            same_day_meal_names.add(current_day['meals'][meal]['name'])

exclude_name = None
if type_ == 'hotel':
    exclude_name = current_day['hotel']['name']
elif type_ == 'restaurant' and extra:
    exclude_name = current_day['meals'][extra]['name']
elif type_ == 'attraction' and extra:
    exclude_name = current_day['attractions'][int(extra)]['name']

if exclude_name:
    previous_names.append(exclude_name)
    itinerary['change_history'][key] = previous_names

# --- Matchers --- #
veg_friendly = {'Vegetarian friendly', 'Vegan options', 'Halal', 'Gluten free options'}
non_veg_friendly = {'No Special Dietary'}
meal_type_encoder = {'Breakfast': 3, 'Lunch': 1, 'Dinner': 2, 'General': 6}

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

def recommend_by_rating(df, name_col, rating_col):
    df = df[~df[name_col].isin(previous_names)].copy()
    return df.sort_values(by=rating_col, ascending=False).iloc[0].to_dict() if not df.empty else {}

def match_restaurants():
    df = Restaurants.copy()
    df = df[df['addressobj_city'].str.lower() == city.lower()]
    df = df[~df['name'].isin(previous_names)]
    df = df[~df['name'].isin(same_day_meal_names)]
    df = df[~df['name'].isin(all_restaurant_names)]  #  Exclude globally used restaurants

    if budget is not None:
        df['pricelevel_lkr'] = pd.to_numeric(df['pricelevel_lkr'], errors='coerce')
        df = df[df['pricelevel_lkr'] <= budget]

    meal_type_id = meal_type_encoder.get(extra.capitalize(), 0)
    user_dietary = 1 if food_pref.lower() == 'veg' else 3

    df['match_score'] = df.apply(lambda row: (
        len(set(cuisines).intersection(set(str(row.get('cuisines', '')).split(', ')))) +
        int(user_dietary in set(row.get('dietaryrestrictions', '').split(', '))) +
        int(meal_type_id in [meal_type_encoder.get(m.strip(), 0) for m in str(row.get('mealtypes', '')).split(', ')])
    ), axis=1)

    return df.sort_values(by='match_score', ascending=False).iloc[0].to_dict() if not df.empty else {}


def match_attractions():
    df = Attractions.copy()
    df = df[df['City'].str.lower() == city.lower()]
    df = df[~df['Name'].isin(previous_names)]
    df = df[~df['Name'].isin(all_attraction_names)]
    if budget is not None:
        df['Lowest_Price'] = pd.to_numeric(df['Lowest_Price'], errors='coerce')
        df = df[df['Lowest_Price'] <= budget]

    user_text = " ".join([" ".join(activity_keywords.get(act, [])) for act in activities])
    if not user_text.strip(): return {}

    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(df['Name'].fillna(""))
    user_vec = tfidf.transform([user_text])
    df['similarity'] = cosine_similarity(user_vec, tfidf_matrix).flatten()
    return df.sort_values(by='similarity', ascending=False).iloc[0].to_dict() if not df.empty else {}

# --- Main Switch --- #
if type_ == 'hotel':
    df = Hotels.copy()
    df = df[df['extracted_city'].str.lower() == city.lower()]
    if budget is not None:
        df['pricerange'] = pd.to_numeric(df['pricerange'], errors='coerce')
        df = df[df['pricerange'] <= budget]
    df = df[~df['name'].isin(previous_names)]
    new = recommend_by_rating(df, 'name', 'rating')
    if new: current_day['hotel'] = new
elif type_ == 'restaurant' and extra:
    new = match_restaurants() or recommend_by_rating(Restaurants, 'name', 'rating')
    if new: current_day['meals'][extra] = new
elif type_ == 'attraction' and extra:
    new = match_attractions()
    if not new:
        df = Attractions.copy()
        df = df[df['City'].str.lower() == city.lower()]
        df = df[~df['Name'].isin(previous_names)]
        df = df[~df['Name'].isin(all_attraction_names)]  #  also exclude all attractions
        if budget is not None:
            df['Lowest_Price'] = pd.to_numeric(df['Lowest_Price'], errors='coerce')
            df = df[df['Lowest_Price'] <= budget]
        new = recommend_by_rating(df, 'Name', 'Rating') or None

    if new and ('Name' in new or 'name' in new) and int(extra) < len(current_day['attractions']):
        current_day['attractions'][int(extra)] = new


else:
    new = {"error": "Invalid request or missing parameter."}

# --- Update MongoDB --- #
if 'name' in new:
    itinerary['change_history'][key].append(new['name'])
elif 'Name' in new:
    itinerary['change_history'][key].append(new['Name'])

try:
    db["GeneratedItineraries"].update_one(
        {"username": username, "itineraryName": itinerary_name},
        {"$set": {
            "change_history": itinerary['change_history'],
            f"days.{day_index}": current_day
        }}
    )
except Exception as e:
    print(json.dumps({"error": f"Failed to update MongoDB: {str(e)}"}))

# --- Final Output --- #
def clean_for_json(obj):
    if isinstance(obj, dict):
        return {k: clean_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_for_json(i) for i in obj]
    elif isinstance(obj, (np.int64, np.int32, np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, ObjectId):
        return str(obj)
    elif pd.isna(obj):
        return None
    else:
        return obj

#  Normalize keys for frontend compatibility (especially for Attractions)
if type_ == 'attraction' and new:
    key_mapping = {
        'Name': 'name',
        'Address': 'address',
        'City': 'city',
        'Rating': 'rating',
        'Lowest Price': 'price',
        'Latitude': 'latitude',
        'Longitude': 'longitude',
        'weburl': 'weburl',  # Only if valid and already exists
    }

    normalized = {}
    for old_key, new_key in key_mapping.items():
        value = new.get(old_key, None)

        # Skip placeholder values
        if isinstance(value, str) and value.strip().lower() in [
            'no website', 'no url', 'no price mentioned', 'no latitude', 'no longitude'
        ]:
            value = None

        # Convert price string to float
        if value and new_key == 'price' and isinstance(value, str) and 'lkr' in value.lower():
            try:
                value = float(value.lower().replace('lkr', '').replace(',', '').replace('rs.', '').strip())
            except:
                value = None

        # Convert coordinates to float
        if value and new_key in ['latitude', 'longitude']:
            try:
                value = float(value)
            except:
                value = None

        # Keep valid fields
        if value is not None:
            normalized[new_key] = value

    # Merge normalized values into result
    new.update(normalized)

    # Remove raw keys
    for raw_key in key_mapping.keys():
        if raw_key in new and raw_key != 'weburl':  # Don't remove already-clean 'weburl'
            del new[raw_key]


print(json.dumps(clean_for_json(new)) if ('name' in new or 'Name' in new) else json.dumps({"error": "No alternative found."}))

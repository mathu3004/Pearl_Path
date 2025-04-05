from pymongo import MongoClient
import pandas as pd
import sys
import traceback
sys.stdout.reconfigure(encoding='utf-8')  # ✅ Fix Windows printing

# ✅ MongoDB Connection
mongo_uri = "mongodb+srv://Pearlpath:DMEN2425@pearlpath.lq9jq.mongodb.net/?retryWrites=true&w=majority&appName=PearlPath"
client = MongoClient(mongo_uri)
db = client["itinerary_recommendations"]
collection = db["UserInputs"]
preprocessed_collection = db["PreUserInputs"]

# ✅ Step 1: Get CLI arguments
if len(sys.argv) < 3:
    print("❌ Error: Username and itinerary name required")
    sys.exit(1)

username = sys.argv[1].strip().lower()
itinerary_name = sys.argv[2].strip().lower()

try:
    # ✅ Step 2: Fetch from MongoDB
    itinerary = collection.find_one({"username": username, "itineraryName": itinerary_name})

    if not itinerary:
        print(f"❌ No itinerary found for user '{username}' and itinerary '{itinerary_name}'")
        sys.exit(1)

    print("📦 Raw Itinerary Fetched:", itinerary)

    # ✅ Step 3: Convert to DataFrame
    user_inputs = pd.DataFrame([itinerary])

    # ✅ Step 4: Rename columns
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
    user_inputs.rename(columns=rename_dict, inplace=True)

    # ✅ Step 5: Clean column names
    user_inputs.columns = [col.replace(' ', '_') for col in user_inputs.columns]

    # ✅ Step 6: Encode destination
    allowed_destinations = {'Kandy', 'Ella', 'Colombo', 'Nuwara Eliya'}
    def encode_destinations(dest_list):
        return [dest for dest in dest_list if dest in allowed_destinations]
    user_inputs['encoded_destination'] = user_inputs['destination'].apply(encode_destinations)

    # ✅ Step 7: Encode food preference
    food_preference_encoder = {'Veg': 1, 'Non-Veg': 3}
    user_inputs['encoded_food_preference'] = user_inputs['food_preference'].map(food_preference_encoder)

    # ✅ Step 8: Clean and normalize budget
    def clean_budget(budget_str):
        if pd.isna(budget_str) or not budget_str:
            return None
        budget_str = budget_str.replace(',', '').strip()
        if '-' in budget_str:
            parts = budget_str.split('-')
            if len(parts) == 2:
                lower, upper = map(float, parts)
                return (lower + upper) / 2
        elif '+' in budget_str:
            return float(budget_str.replace('+', ''))
        return float(budget_str)
    user_inputs['cleaned_budget_per_day'] = user_inputs['budget_per_day'].apply(clean_budget)

    # ✅ Step 9: Drop MongoDB _id to avoid duplicate key errors
    if "_id" in user_inputs.columns:
        user_inputs.drop(columns=["_id"], inplace=True)

    # ✅ Step 10: Save or update in PreUserInputs
    existing_preprocessed = preprocessed_collection.find_one({
        "username": username,
        "itineraryName": itinerary_name
    })

    if existing_preprocessed:
        preprocessed_collection.update_one(
            {"username": username, "itineraryName": itinerary_name},
            {"$set": user_inputs.to_dict(orient='records')[0]}
        )
        print(f"🔄 Updated preprocessed itinerary for '{username}' - '{itinerary_name}'")
    else:
        preprocessed_collection.insert_one(user_inputs.to_dict(orient='records')[0])
        print(f"✅ Inserted new preprocessed itinerary for '{username}' - '{itinerary_name}'")

except Exception as e:
    print("❌ Error during processing:", str(e))
    traceback.print_exc()
    sys.exit(1)

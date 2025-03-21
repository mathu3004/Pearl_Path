from pymongo import MongoClient
import pandas as pd
import numpy as np
from sklearn.preprocessing import MultiLabelBinarizer
import sys
import traceback

# MongoDB connection string
mongo_uri = "mongodb+srv://Pearlpath:DMEN2425@pearlpath.lq9jq.mongodb.net/?retryWrites=true&w=majority&appName=PearlPath"

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client["test"]  # Database name
collection = db["itineraries"]  # Collection name
preprocessed_collection = db["preitineraries"] 

# ✅ Fetch username and itinerary name from command-line arguments
if len(sys.argv) < 3:
    print("❌ Error: Username and itinerary name required")
    sys.exit(1)

username = sys.argv[1].strip()  # Trim spaces
itinerary_name = sys.argv[2].strip()

try:
    # Fetch the specific itinerary
    itinerary = collection.find_one({"username": username, "name": itinerary_name})

    if not itinerary:
        print(f"❌ No itinerary found for user '{username}' and name '{itinerary_name}'")
        sys.exit(1)

    # Convert MongoDB document to DataFrame
    df = pd.DataFrame([itinerary])

    # Rename fields for consistency with preprocessing script
    rename_dict = {
        "destinations": "destination",
        "numberOfDays": "numberofdays",
        "foodPreferences": "food_preference",
        "transportationMode": "transportation_mode",
        "peopleCount": "peoplecount",
        "maxDistance": "maximum_distance",
        "cuisines": "cuisine_preference",
        "activities": "activities_preference",
        "startingDestination": "startingDestination"
    }
    df.rename(columns=rename_dict, inplace=True)

    # Multi-label columns
    multi_label_columns = [
        "cuisine_preference",
        "activities_preference",
        "transportation_mode",
        "peoplecount",
        "destination"
    ]

    # Convert lists into strings and handle NaN values
    for column in multi_label_columns:
        if column in df.columns:
            df[column] = df[column].apply(lambda x: ', '.join(x) if isinstance(x, list) else (str(x) if pd.notna(x) else ''))
        else:
            print(f"Warning: Column '{column}' not found!")

    # Generate synthetic 'maximum_distance' for testing if missing
    if 'maximum_distance' not in df.columns:
        df['maximum_distance'] = np.random.randint(20, 41, size=len(df))

    # One-Hot Encoding using MultiLabelBinarizer
    mlb = MultiLabelBinarizer()
    encoded_data = pd.DataFrame()

    for column in multi_label_columns:
        if column in df.columns:
            df[column] = df[column].apply(lambda x: x.split(', ') if isinstance(x, str) else [])
            encoded = pd.DataFrame(mlb.fit_transform(df[column]),
                                columns=[f"{column}_{cls}" for cls in mlb.classes_],
                                index=df.index)
            encoded_data = pd.concat([encoded_data, encoded], axis=1)
        else:
            print(f"Warning: Column '{column}' not found in DataFrame!")

    # One-Hot Encoding for 'startingDestination' (single category column)
    if 'startingDestination' in df.columns:
        startingDestination_encoded = pd.get_dummies(df['startingDestination'], prefix='startingDestination').astype(int)
        df = df.drop(columns=['startingDestination'])
        df = pd.concat([df, startingDestination_encoded], axis=1)

    # One-Hot Encoding for 'food_preference' (single category column)
    if 'food_preference' in df.columns:
        food_preference_encoded = pd.get_dummies(df['food_preference'], prefix='food_preference').astype(int)
        df = df.drop(columns=['food_preference'])
        df = pd.concat([df, food_preference_encoded], axis=1)

    # Drop original multi-label columns
    df = df.drop(columns=multi_label_columns, errors='ignore')

    # Merge one-hot encoded columns
    df = pd.concat([df, encoded_data], axis=1)

    # Drop `_id` column to avoid duplicate key errors
    if "_id" in df.columns:
        df = df.drop(columns=["_id"])
    # ✅ Check if itinerary already exists in preprocessed collection
    existing_preprocessed = preprocessed_collection.find_one({"username": username, "name": itinerary_name})

    if existing_preprocessed:
        # ✅ Update only this itinerary
        preprocessed_collection.update_one(
            {"username": username, "name": itinerary_name},
            {"$set": df.to_dict(orient='records')[0]}
        )
        print(f"Updated existing preprocessed itinerary for '{username}' - '{itinerary_name}'")
    else:
        # ✅ Insert a new preprocessed itinerary
        preprocessed_collection.insert_one(df.to_dict(orient='records')[0])
        print(f"✅ Inserted new preprocessed itinerary for '{username}' - '{itinerary_name}'")

except Exception as e:
    print("❌ Error during processing:", str(e))
    traceback.print_exc()
    sys.exit(1)
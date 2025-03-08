from pymongo import MongoClient
import pandas as pd
import numpy as np
from sklearn.preprocessing import MultiLabelBinarizer

# MongoDB connection string
mongo_uri = "mongodb+srv://Pearlpath:DMEN2425@pearlpath.lq9jq.mongodb.net/?retryWrites=true&w=majority&appName=PearlPath"

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client["test"]  # Database name
collection = db["itineraries"]  # Collection name

# Fetch data from MongoDB
user_data = list(collection.find())

# Convert MongoDB JSON to DataFrame
df = pd.DataFrame(user_data)

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

# Drop original multi-label columns
df = df.drop(columns=multi_label_columns, errors='ignore')

# Merge one-hot encoded columns
df = pd.concat([df, encoded_data], axis=1)

# Drop `_id` column to avoid duplicate key errors
if "_id" in df.columns:
    df = df.drop(columns=["_id"])

# Clear the collection before inserting new data
preprocessed_collection = db["preitineraries"]
preprocessed_collection.delete_many({})  # Deletes all existing records

# Insert new preprocessed data
preprocessed_collection.insert_many(df.to_dict(orient='records'))

print("Preprocessed data saved successfully in MongoDB!")
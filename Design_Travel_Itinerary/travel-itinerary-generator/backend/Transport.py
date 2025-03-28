#Transport.py
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["your_database_name"]  # Replace with your actual DB name

generated_itineraries = db["GeneratedItineraries"]
pre_itineraries = db["preItineraries"]

# Get user's selected transport modes from preItineraries
def get_user_transport_modes(username, name):
    pre_itinerary = pre_itineraries.find_one({
        "username": username,
        "name": name
    })

    if not pre_itinerary:
        return ["walk"]  # fallback default

    transport_modes = []
    for key in pre_itinerary:
        if key.startswith("transportation_mode_") and pre_itinerary[key] == 1:
            mode = key.replace("transportation_mode_", "").lower()
            transport_modes.append(mode)

    return transport_modes if transport_modes else ["walk"]

# Inject transport mode into each day's itinerary
def assign_transport_modes_to_itinerary(itinerary, transport_modes):
    updated_itinerary = {}

    for i, (day_key, day_data) in enumerate(itinerary.items()):
        mode = transport_modes[i % len(transport_modes)]  # rotate if multiple
        day_data["transportationMode"] = mode
        updated_itinerary[day_key] = day_data

    return updated_itinerary

# Route: Get modified itinerary with transport modes
@app.route("/api/itineraries/<username>/<name>", methods=["GET"])
def get_itinerary(username, name):
    itinerary_doc = generated_itineraries.find_one({
        "username": username,
        "name": name
    })

    if not itinerary_doc or "itinerary" not in itinerary_doc:
        return jsonify({"error": "Itinerary not found"}), 404

    transport_modes = get_user_transport_modes(username, name)

    updated_itinerary = assign_transport_modes_to_itinerary(
        itinerary_doc["itinerary"],
        transport_modes
    )

    itinerary_doc["itinerary"] = updated_itinerary

    return jsonify(itinerary_doc), 200

if __name__ == "__main__":
    app.run(debug=True)
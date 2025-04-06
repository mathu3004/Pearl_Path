# Pearl Path Chatbot

## Overview
Pearl Path Chatbot is a web application that provides a chatbot interface for users to get information about travel destinations, recommendations for hotels and restaurants, and emergency assistance. The chatbot is named Pearlie and is designed to assist users with planning their trips.

## Features
- **Emergency Assistance**: Provides information about nearby hospitals, police stations, embassies, and immediate medical support.
- **Information Hub**: Offers detailed information about attractions in Kandy, Nuwara Eliya, Ella, and Colombo.
- **User-Provider Connection**: Fetches specific details like contact information, email, price, location, amenities, etc., for hotels and restaurants.
- **Recommendations**: Suggests hotels, restaurants, and attractions based on user preferences.
- **Chatbot Information**: Provides information about the chatbot and the trip itinerary application.

## Tech Stack
- **Frontend**: React
- **Backend**: Flask
- **Database**: MongoDB
- **Model**: Google's Gemini LLM (LangChain)
- **Web Search**: Serper API

## How It Works
- **Emergency Assistance**: The chatbot identifies emergency-related queries and provides relevant information using web search results.
- **Information Hub**: The chatbot fetches detailed information about attractions using web search results.
- **User-Provider Connection**: The chatbot retrieves specific details about hotels and restaurants from MongoDB and provides structured responses.
- **Recommendations**: The chatbot suggests hotels, restaurants, and attractions based on user preferences using web search results.
- **Chatbot Information**: The chatbot provides information about itself and the trip itinerary application.

# Travel Itinerary Generator with Radius
This component of Pearl Path is an intelligent travel itinerary planner that generates personalized trip plans for users based on a geographic radius. It leverages clustering and filtering techniques to recommend attractions, hotels, and restaurants within a specified distance from the user’s chosen destination. The model ensures that the recommended places not only match user preferences like cuisine, dietary requirements, and activity interests but are also geographically feasible by applying distance-based constraints. The final itinerary is visualized on an interactive map using OpenStreetMap for intuitive location tracking.

## Features
- Personalized recommendations for hotels, attractions, and restaurants.
- Radius-based filtering to ensure proximity relevance.
- Clustering of attractions using PCA and DBSCAN for activity-based grouping.
- Cuisine and dietary filtering for restaurant recommendations.
- Dynamic model training using Random Forest and Scikit-learn.
- Support for alternative recommendations for flexibility.
- Allows users to modify itinerary selections dynamically.
- Interactive itinerary map rendered using OpenStreetMap with markers for each location.
  
## Overview
This application intelligently assigns:
- **Hotels** using a RandomForestRegressor that matches user preferences and budget.
- **Restaurants** for breakfast, lunch, and dinner via a RandomForestClassifier using dietary and cuisine filters.
- **Attractions** using PCA + DBSCAN clustering to ensure activity diversity while adhering to distance constraints.
- **Alternatives** for each main recommendation to ensure flexibility and user choice.
- **Radius** filtering to ensure that all recommended places are within the specified maximum distance from the destination.
- Visual display of the complete itinerary with markers on OpenStreetMap.

## Key Highlights
- Trained models with a structured feature selection pipeline.
- Attraction clustering ensures activity diversity and user-preference mapping.
- Uses geopy for precise distance calculations.
- Cleanly separates model training, preprocessing, and recommendation logic for modularity.
- Ensures uniqueness in daily plans across attractions and restaurants.
- Dynamic itinerary modification is supported through an interactive interface.
- Integrated OpenStreetMap with Leaflet.js to visualize all recommended places on an interactive map.

## Tech Stack
- **Language:** Python
- **Libraries:** pandas, scikit-learn, geopy, numpy, matplotlib
- **Clustering:** PCA, DBSCAN
- **Modeling:** RandomForestRegressor, RandomForestClassifier
- **Distance Calculation:** geopy.distance
- **Frontend Mapping:** OpenStreetMap via Leaflet.js
- **Database:** MongoDB 

## How It Works
- **Data Preprocessing:**
    - Raw datasets for hotels, attractions, and restaurants are cleaned and encoded.
    - Cuisine, dietary, activity types, and price ratings are extracted and processed.
- **Hotel Recommendation:**
    - Uses RandomForestRegressor to predict the most suitable hotel per destination within budget.
- **Attraction Recommendation:**
    - Applies PCA for dimensionality reduction on attraction features.
    - Uses DBSCAN clustering to group attractions by activity type.
    - Filters attractions by radius and selects 2 per day, ensuring activity diversity.
- **Restaurant Recommendation:**
    - Trains RandomForestClassifier using top 10 numeric features.
    - Filters options based on meal type (breakfast/lunch/dinner), cuisine, dietary preferences, and location radius.
- **Alternative Generation:**
    - For each place (hotel, restaurant, attraction), generates 3 additional options excluding the primary recommendation.
    - If preferences result in insufficient options, filters are relaxed while still prioritizing relevance.
- **Distance Constraint Application:**
    - Every recommendation (main + alternatives) is verified to be within the defined maximum radius from the destination using geopy.
- **Itinerary Modification**
    - Users can dynamically modify their itinerary:
    - Change individual restaurant and attraction recommendations.
    - Delete individual hotel, restaurant or attraction recommendations.
    - Save updated itineraries, preserving personalization and proximity filters.
- **Map Visualization**
    - All recommended places (hotels, restaurants, attractions) are displayed as markers on an interactive map using OpenStreetMap.
    - Helps users easily understand the geographical layout of their itinerary and distances between locations.

# Travel Itinerary Generator Without Radius
This component of Pearl Path is a machine learning-powered travel planning system that generates personalized itineraries based on user preferences such as destination, budget, cuisines, dietary needs, activities, and number of days—without applying any distance or radius constraints. Instead of location proximity, it uses content-based filtering, collaborative filtering, and feature relevance to deliver intelligent and diverse daily travel recommendations.

## Features
- Generates daily travel itineraries based on user input
- Recommends:
    - One hotel per city (max 3-day stay)
    - Three restaurants per day (breakfast, lunch, dinner)
    - Two unique attractions per day based on activities
- Interactive modification of restaurant and attraction recommendations after generation
- Map visualization of all itinerary points using OpenStreetMap
- Ensures no duplicate entries across meals or attractions
- Clean, personalized suggestions using ML-driven filtering techniques

## Key Highlights
- Personalized plans based on city, budget, food preferences and activity interests
- Hotel recommendations using content-based filtering and collaborative filtering (SVD)
- Restaurant recommendations filtered by meal types, cuisines, dietary needs, and budget
- Attraction recommendations using TF-IDF + cosine similarity based on activity categories
- Dynamic frontend built with React for a seamless user experience
- Real-time itinerary editing with updated suggestions
- Integrated map view of hotel, restaurant and attraction locations

## Tech Stack
- **Frontend:** React
- **Backend:** Python (Flask-based API)
- **Database:** MongoDB
- **Machine Learning & Recommendation:**
    - Content-Based Filtering (TF-IDF, Cosine Similarity)
    - Collaborative Filtering (SVD)
    - Data preprocessing and encoding using pandas and scikit-learn
- **Mapping & Visualization:** OpenStreetMap + Leaflet.js

## How It Works
- **User Input Form:**
    - Users fill in trip details including destination(s), number of travel days, budget, cuisines, food preferences, and activity interests.
- **Preprocessing:**
    - Encodes destinations, cuisines, dietary preferences, and meal types
    - Cleans and standardizes price and rating fields
- **Hotel Matching:**
    - Combines content-based and collaborative filtering
    - Filters hotels by budget and destination
    - Ranks hotels based on rating, ranking position, and feature similarity
- **Restaurant Matching:**
    - Matches restaurants based on cuisine, dietary restrictions, and meal types
    - Filters by city and budget
    - Calculates a custom match score and returns the best-fitting options
- **Attraction Matching:**
    - Uses TF-IDF to compute similarity between user activities and attraction descriptions
    - Filters attractions by city and price
    - Sorts by similarity and popularity
- **Itinerary Assembly:**
    - Assigns one hotel per city (maximum 3 consecutive days)
    - Recommends three different restaurants per day
    - Recommends two unique attractions per day
    - Ensures diversity and no duplicate selections
- **Modification & Map Display:**
    - Users can modify specific recommendations (restaurant, attraction) after itinerary generation
    - Users can delete individual restaurant, attraction or hotel recommendations
    - All destinations are plotted interactively on a map using OpenStreetMap and Leaflet
 
# How to Run the Application (in GitHub Codespaces)

**Prerequisites**
- You are working inside a GitHub Codespace.
- MongoDB is already running (locally or remotely).
- All required packages are installed via npm install.

## Steps to Start the Application

**Step 1: Start Backend Using package.json**
- In the Codespace file explorer, open the folder:
/workspaces/Pearl_Path/Design_Travel_Itinerary/travel-itinerary-generator/backend
- Open the package.json file.
- Locate the script: "start:all": "node Startserver.js"
- Click the Run button next to it to start the backend server. This will run the backend at: http://localhost:5002

**Step 2: Start Frontend from Terminal**
- Open a new terminal in the Codespace.
- Navigate to the root folder:
/workspaces/Pearl_Path/Design_Travel_Itinerary/travel-itinerary-generator
- Run the following command: npm start
- This will start the frontend server at: http://localhost:3000

**Application Access**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5002

# MongoDB Collections

- **itinerary_recommendations (used in non-radius itinerary generation)**
This database stores collections related to standard travel itinerary generation (without radius filtering):
  - Attractions
  - GeneratedItineraries
  - Hotels
  - PreUserInputs
  - Restaurants
  - SavedItineraries
  - UserInputs
 
-  **test (used in radius-based itinerary generation)**
This database is used for the version of the itinerary generator that includes radius-based filtering and location-aware clustering:
  - Attractions
  - Hotels
  - Restaurants
  - User
  - generated_itineraries
  - itineraries
  - preitineraries
  - saved_itineraries
  - users
  - vendors

- **chatbot (used for the travel chatbot component)**
This database powers the chatbot system, including hotel and restaurant queries:
  - attractions
  - hotels
  - restaurants











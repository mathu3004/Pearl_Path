# Pearl Path – Travel Itinerary Generator
Pearl Path is an AI-powered travel planning platform designed to generate highly personalized and flexible travel itineraries based on user preferences. Whether users are planning a multi-day trip or looking for nearby recommendations, Pearl Path offers intelligent suggestions for hotels, restaurants, and attractions using machine learning models, clustering techniques, and real-time filtering.

The platform consists of two main itinerary generation modes:

  - With Radius Filtering: Ensures all recommended places are geographically feasible and activity-balanced.
  - Without Radius Filtering: Uses content-based and collaborative filtering to provide personalized plans based on interests and preferences, without proximity constraints.

Additionally, Pearl Path features an integrated chatbot assistant (Pearlie) that helps users find emergency information, destination details, and place recommendations—all through natural conversation.

Built with a modular architecture and a modern tech stack (React, Flask, MongoDB, scikit-learn, OpenStreetMap), Pearl Path ensures a seamless and intelligent trip planning experience from start to finish.

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

## Project File Structure

```bash
Design_Travel_Itinerary/travel-itinerary-generator
├── backend/
│   ├── models/
│   ├── app.py
│   ├── change_recommendation.py
│   ├── config.py
│   ├── input_preprocessing.py
│   ├── Itineraryapp.py
│   ├── Itineraryserver.js
│   ├── Radiusapp.py
│   ├── RadiusBasedGenerator.py
│   ├── Radiusserver.js
│   ├── Startserver.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── public/
│   ├── assets/
│   ├── favicon.ico
│   ├── _.jpg (Images)
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── ChatBox.js
│   │   ├── ChatWidget.js
│   │   ├── Layout.js
│   │   ├── Message.js
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   ├── context/
│   │   ├── auth.context.jsx
│   ├── pages/
│   ├── router/
│   │   ├── ProtectedRoute.jsx
│   ├── App.js
│   ├── App.test.js
│   ├── index.js
│   ├── index.css
│   ├── ItineraryApp.css
│   ├── ModifyItinerary.js
│   ├── ModifyRequest.js
│   ├── RadiusMapComponent.js
│   ├── RadiusModify.js
│   ├── RadiusModifyRequest.js
│   ├── RadiusTravelItineraryGenerator.js
│   ├── RadiusVisual.js
│   ├── TravelItineraryGenerator.js
│   ├── TravelItineraryRadius.css
│   └── VisualizationItinerary.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```
## How to Run the Application (in GitHub Codespaces)

### Prerequisites
- You are working **inside a GitHub Codespace**.
- **MongoDB** is already running (locally or remotely).
- All dependencies are installed by running:
  ```bash
  npm install
  ```

---

## Step-by-Step Instructions

### Step 1: Start Backend Servers

You need to run **three backend servers** and a **chatbot server**.

#### 1️ Signin/Signup Server (Port: 5002)
- Path:  
  `/workspaces/Pearl_Path/Design_Travel_Itinerary/travel-itinerary-generator/backend`
- In the **Codespace file explorer**, open `package.json`.
- Locate the script:
  ```json
  "start:all": "node Startserver.js"
  ```
- Click the **Run** button next to the script OR run manually:
  ```bash
  npm run start:all
  ```
- This starts the backend at:  
  `http://localhost:5002`

#### 2️ Itinerary Generator Server (Port: 5001)  
- Launched through the same `Itineraryserver.js`.  
  Ensure the routes and server logic are correctly configured to run on port `5001`.

#### 3️ Radius-Based Itinerary Generator Server (Port: 5003)  
- Also initiated within the same `Radiusserver.js` or as a separate process if required.

---

### Step 2: Start Chatbot Server (Port: 5000)
- Navigate to the backend folder:
  ```bash
  cd /workspaces/Pearl_Path/Design_Travel_Itinerary/travel-itinerary-generator/backend
  ```
- Start the chatbot server:
  ```bash
  python app.py
  ```

---

### Step 3: Start Frontend Application
- Open a **new terminal** in your Codespace.
- Navigate to the frontend root folder:
  ```bash
  cd /workspaces/Pearl_Path/Design_Travel_Itinerary/travel-itinerary-generator
  ```
- Start the frontend React app:
  ```bash
  npm start
  ```
- Access the frontend in your browser at:  
  `http://localhost:3000`

---

## Server Overview

| Server                    | Port   | Description                            |
|---------------------------|--------|----------------------------------------|
| Frontend (React App)      | 3000   | User Interface                         |
| Chatbot Server            | 5000   | Python Flask app for chatbot logic     |
| Itinerary Generator       | 5001   | Backend logic for itinerary generation |
| Signin/Signup Server      | 5002   | Handles authentication                 |
| Radius-Based Generator    | 5003   | Alternative itinerary logic by radius  |

---

## Notes
- Ensure all required environment variables and MongoDB URIs are configured.
- The app uses `localStorage` for maintaining login sessions.
- You can modify port configurations in the corresponding server files.

---

## MongoDB Collections

### Database: `itinerary_recommendations`  
Used in **standard (non-radius)** itinerary generation.

| Collection Name        | Purpose                                                                 |
|------------------------|-------------------------------------------------------------------------|
| `Attractions`          | Stores detailed data on attractions used for recommendation.            |
| `GeneratedItineraries`| Holds final itineraries generated for users.                             |
| `Hotels`               | Contains hotel information for prediction and selection.                |
| `PreUserInputs`        | Temporarily stores processed user inputs for recommendation use.        |
| `Restaurants`          | Contains restaurant details for classification and filtering.           |
| `SavedItineraries`     | Stores itineraries users have explicitly saved.                         |
| `UserInputs`           | Stores raw form input from users before processing.                     |

---

### Database: `test`  
Used in **radius-based itinerary generation** with location clustering.

| Collection Name         | Purpose                                                                 |
|--------------------------|--------------------------------------------------------------------------|
| `Attractions`            | Stores location-based attraction data.                                  |
| `Hotels`                 | Stores hotels with coordinates for distance-based filtering.            |
| `Restaurants`            | Stores restaurants for location-aware selection.                        |
| `generated_itineraries` | Stores generated itineraries with radius filtering.                     |
| `itineraries`            | Stores raw input data for radius-based generation.                      |
| `preitineraries`         | Stores preprocessed data before generating radius itineraries.          |
| `saved_itineraries`      | Stores user-saved radius-based itineraries.                             |
| `users`                  | Stores registered user profiles for authentication.                     |
| `vendors`                | Stores vendor (business) account details.                               |

---

### Database: `chatbot`  
Used in the **chatbot system** for answering travel-related queries.

| Collection Name | Purpose                                                              |
|------------------|----------------------------------------------------------------------|
| `attractions`     | Contains attractions data for chatbot queries.                     |
| `hotels`          | Stores hotel data accessible by chatbot interactions.              |
| `restaurants`     | Stores restaurant info the chatbot can respond with or suggest.    |


# Acknowledgement

We would like to express our sincere gratitude to our module coordinator, Mr. Prasan Yapa, for his consistent guidance, encouragement, and timely reminders throughout the course of this project. His continuous push for excellence and constructive feedback helped us stay focused and meet every milestone with clarity and purpose.

A special thank you goes to our supervisor, Mr. Imesh Pathirana, whose unwavering support and mentorship were instrumental from the beginning to the very end of this journey. His insightful suggestions, patient guidance, and practical solutions helped us overcome challenges, resolve conflicts, and stay united as a team. His dedication truly inspired us to push beyond our limits and achieve the best version of this project.

Finally, we would like to extend our heartfelt thanks to our families, friends, and everyone who supported us throughout this process. Your encouragement and belief in us made all the difference.

# Contributors

**For any questions or issues, feel free to contact the following members:** 

### Mathusha Kannathasan – [mathusha.20233136@iit.ac.lk](mailto:mathusha.20233136@iit.ac.lk)
**Main Role:** Machine Learning Engineer (Team Leader)
- Trained machine learning models for the itinerary generator with maximum radius and dynamic itinerary modification.  
- Developed the backend to support radius-based itinerary generation and recommendation logic.  
- Built the frontend interface for the radius-based itinerary generator, ensuring smooth user interaction.  
- **Also contributed to:** Data collection and preprocessing.

---

### Ehansa Amavindi Gajanayaka – [ehansa.20232972@iit.ac.lk](mailto:ehansa.20232972@iit.ac.lk)
**Main Role:** Machine Learning Engineer  
- Trained machine learning models for the itinerary generator without radius and supported itinerary modification.  
- Developed the backend logic for non-radius-based itinerary generation and management.  
- Designed and implemented the frontend for the non-radius itinerary generator.  
- **Also contributed to:** Data collection and preprocessing.

---

### Denuri Chamathvie Manage – [denuri.20230036@iit.ac.lk](mailto:denuri.20230036@iit.ac.lk)
**Main Role:** Chatbot Developer  
- **LLM Integration:** Integrated Google’s Gemini to power the chatbot with travel planning and emergency support.  
- **Backend:** Built the chatbot’s backend using Flask and MongoDB for API handling and LLM communication.  
- **Frontend:** Developed a React-based chatbot interface with a draggable chat widget for smooth user interaction.  
- **Also contributed to:** Data collection and preprocessing.

---

### Neelia Makuloluwa – [neelia.20232613@iit.ac.lk](mailto:neelia.20232613@iit.ac.lk)
**Main Role:** Web Developer  
- Developed the frontend for sign in, sign up, home and about us and component selection to ensure intuitive user interface.  
- Integrated user profile functionality with MongoDB for efficient data management and seamless interaction.  
- **Also contributed to:** Data collection and preprocessing.

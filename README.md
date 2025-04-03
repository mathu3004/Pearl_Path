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
-**Emergency Assistance**: The chatbot identifies emergency-related queries and provides relevant information using web search results.
-**Information Hub**: The chatbot fetches detailed information about attractions using web search results.
-**User-Provider Connection**: The chatbot retrieves specific details about hotels and restaurants from MongoDB and provides structured responses.
-**Recommendations**: The chatbot suggests hotels, restaurants, and attractions based on user preferences using web search results.
-**Chatbot Information**: The chatbot provides information about itself and the trip itinerary application.

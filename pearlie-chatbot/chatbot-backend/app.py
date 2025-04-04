from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from pymongo import MongoClient
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import http.client
from bson import ObjectId
import config

app = Flask(__name__)
CORS(app)

# MongoDB connection details
mongo_uri = config.MONGO_URI
client = MongoClient(mongo_uri)
db = client.chatbot

# Initialize the Gemini LLM client with the API key
gemini_api_key = config.GEMINI_API_KEY
gemini_llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=gemini_api_key)

# Define the prompts for each functionality
emergency_prompt = PromptTemplate(
    input_variables=["input"],
    template="Determine if the following input is related to emergency assistance, such as requests for nearby hospitals, police stations, embassies, or immediate medical support in Kandy, Ella, Nuwara Eliya, or Colombo. For example, if the user asks about CPR or how to give CPR or what are the closest embassies or the contact numbers of particular services like the police station, hospitals, and establishments like that, the query sent by the user should be identified as an input related to emergency assistance: {input}\n\nOnly return 'yes' or 'no'."
)

information_prompt = PromptTemplate(
    input_variables=["input"],
    template="Determine if the sent input is related to the information hub. Which means the user has asked specifically for details regarding an attraction in Kandy, Nuwara Eliya, Ella, or Colombo. Also, it asks about general information about the attraction like the history. General information in the sense if the user asks for dates a particular attraction was built or who built this particular attraction, where this attraction is located, or any detail that gives them facts about the place: {input}\n\nOnly return 'yes' or 'no'."
)

connection_prompt = PromptTemplate(
    input_variables=["input"],
    template="Determine if the following input is related to the user asking for specific details like contact information, email, price, location, amenities, cuisines, features, meal types, dietary restrictions, or booking URL of a particular service provider such as a hotel or restaurant. The user is not asking for general recommendations or information but specific details about an establishment. For example, 'what is the phone number of Hotel X' or 'provide the email of Restaurant Y' or 'amenities of Hotel Z': {input}\n\nOnly return 'yes' or 'no'."
)

recommendation_prompt = PromptTemplate(
    input_variables=["input"],
    template="Determine if the following input is related to recommendations functionality. This means the user is asking for suggestions or alternatives for hotels, restaurants, or attractions in Kandy, Colombo, Ella, or Nuwara Eliya. The user is looking for names of locations, not detailed information about them. For example, 'recommend me 7 hotels in kandy' or 'suggest some restaurants in Ella': {input}\n\nOnly return 'yes' or 'no'."
)

chatbot_info_prompt = PromptTemplate(
    input_variables=["input"],
    template="This functionality should be activated if only the user asks for information about the chatbot and the trip itinerary application the chatbot is connected to. The chatbot's name is Pearlie, and it is designed to assist users with planning their trips by providing specific details of the providers, history and facts about attractions, make recommendations about attractions, hotels, and restaurants in various locations and even provides emergency assistance. The trip itinerary application as a whole allows users to create and manage their travel plans by allowing them to customize their itinerary plan based on radius or without radius involved. If the user asks about the chatbot or the application, provide a detailed explanation based on the information given. Make sure to refer to yourself as Pearlie and answer the questions in your perspective like saying 'my name is Pearlie' if they ask your name: {input}\n\nOnly return 'yes' or 'no'"
)

# Create chains for each functionality
emergency_chain = LLMChain(llm=gemini_llm, prompt=emergency_prompt)
information_chain = LLMChain(llm=gemini_llm, prompt=information_prompt)
connection_chain = LLMChain(llm=gemini_llm, prompt=connection_prompt)
recommendation_chain = LLMChain(llm=gemini_llm, prompt=recommendation_prompt)
chatbot_info_chain = LLMChain(llm=gemini_llm, prompt=chatbot_info_prompt)

# Function to analyze user input using LangChain and Gemini API
def analyze_input(user_input):
    try:
        # Run the input through each chain to determine the functionality
        emergency_response = emergency_chain.run(input=user_input)
        information_response = information_chain.run(input=user_input)
        connection_response = connection_chain.run(input=user_input)
        recommendation_response = recommendation_chain.run(input=user_input)
        chatbot_info_response = chatbot_info_chain.run(input=user_input)

        # Determine the functionality based on the responses
        if "yes" in chatbot_info_response.lower():
            return "chatbot_info"
        elif "yes" in emergency_response.lower():
            return "emergency_assistance"
        elif "yes" in information_response.lower():
            return "information_hub"
        elif "yes" in connection_response.lower():
            return "user_provider_connection"
        elif "yes" in recommendation_response.lower():
            return "recommendations"
        else:
            return "unknown"
    except Exception as e:
        print(f"Error analyzing input: {e}")
        return "unknown"

# Function to fetch provider details from MongoDB
def fetch_provider_details(collection_name, query):
    try:
        collection = db[collection_name]
        result = collection.find_one(query)
        return result
    except Exception as e:
        print(f"Error fetching provider details: {e}")
        return None

# Function to handle user-provider connection
def handle_user_provider_connection(user_input):
    try:
        # Extract relevant information from user input
        keywords = user_input.lower().split()
        category = None
        name = None

        if "hotel" in keywords:
            collection_name = "hotels"
            name_index = keywords.index("hotel") + 1
            name = " ".join(keywords[name_index:name_index+3])  # Capture up to 3 words for the name
        elif "restaurant" in keywords:
            collection_name = "restaurants"
            name_index = keywords.index("restaurant") + 1
            name = " ".join(keywords[name_index:name_index+3])  # Capture up to 3 words for the name
        else:
            return "Sorry, I didn't understand that. Can you be more specific?"

        # Fetch provider details from MongoDB
        query = {"name": {"$regex": f".*{name}.*", "$options": "i"}}
        provider_details = fetch_provider_details(collection_name, query)

        if provider_details:
            # Convert ObjectId to string
            if "_id" in provider_details:
                provider_details["_id"] = str(provider_details["_id"])

            # Use Gemini to generate a structured answer based on the provider details and user query
            connection_prompt = PromptTemplate(
                input_variables=["provider_details", "user_query"],
                template="Based on the following provider details, provide a structured answer to the user's query: {user_query}\n\nProvider Details: {provider_details}"
            )
            connection_chain = LLMChain(llm=gemini_llm, prompt=connection_prompt)
            connection_response = connection_chain.run(provider_details=json.dumps(provider_details), user_query=user_input)
            return format_response(connection_response)
        else:
            return "Sorry, I couldn't find the details for that provider."
    except Exception as e:
        print(f"Error handling user-provider connection: {e}")
        return "Sorry, I encountered an error while processing your request. Please try again."

# Function to perform a web search using Serper API and extract information
def web_search(query, api_key):
    try:
        conn = http.client.HTTPSConnection("google.serper.dev")
        payload = json.dumps({
            "q": query
        })
        headers = {
            'X-API-KEY': api_key,
            'Content-Type': 'application/json'
        }
        conn.request("POST", "/search", payload, headers)
        res = conn.getresponse()
        data = res.read()
        response = json.loads(data.decode("utf-8"))

        if res.status == 200:
            return response
        else:
            print(f"Error: Received status code {res.status}")
            return {}
    except Exception as e:
        print(f"Error performing web search: {e}")
        return {}

# Function to handle recommendations
def handle_recommendations(user_input, api_key):
    try:
        # Perform a web search to gather recommendations using Serper API
        response = web_search(user_input, api_key)
        organic = response.get("organic", [])

        if organic:
            # Use Gemini to generate a relevant answer based on the organic data
            organic_prompt = PromptTemplate(
                input_variables=["organic", "user_query"],
                template="Based on the following organic search results, provide a relevant answer to the user's query: {user_query}\n\nOrganic Search Results: {organic}"
            )
            organic_chain = LLMChain(llm=gemini_llm, prompt=organic_prompt)
            organic_response = organic_chain.run(organic=json.dumps(organic), user_query=user_input)
            return format_response(organic_response)
        else:
            return "Sorry, I couldn't find any recommendations for that location."
    except Exception as e:
        print(f"Error handling recommendations: {e}")
        return "Sorry, I encountered an error while processing your request. Please try again."

# Function to handle information hub
def handle_information_hub(user_input, api_key):
    try:
        # Perform a web search to gather information using Serper API
        response = web_search(user_input, api_key)
        knowledge_graph = response.get("knowledgeGraph", {})
        answer_box = response.get("answerBox", {})

        if knowledge_graph:
            # Use Gemini to generate a relevant answer based on the knowledge graph
            knowledge_graph_prompt = PromptTemplate(
                input_variables=["knowledge_graph", "user_query"],
                template="Based on the following knowledge graph, provide a relevant answer to the user's query: {user_query}\n\nKnowledge Graph: {knowledge_graph}"
            )
            knowledge_graph_chain = LLMChain(llm=gemini_llm, prompt=knowledge_graph_prompt)
            knowledge_graph_response = knowledge_graph_chain.run(knowledge_graph=json.dumps(knowledge_graph), user_query=user_input)
            return format_response(knowledge_graph_response)
        elif answer_box:
            # Use Gemini to generate a relevant answer based on the answer box
            answer_box_prompt = PromptTemplate(
                input_variables=["answer_box", "user_query"],
                template="Based on the following answer box, provide a relevant answer to the user's query: {user_query}\n\nAnswer Box: {answer_box}"
            )
            answer_box_chain = LLMChain(llm=gemini_llm, prompt=answer_box_prompt)
            answer_box_response = answer_box_chain.run(answer_box=json.dumps(answer_box), user_query=user_input)
            return format_response(answer_box_response)
        else:
            return "Sorry, I couldn't find any information about that attraction."
    except Exception as e:
        print(f"Error handling information hub: {e}")
        return "Sorry, I encountered an error while processing your request. Please try again."

# Function to handle emergency assistance
def handle_emergency_assistance(user_input, api_key):
    try:
        # Perform a web search to gather information using Serper API
        response = web_search(user_input, api_key)
        organic = response.get("organic", [])

        if organic:
            # Use Gemini to generate a relevant answer based on the organic data
            organic_prompt = PromptTemplate(
                input_variables=["organic", "user_query"],
                template="Based on the following organic search results, provide a relevant answer to the user's query: {user_query}\n\nOrganic Search Results: {organic}"
            )
            organic_chain = LLMChain(llm=gemini_llm, prompt=organic_prompt)
            organic_response = organic_chain.run(organic=json.dumps(organic), user_query=user_input)
            return format_response(organic_response)
        else:
            return "Sorry, I couldn't find any information about that emergency service."
    except Exception as e:
        print(f"Error handling emergency assistance: {e}")
        return "Sorry, I encountered an error while processing your request. Please try again."

# Function to handle chatbot information
def handle_chatbot_info(user_input):
    try:
        # Predefined explanation about the chatbot and the application
        explanation = """
        Pearlie is your personal trip planning assistant chatbot. I assist users with planning their trips by providing specific details about travel providers, sharing fascinating history and facts about attractions, recommending amazing places to visit, suggesting hotels and restaurants that fit your needs, and even offering emergency assistance if you need it.

        The trip itinerary application I'm connected to helps you create and manage your perfect travel plans. It allows you to customize your itinerary based on your preferences. You can plan your trip by specifying a radius around a particular location, focusing on attractions and services within that area. Or, if you prefer, you can plan without a radius, selecting attractions and accommodations from a wider area, based on your specific interests and needs. The application's goal is to put you in control of your travel experience, making it easy to organize and enjoy every moment of your trip.
        """

        # Use the LLM to generate a relevant answer based on the explanation and the user's query
        chatbot_info_prompt = PromptTemplate(
            input_variables=["explanation", "user_query"],
            template="Based on the following explanation, provide a concise and relevant answer to the user's query: {user_query}\n\nExplanation: {explanation}"
        )
        chatbot_info_chain = LLMChain(llm=gemini_llm, prompt=chatbot_info_prompt)
        chatbot_info_response = chatbot_info_chain.run(explanation=explanation, user_query=user_input)
        return format_response(chatbot_info_response)
    except Exception as e:
        print(f"Error handling chatbot information: {e}")
        return "Sorry, I encountered an error while processing your request. Please try again."

# Function to check if the user is ending the conversation
def is_conversation_ending(user_input):
    ending_phrases = ["thank you", "ok", "bye", "goodbye", "thanks"]
    return any(phrase in user_input.lower() for phrase in ending_phrases)

# Function to format the response for better display
def format_response(response):
    # Remove any unnecessary characters and ensure each point starts on a new line
    formatted_response = response.replace("*", "").replace("-", "").strip()
    formatted_response = "\n".join(line.strip() for line in formatted_response.split("\n"))
    return formatted_response

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('message')

    # Check if the user is ending the conversation
    if is_conversation_ending(user_input):
        return jsonify({"response": "If you have any more questions, feel free to ask. Have a great day!"})

    # Analyze the user input using LangChain and Gemini API
    functionality = analyze_input(user_input)

    # Handle the identified functionality
    if functionality == "chatbot_info":
        chatbot_info = handle_chatbot_info(user_input)
        return jsonify({"response": chatbot_info})
    elif functionality == "emergency_assistance":
        assistance_info = handle_emergency_assistance(user_input, config.SERPER_API_KEY)
        return jsonify({"response": assistance_info})
    elif functionality == "information_hub":
        information = handle_information_hub(user_input, config.SERPER_API_KEY)
        return jsonify({"response": information})
    elif functionality == "user_provider_connection":
        provider_details = handle_user_provider_connection(user_input)
        return jsonify({"response": provider_details})
    elif functionality == "recommendations":
        recommendations = handle_recommendations(user_input, config.SERPER_API_KEY)
        return jsonify({"response": recommendations})
    else:
        return jsonify({"response": "Sorry, I didn't understand that. Can you please rephrase or be a bit more specific?"})

if __name__ == "__main__":
    app.run(debug=True)

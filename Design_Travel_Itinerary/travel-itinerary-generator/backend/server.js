require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS Configuration
const corsOptions = {
    origin: '*', // Allow all origins (for development)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization'
};
app.use(cors(corsOptions));

// Connect to MongoDB using the MONGO_URI from .env
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// Define Itinerary Schema
const itinerarySchema = new mongoose.Schema({
    name: { type: String, required: true },
    startingDestination: { type: String, required: true },
    destinations: { type: [String], required: true },
    activities: { type: [String], required: true },
    cuisines: { type: [String], required: true },
    foodPreferences: { type: String, required: true },
    transportationMode: { type: [String], required: true },
    maxDistance: { type: Number, required: true },  // Fixed: Use Number instead of Int16Array
    numberOfDays: { type: Number, required: true },  // Fixed: Use Number instead of Int16Array
    peopleCount: { type: String, required: true }  // Fixed: Change to Number if it's a count
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

// API Endpoint to Save Itinerary Data
app.post('/api/itinerary', async (req, res) => {
    try {
        let {
            name,
            startingDestination,
            destinations,
            activities,
            cuisines,
            foodPreferences,
            transportationMode,
            maxDistance,
            numberOfDays,
            peopleCount
        } = req.body;

        // Log received data
        console.log("Received data:", req.body);

        // 🔹 Ensure proper type conversion
        maxDistance = Number(maxDistance);  // Convert to Number
        numberOfDays = Number(numberOfDays);  // Convert to Number
        peopleCount = String(peopleCount);  // Ensure it's a String

        console.log("Converted Data Before Saving:", { 
            name, 
            startingDestination, 
            destinations, 
            activities, 
            cuisines, 
            foodPreferences, 
            transportationMode, 
            maxDistance, 
            numberOfDays, 
            peopleCount 
        });

        const newItinerary = new Itinerary({
            name,
            startingDestination,
            destinations,
            activities,
            cuisines,
            foodPreferences,
            transportationMode,
            maxDistance,
            numberOfDays,
            peopleCount
        });

        await newItinerary.save();
        res.status(201).json({ message: "✅ Itinerary saved successfully!" });
    } catch (err) {
        console.error("❌ Error saving itinerary:", err);
        res.status(500).json({ message: "❌ Error saving itinerary", error: err.message });
    }
});



app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
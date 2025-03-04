require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB using the MONGO_URI from .env
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

const corsOptions = {
    origin: '*', // Allow all origins (for development)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization'
  };
  app.use(cors(corsOptions));
  

// Define Itinerary Schema
const itinerarySchema = new mongoose.Schema({
    name: String,
    startingDestination: String,
    destinations: [String],
    activities: [String],
    cuisines: [String],
    foodPreferences: String,
    transportationMode: [String],
    maxDistance: String,
    numberOfDays: String
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

// API Endpoint to Save Itinerary Data
app.post('/api/itinerary', async (req, res) => {
    try {
        const newItinerary = new Itinerary(req.body);
        await newItinerary.save();
        res.status(201).json({ message: "✅ Itinerary saved successfully!" });
    } catch (err) {
        res.status(500).json({ message: "❌ Error saving itinerary", error: err });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

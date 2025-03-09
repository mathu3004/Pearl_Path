require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

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
    username: { type: String, required: true },
    name: { type: String, required: true },
    startingDestination: { type: String, required: true },
    destinations: { type: [String], required: true },
    activities: { type: [String], required: true },
    cuisines: { type: [String], required: true },
    foodPreferences: { type: String, required: true },
    transportationMode: { type: [String], required: true },
    maxDistance: { type: Number, required: true },
    numberOfDays: { type: Number, required: true },
    peopleCount: { type: String, required: true }
}, { timestamps: true });

// ✅ Ensure (username, name) is unique
itinerarySchema.index({ username: 1, name: 1 }, { unique: true });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

// Function to run Python scripts
const runPythonScript = (scriptPath, callback) => {
    const fullPath = path.resolve(scriptPath);  // ✅ Ensures correct absolute path
    console.log(`📌 EXECUTING: python ${fullPath}`);

    const process = exec(`python ${fullPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ ERROR (${scriptPath}):`, error.message);
            return callback(error);
        }
        if (stderr) {
            console.error(`⚠️ STDERR (${scriptPath}):`, stderr);
        }
        console.log(`✅ SUCCESS (${scriptPath}):`, stdout);
        callback(null, stdout);
    });
};

// API Endpoint to Save Itinerary Data
app.post('/api/itinerary', async (req, res) => {
    try {
        let {
            username,
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

        // ✅ Trim and convert to lowercase for case-insensitive matching
        username = username.trim().toLowerCase();
        name = name.trim().toLowerCase();

        console.log("📌 Checking for existing itinerary:", { username, name });

        // ✅ Check if the itinerary already exists for this user
        const existingItinerary = await Itinerary.findOne({ username, name });

        if (existingItinerary) {
            console.log("❌ Error: Itinerary name already exists for this user.");
            return res.status(400).json({ error: "Itinerary name must be unique for each user." });
        }

        // ✅ Create a new itinerary if it doesn't exist
        const newItinerary = new Itinerary({
            username,
            name, startingDestination, destinations, activities, cuisines, foodPreferences, transportationMode, maxDistance, numberOfDays, peopleCount
        });
        await newItinerary.save();
        console.log("✅ Itinerary saved successfully!");
        res.status(201).json({ message: "✅ Itinerary saved successfully!" });

        // Run Preprocessing and Itinerary Generation in Sequence
        runPythonScript(path.resolve(`RadiusBasedGenerator.py ${username} ${name}`,), (error) => {

            if (error) {
                console.error("❌ ERROR: Preprocessing failed.");
                return;
            }
            console.log("✅ SUCCESS (backend/RadiusBasedGenerator.py): Preprocessing done!");

            // Run app.py for Itinerary Generation
            runPythonScript(path.resolve('`app.py ${username} ${name}`'), (appError) => {

                if (appError) {
                    console.error("❌ ERROR: Itinerary generation failed.");
                    return;
                }
                console.log("✅ SUCCESS (backend/app.py): Itinerary Generated!");
            });
        });
    } catch (err) {
        console.error("❌ Error during processing:", err);
        res.status(500).json({ error: "Processing failed.", details: err.message });
    }
});

// New API Endpoint to Fetch a Specific Itinerary by Name or ID
app.get('/api/itinerary/:name', async (req, res) => {
    try {
        const itineraryName = req.params.name;
        const itinerary = await Itinerary.findOne({ name: itineraryName });

        if (!itinerary) {
            return res.status(404).json({ message: "❌ Itinerary not found" });
        }

        res.json(itinerary);
    } catch (err) {
        console.error("❌ Error fetching itinerary:", err);
        res.status(500).json({ message: "❌ Error fetching itinerary", error: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
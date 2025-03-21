// Top of server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    hotelBudget: {type: Number, required: true},
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
const runPythonScript = (scriptPath, args, callback) => {
    const fullPath = path.resolve(__dirname, scriptPath);
    const command = `python "${fullPath}" ${args.join(" ")}`; // ✅ Properly format command
    console.log(`📌 EXECUTING: ${command}`);

    exec(command, (error, stdout, stderr) => {
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
            hotelBudget,
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
        hotelBudget = Number(hotelBudget);

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
            name, startingDestination, destinations, hotelBudget, activities, cuisines, foodPreferences, transportationMode, maxDistance, numberOfDays, peopleCount
        });
        await newItinerary.save();
        console.log("✅ Itinerary saved successfully!");
        res.status(201).json({ message: "✅ Itinerary saved successfully!" });

        // Run Preprocessing and Itinerary Generation in Sequence
        runPythonScript("RadiusBasedGenerator.py", [username, name], (error) => {
            if (error) {
                console.error("❌ ERROR: Preprocessing failed.");
                return;
            }
            console.log("✅ SUCCESS (backend/RadiusBasedGenerator.py): Preprocessing done!");
        
            // ✅ Corrected Execution of app.py
            runPythonScript("app.py", [username, name], (appError) => {
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
        const name = req.params.name.toLowerCase(); // Normalize casing
        const itinerary = await Itinerary.findOne({ name });

        if (!itinerary) {
            return res.status(404).json({ message: "❌ Itinerary not found" });
        }

        res.json(itinerary);
    } catch (err) {
        console.error("❌ Error fetching itinerary:", err);
        res.status(500).json({ message: "❌ Error fetching itinerary", error: err.message });
    }
});

app.get('/api/itinerary/:name', async (req, res) => {
    try {
        const name = req.params.name.toLowerCase();
        
        console.log(`🔍 Fetching itinerary for: ${name}`); // Debugging

        // Fetching from the correct MongoDB collection
        const itineraryDoc = await mongoose.connection.db.collection("generated_itineraries")
            .findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } }); // Case-insensitive


        if (!itineraryDoc) {
            console.error("❌ Itinerary not found in generated_itineraries!");
            return res.status(404).json({ error: "❌ Itinerary not found" });
        }

        console.log("✅ Itinerary found:", itineraryDoc);
        res.json({ itinerary: itineraryDoc.itinerary });

    } catch (err) {
        console.error("🚨 Error fetching itinerary:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// CORS setup
const corsOptions = {
    origin: '*',
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    dbName: "itinerary_recommendations",
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Define UserInputs schema
const itinerarySchema = new mongoose.Schema({
    username: { type: String, required: true },
    itineraryName: { type: String, required: true },
    startingDestination: { type: String, required: true },
    destinations: { type: [String], required: true },
    budgetRangePerDay: { type: String, required: true },
    activities: { type: [String], required: true },
    cuisines: { type: [String], required: true },
    foodPreferences: { type: String, required: true },
    transportationMode: { type: [String], required: true },
    numberOfDays: { type: Number, required: true },
    peopleCount: { type: String, required: true }
}, { timestamps: true, collection: "UserInputs" });

itinerarySchema.index({ username: 1, itineraryName: 1 }, { unique: true });
const Itinerary = mongoose.model('UserInputs', itinerarySchema);

// Python runner
const runPythonScript = (scriptPath, args, callback) => {
    const fullPath = path.resolve(__dirname, scriptPath);
    const command = `python3 "${fullPath}" ${args.join(" ")}`;
    console.log(`📌 EXECUTING: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Python Script Error: ${error.message}`);
            return callback(new Error("Preprocessing script execution failed."));
        }
        if (stderr) console.error(`⚠️ Python Warning: ${stderr}`);
        console.log(`✅ Python Script Output: ${stdout}`);
        callback(null, stdout);
    });
};

// API Endpoint to Save Itinerary Data
// API Endpoint to Save Itinerary Data
app.post('/api/itinerary', async (req, res) => {
    try {
        let {
            username,
            itineraryName,
            startingDestination,
            destinations,
            budgetRangePerDay,
            activities,
            cuisines,
            foodPreferences,
            transportationMode,
            numberOfDays,
            peopleCount
        } = req.body;

        // Log received data
        console.log("Received data:", req.body);

        // Validate required fields
        if (!username || !itineraryName || !startingDestination || !destinations || !budgetRangePerDay || !activities || !cuisines || !foodPreferences || !transportationMode || !numberOfDays || !peopleCount) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // ✅ Trim and convert to lowercase for case-insensitive matching
        username = username.trim().toLowerCase();
        itineraryName = itineraryName.trim().toLowerCase();

        console.log("📌 Checking for existing itinerary:", { username, itineraryName });

        // ✅ Check if the itinerary already exists for this user
        const existingItinerary = await Itinerary.findOne({ username, itineraryName });

        if (existingItinerary) {
            console.log("❌ Error: Itinerary name already exists for this user.");
            return res.status(400).json({ error: "Itinerary name must be unique for each user." });
        }

        // ✅ Create a new itinerary if it doesn't exist
        try {
            const newItinerary = new Itinerary({
                username, itineraryName, startingDestination, destinations, 
                budgetRangePerDay, activities, cuisines, foodPreferences, 
                transportationMode, numberOfDays, peopleCount
            });
        
            const savedItinerary = await newItinerary.save();
            console.log("✅ Itinerary saved successfully!", savedItinerary);
            res.status(201).json({ message: "✅ Itinerary saved successfully!" });
        
        } catch (error) {
            console.error("❌ MongoDB Save Error:", error);
            res.status(500).json({ 
                error: "Failed to save itinerary.", 
                details: error.message 
            });
        }
        
        // Run Preprocessing and Itinerary Generation in Sequence
        runPythonScript("input_preprocessing.py", [username, itineraryName], (error) => {
            if (error) {
                console.error("❌ ERROR: Preprocessing failed.");
                return;
            }
            console.log("✅ SUCCESS (backend/input_preprocessing.py): Preprocessing done!");
        
            // ✅ Corrected Execution of Itineraryapp.py
            runPythonScript("Itineraryapp.py", [username, itineraryName], (appError) => {
                if (appError) {
                    console.error("❌ ERROR: Itinerary generation failed.");
                    return;
                }
                console.log("✅ SUCCESS (backend/Itineraryapp.py): Itinerary Generated!");
            });
        });
        
    } catch (err) {
        console.error("❌ Error during processing:", err);
        res.status(500).json({ error: "Processing failed.", details: err.message });
    }
});


// New API Endpoint to Fetch a Specific Itinerary by Name or ID
// Define schema for generated itineraries (can be flexible with strict: false)
const GeneratedItinerary = mongoose.model(
    'GeneratedItinerary',
    new mongoose.Schema({}, { strict: false }),
    'GeneratedItineraries'  // 👈 use exact MongoDB collection name
  );
  

// New route: Fetch itinerary by both username and itinerary name
app.get('/api/itinerary/:username/:itinerary_name', async (req, res) => {
    try {
        const username = req.params.username.toLowerCase();
        const itineraryName = req.params.itinerary_name.toLowerCase();
        const itinerary = await GeneratedItinerary.findOne({ username, itineraryName });

        if (!itinerary) {
            return res.status(404).json({ message: "❌ Itinerary not found." });
        }

        res.json(itinerary);
    } catch (err) {
        console.error("❌ Error fetching generated itinerary:", err);
        res.status(500).json({ message: "❌ Server error", error: err.message });
    }
});

app.post('/api/change-recommendation', async (req, res) => {
    const { username, itineraryName, dayIndex, type, mealType, attractionIndex } = req.body;

    // Convert args to string safely
    const args = [username, itineraryName, dayIndex, type];
    if (mealType) args.push(mealType);
    if (typeof attractionIndex === 'number') args.push(attractionIndex.toString());

    runPythonScript("change_recommendation.py", args, (err, stdout) => {
        if (err) {
            console.error("❌ Python script error in /change-recommendation:", err);
            return res.status(500).json({ error: "Change recommendation failed." });
        }

        try {
            const result = JSON.parse(stdout);
            res.json(result);
        } catch (parseError) {
            console.error("❌ Failed to parse Python response:", parseError);
            res.status(500).json({ error: "Invalid response from Python script." });
        }
    });
});

  
// ✅ Route: PUT /api/save-updated-itinerary
app.put('/api/save-updated-itinerary', async (req, res) => {
    const { username, itineraryName, days } = req.body;
    if (!username || !itineraryName || !Array.isArray(days)) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const result = await GeneratedItinerary.findOneAndUpdate(
            { username: username.toLowerCase(), itineraryName: itineraryName.toLowerCase() },
            { $set: { days } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ error: "Itinerary not found" });
        }

        res.json({ message: "✅ Itinerary updated!", updated: result });
    } catch (err) {
        console.error("❌ Failed to update itinerary:", err);
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

  
app.post('/api/save-itinerary-to-saved', async (req, res) => {
    console.log("📥 Received Save Request:", req.body);
    const { username, itineraryName } = req.body;

    if (!username || !itineraryName) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const lowerUsername = username.toLowerCase();
    const lowerItineraryName = itineraryName.toLowerCase();

    // Models
    const SavedItinerary = mongoose.model(
        'SavedItinerary',
        new mongoose.Schema({}, { strict: false }),
        'SavedItineraries'
    );

    const GeneratedItinerary = mongoose.model(
        'GeneratedItinerary',
        new mongoose.Schema({}, { strict: false }),
        'GeneratedItineraries'
    );

    try {
        // 🔍 Check if already saved
        const exists = await SavedItinerary.findOne({
            username: lowerUsername,
            itineraryName: lowerItineraryName
        });

        if (exists) {
            return res.status(409).json({ error: "Itinerary already saved." });
        }

        // 📤 Fetch from GeneratedItineraries
        const originalItinerary = await GeneratedItinerary.findOne({
            username: lowerUsername,
            itineraryName: lowerItineraryName
        });

        if (!originalItinerary) {
            return res.status(404).json({ error: "Generated itinerary not found." });
        }

        // 💾 Save copy to SavedItineraries
        const toSave = {
            ...originalItinerary.toObject(),
            saved_at: new Date()
        };

        delete toSave._id; // Remove original _id to avoid conflict

        await SavedItinerary.create(toSave);

        res.status(201).json({ message: "✅ Itinerary saved!" });
    } catch (err) {
        console.error("❌ Failed to save itinerary:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

      
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
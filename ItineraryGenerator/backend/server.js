require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

//  Define corsOptions first
const corsOptions = {
    origin: '*',
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
};

//  Apply middleware
app.use(cors(corsOptions));
app.use(express.json());

//  Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    dbName: "itinerary_recommendations",
})
.then(() => console.log(" MongoDB Connected"))
.catch(err => console.error(" MongoDB Connection Error:", err));

// Define Itinerary Schema
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
}, { timestamps: true, collection: "UserInputs" }); //  Changed collection name

//  Ensure (username, name) is unique
itinerarySchema.index({ username: 1, itineraryName: 1 }, { unique: true });

const Itinerary = mongoose.model('UserInputs', itinerarySchema); //  Updated model reference

// Function to run Python scripts
const runPythonScript = (scriptPath, args, callback) => {
    const fullPath = path.resolve(__dirname, scriptPath);
    const command = `python3 "${fullPath}" ${args.join(" ")}`;  //  Use python3 instead of python
    console.log(`📌 EXECUTING: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(` Python Script Error: ${error.message}`);
            return callback(new Error("Preprocessing script execution failed."));
        }
        if (stderr) console.error(`⚠️ Python Warning: ${stderr}`);
        console.log(` Python Script Output: ${stdout}`);
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

        //  Trim and convert to lowercase for case-insensitive matching
        username = username.trim().toLowerCase();
        itineraryName = itineraryName.trim().toLowerCase();

        console.log("📌 Checking for existing itinerary:", { username, itineraryName });

        //  Check if the itinerary already exists for this user
        const existingItinerary = await Itinerary.findOne({ username, itineraryName });

        if (existingItinerary) {
            console.log(" Error: Itinerary name already exists for this user.");
            return res.status(400).json({ error: "Itinerary name must be unique for each user." });
        }

        //  Create a new itinerary if it doesn't exist
        try {
            const newItinerary = new Itinerary({
                username, itineraryName, startingDestination, destinations, 
                budgetRangePerDay, activities, cuisines, foodPreferences, 
                transportationMode, numberOfDays, peopleCount
            });
        
            const savedItinerary = await newItinerary.save();
            console.log(" Itinerary saved successfully!", savedItinerary);
            res.status(201).json({ message: " Itinerary saved successfully!" });
        
        } catch (error) {
            console.error(" MongoDB Save Error:", error);
            res.status(500).json({ 
                error: "Failed to save itinerary.", 
                details: error.message 
            });
        }
        
        // Run Preprocessing and Itinerary Generation in Sequence
        runPythonScript("input_preprocessing.py", [username, itineraryName], (error) => {
            if (error) {
                console.error(" ERROR: Preprocessing failed.");
                return;
            }
            console.log(" SUCCESS (backend/input_preprocessing.py): Preprocessing done!");
        
            //  Corrected Execution of app.py
            runPythonScript("app.py", [username, itineraryName], (appError) => {
                if (appError) {
                    console.error(" ERROR: Itinerary generation failed.");
                    return;
                }
                console.log(" SUCCESS (backend/app.py): Itinerary Generated!");
            });
        });
        
    } catch (err) {
        console.error(" Error during processing:", err);
        res.status(500).json({ error: "Processing failed.", details: err.message });
    }
});


// New API Endpoint to Fetch a Specific Itinerary by Name or ID
// Define schema for generated itineraries (can be flexible with strict: false)
const GeneratedItinerary = mongoose.model(
    'GeneratedItinerary',
    new mongoose.Schema({}, { strict: false }),
    'GeneratedItineraries'  //  use exact MongoDB collection name
  );
  

// New route: Fetch itinerary by both username and itinerary name
app.get('/api/itinerary/:username/:itinerary_name', async (req, res) => {
    try {
        const username = req.params.username.toLowerCase();
        const itineraryName = req.params.itinerary_name.toLowerCase();
        const itinerary = await GeneratedItinerary.findOne({ username, itineraryName });

        if (!itinerary) {
            return res.status(404).json({ message: " Itinerary not found." });
        }

        res.json(itinerary);
    } catch (err) {
        console.error(" Error fetching generated itinerary:", err);
        res.status(500).json({ message: " Server error", error: err.message });
    }
});


app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
// Top of Radiusserver.js
import User from './models/User.js';
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
const PORT = process.env.PORT || 5003;

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
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

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

// Ensure (username, name) is unique
itinerarySchema.index({ username: 1, name: 1 }, { unique: true });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

// Function to run Python scripts (used for preprocessing and itinerary generation)
const runPythonScript = (scriptPath, args, callback) => {
    const fullPath = path.resolve(__dirname, scriptPath);
    const command = `python "${fullPath}" ${args.join(" ")}`;
    console.log(`EXECUTING: ${command}`); 

    exec(command, (error, stdout, stderr) => {
        if (error) {
        console.error(`ERROR (${scriptPath}):`, error.message); 
        return callback(error);
        }
        if (stderr) {
        console.error(`STDERR (${scriptPath}):`, stderr);
        }
        console.log(`SUCCESS (${scriptPath}):`, stdout);
        callback(null, stdout);
    });
    };

// 9. Endpoint: Save user itinerary form input and trigger backend scripts
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

        // Ensure proper type conversion
        maxDistance = Number(maxDistance);  // Convert to Number
        numberOfDays = Number(numberOfDays);  // Convert to Number
        peopleCount = String(peopleCount);  // Ensure it's a String
        hotelBudget = Number(hotelBudget);

        // Trim and convert to lowercase for case-insensitive matching
        username = username.trim().toLowerCase();
        name = name.trim().toLowerCase();

        // Check if the itinerary already exists for this user
        const existingItinerary = await Itinerary.findOne({ username, name });

        if (existingItinerary) {
            return res.status(400).json({ error: "Itinerary name must be unique for each user." });
        }

        // Create a new itinerary if it doesn't exist
        const newItinerary = new Itinerary({
            username,
            name, startingDestination, destinations, hotelBudget, activities, cuisines, foodPreferences, transportationMode, maxDistance, numberOfDays, peopleCount
        });
        await newItinerary.save();
        console.log("User Inputs saved successfully!");

runPythonScript("RadiusBasedGenerator.py", [username, name], (error) => {
    if (error) {
        console.error("ERROR: Preprocessing failed.");
        return res.status(500).json({ error: "Preprocessing failed." });
    }

    console.log("SUCCESS: Preprocessing done!");

    runPythonScript("Radiusapp.py", [username, name], (appError) => {
        if (appError) {
            console.error("ERROR: Itinerary generation failed.");
            return res.status(500).json({ error: "Itinerary generation failed." });
        }

        console.log("SUCCESS: Itinerary Generated!");
        return res.status(201).json({ message: "Itinerary generated successfully!" });
    });
});

    } catch (err) {
        console.error("Error during processing:", err);
        res.status(500).json({ error: "Processing failed.", details: err.message });
    }
});

// 10. Endpoint: Fetch a generated itinerary by username and name
app.get('/api/itineraries/:username/:name', async (req, res) => {
    try {
        const { username, name } = req.params;
        console.log("Searching for itinerary:", { username, name });

        const itinerary = await mongoose.connection.db
            .collection("generated_itineraries")
            .findOne({ 
                username: username.trim().toLowerCase(), 
                name: name.trim().toLowerCase()
            });

        if (!itinerary) {
            console.log("No itinerary found for:", username, name);
            return res.status(404).json({ message: "No itinerary found for this user." });
        }

        console.log("Found itinerary:", itinerary);
        res.json(itinerary);
            } catch (err) {
        console.error("Error fetching itinerary:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// 11. Endpoint: Save itinerary to 'saved_itineraries' collection
app.post('/api/save-itinerary', async (req, res) => {
  try {
    console.log("Incoming save request:", req.body);
    const { username, name } = req.body;
    if (!username || !name) {
      return res.status(400).json({ error: 'Missing username or itinerary name' });
    }

    const db = mongoose.connection.db;

    const sourceItinerary = await db.collection("generated_itineraries").findOne({
      username: username.toLowerCase(),
      name: name.toLowerCase()
    });

    if (!sourceItinerary) {
      console.error("No itinerary found for", username, name);
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    console.log("Found source itinerary:", sourceItinerary);

    // Prevent _id duplication
    delete sourceItinerary._id;
    console.log("Source itinerary after removing _id:", sourceItinerary);

    try {
      await db.collection("saved_itineraries").updateOne(
        { username: username.toLowerCase(), name: name.toLowerCase() },
        {
          $set: {
            ...sourceItinerary,
            saved_at: new Date()
          }
        },
        { upsert: true }
      );
      console.log("Itinerary successfully saved/updated.");
      return res.status(201).json({ message: "Itinerary saved or updated successfully!" });
    } catch (updateError) {
      console.error("Update operation failed:", updateError);
      return res.status(500).json({ error: "Update operation failed", details: updateError.message });
    }

  } catch (error) {
    console.error("Save itinerary failed:", error);
    res.status(500).json({ error: "Failed to save itinerary", details: error.message });
  }
});


// 12. Endpoint: Save an edited itinerary back to MongoDB
  app.post('/api/save-edited-itinerary', async (req, res) => {
    try {
      const { username, name, itinerary } = req.body;
      if (!username || !name || !itinerary) {
        return res.status(400).json({ error: 'Missing data' });
      }
      await mongoose.connection.db.collection('generated_itineraries').updateOne(
        { username: username.toLowerCase(), name: name.toLowerCase() },
        { $set: { itinerary, last_updated: new Date() } }
      );
      res.status(200).json({ message: 'Itinerary updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update itinerary', details: err.message });
    }
  });
  
  //For ModifyRequest.js point: Get all itineraries for a specific user (used in ModifyRequest.js)
  app.get('/api/user-itineraries/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const itineraries = await mongoose.connection.db.collection('generated_itineraries')
  .find({ username: username.toLowerCase() })
  .toArray();

      res.json(itineraries);
    } catch (error) {
      console.error('Error fetching user itineraries:', error);
      res.status(500).send('Server error');
    }
  });
  


// 14. Endpoint: Fetch raw user-submitted itinerary input by itinerary name (for debugging)
app.get('/api/itinerary/:name', async (req, res) => {
    try {
        const name = req.params.name.toLowerCase(); // Normalize casing
        const itinerary = await Itinerary.findOne({ name });

        if (!itinerary) {
            return res.status(404).json({ message: "Itinerary not found" });
        }

        res.json(itinerary);
    } catch (err) {
        console.error("Error fetching itinerary:", err);
        res.status(500).json({ message: "Error fetching itinerary", error: err.message });
    }
});

// 15. Start the Express server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// src/TravelItineraryGenerator.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Layout from './components/Layout';
import { FaInstagram, FaFacebook } from "react-icons/fa";
import { FaPlaneDeparture, FaWalking, FaCar, FaBiking, FaBusAlt, FaTrain, FaShuttleVan,} from 'react-icons/fa';

const Header = () => {
  return (
    <header className="header">
      <img src="/assests/IconPearl.png" alt="Logo" />
      <ul className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/visual/testuser/sample-itinerary">Itinerary</Link>
        <Link to="/chatbot">Help!</Link>
        <Link to="/about-us">AboutUs</Link>
        <Link to="/features">Features</Link>
      </ul>

    </header>
  );
};


const TravelItineraryGenerator = () => {
    const [formData, setFormData] = useState({
        username: JSON.parse(localStorage.getItem("user"))?.username || '',
        itineraryName: '',
        startingDestination: '',
        destinations: [],
        activities: [],
        cuisines: [],
        foodPreferences: '',
        transportationMode: [],
        maxDistance: '',
        numberOfDays: '',
        budgetRangePerDay: '',
        peopleCount: '',
    });

    const [budgetError, setBudgetError] = useState('');
    const [startingDestinationError, setStartingDestinationError] = useState('');
    const navigate = useNavigate(); 
    

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
    
        // Check for budget range input
        if (name === 'budgetRangePerDay') {
            if (!/^[0-9-]+$/.test(value)) {
                setBudgetError("Only numbers and dashes are allowed.");
            } else {
                const ranges = value.split('-').map(Number);
                if (ranges.some(isNaN) || ranges.some(num => num < 5000)) {
                    setBudgetError("Each value must be a number greater than 5000.");
                } else {
                    setBudgetError('');
                }
            }
        }
    
        // Handle checkbox inputs
        if (type === 'checkbox') {
            setFormData((prevData) => ({
                ...prevData,
                [name]: checked
                    ? [...prevData[name], value]
                    : prevData[name].filter((item) => item !== value),
            }));
        } else if (name === 'numberOfDays') {
            const parsedValue = parseInt(value, 10);
            if (!isNaN(parsedValue) && parsedValue >= 1) {
                setFormData((prevData) => ({ ...prevData, [name]: parsedValue }));
            }
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }

    };
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (budgetError) {
            alert("Please correct the budget input.");
            return;
        }
        
        if (!formData.destinations.includes(formData.startingDestination)) {
            setStartingDestinationError("Starting destination must be one of the selected destinations.");
            return;
        } else {
            setStartingDestinationError('');
        }
    
        if (parseInt(formData.numberOfDays, 10) < 1) {
            alert("Number of days must be at least 1.");
            return;
        }
    
        console.log("Form Data:", formData);
        try {
            const response = await fetch('http://localhost:5001/api/itinerary', {  // Make sure the port matches your backend
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                alert("Itinerary saved successfully!");
                navigate(`/visual/${formData.username.toLowerCase()}/${formData.itineraryName.toLowerCase()}`);
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to save itinerary.");
        }
    };

    return (
        <div className="page-container">
            <Header />
            <div className="glass-card">
                <h2 className="page-title">Heal to Nature : Craft your Dream</h2>
                <form onSubmit={handleSubmit} className="form-grid">

                <div className="col-span-2">
                        <label className="form-label">Username:</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Enter your username"
                            value={formData.username}
                            readOnly
                            className="w-full p-3 border-2 border-green-500 rounded-md focus:border-green-700 focus:outline-none shadow-sm"
                            required
                        />
                    </div>
                    <br></br>

                    <div className="col-span-2">
                        <label className="form-label">Itinerary Name:</label>
                        <input
                            type="text"
                            name="itineraryName"
                            placeholder="Enter your itinerary name"
                            value={formData.itineraryName}
                            onChange={handleChange}
                            className="w-full p-3 border-2 border-green-500 rounded-md focus:border-green-700 focus:outline-none shadow-sm"
                            required
                        />
                    </div>
                    <br></br>

                    <div className="col-span-2">
                        <label className="form-label">Destinations:</label>
                        <div className="form-grid">
                            {['Ella', 'Kandy', 'Nuwara Eliya', 'Colombo'].map((destination) => (
                                <label key={destination} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="destinations"
                                        value={destination}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    {destination}
                                </label>
                            ))}
                        </div>
                    </div>
                    <br></br>

                    <div className="col-span-2">
                        <label className="form-label">Starting Destination: </label>
                        <select
                            name="startingDestination"
                            value={formData.startingDestination}
                            onChange={handleChange}
                            className="w-full p-3 border-2 border-green-500 rounded-md focus:border-green-700 focus:outline-none shadow-sm"
                            required
                        >
                            <option value="">Select Starting Destination</option>
                            <option value="Ella">Ella</option>
                            <option value="Colombo">Colombo</option>
                            <option value="Kandy">Kandy</option>
                            <option value="Nuwara Eliya">Nuwara Eliya</option>
                        </select>
                        {startingDestinationError && <p className="text-red-500">{startingDestinationError}</p>}
                    </div>
                    <br></br>

                    <div className="col-span-2">
                        <label className="form-label">Budget Range Per Day (LKR):</label>
                        <input
                            type="text"
                            name="budgetRangePerDay"
                            placeholder="Enter budget range per day (eg: 10000-13000)"
                            value={formData.budgetRangePerDay}
                            onChange={handleChange}
                            className="w-full p-3 border-2 border-green-500 rounded-md focus:border-green-700 focus:outline-none shadow-sm"
                            required
                        />
                        {budgetError && <p className="text-red-500">{budgetError}</p>}
                    </div>
                    <br></br>

                    <div>
                        <label className="form-label">Number of Days: </label>
                        <input
                            type="number"
                            name="numberOfDays"
                            placeholder="Enter number of days"
                            value={formData.numberOfDays}
                            onChange={handleChange}
                            min="1"
                            className="w-full p-3 border-2 border-green-500 rounded-md focus:border-green-700 focus:outline-none shadow-sm"
                            required
                                />
                    </div>
                    <br></br>

                    

                    <div className="col-span-2">
                        <label className="form-label">Activities:</label>
                        <div className="checkbox-grid">
                            {['Historical Sites', 'Nature Trails', 'Cultural', 'Adventurous', 'Shopping', 'Wildlife', 'Religious', 'Spa and Wellness'].map((activity) => (
                                <label key={activity} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="activities"
                                        value={activity}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    {activity}
                                </label>
                            ))}
                        </div>
                    </div>
                    <br></br>

                    <div className="col-span-2">
                        <label className="form-label">Cuisines:</label>
                        <div className="checkbox-grid">
                            {['Italian', 'Chinese', 'Indian', 'Mexican', 'Sri-Lankan', 'Western', 'Thai'].map((cuisine) => (
                                <label key={cuisine} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="cuisines"
                                        value={cuisine}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    {cuisine}
                                </label>
                            ))}
                        </div>
                    </div>
                    <br></br>

                    <div className="col-span-2">
                        <label className="form-label">People Count:</label>
                        <div className="radio-grid">
                            {['1', '2', '3-5', '6+'].map((count) => (
                                <label key={count} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="peopleCount"
                                        value={count}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    {count}
                                </label>
                            ))}
                        </div>
                    </div>
                    <br></br>

                    <div className="col-span-2">
                        <label className="form-label">Food Preference:</label>
                        <div className="radio-grid">
                            {['Veg', 'Non-Veg'].map((preference) => (
                                <label key={preference} className="flex items-center p-2 bg-green-50 border-2 border-green-300 rounded-lg shadow-sm hover:bg-green-100 transition">
                                    <input
                                        type="radio"
                                        name="foodPreferences"
                                        value={preference}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    {preference}
                                </label>
                            ))}
                        </div>
                    </div>
                    <br></br>

                    <div className="col-span-2">
                        <label className="form-label">Transportation Mode:</label>
                        <div className="checkbox-grid">
                            {[
                                {mode: 'Car', icon: <FaCar />},
                                {mode: 'Bus', icon: <FaBusAlt />},
                                {mode: 'Bike', icon: <FaBiking />},
                                {mode: 'Walk', icon: <FaWalking />},
                                {mode: 'Train', icon: <FaTrain />},
                                {mode: 'Tuk-Tuk', icon: <FaShuttleVan />},

                            ].map(({mode, icon}) => (
                                <label key={mode} className="flex items-center p-2 bg-green-50 border-2 border-green-300 rounded-lg shadow-sm hover:bg-green-100 transition">
                                    <input
                                        type="checkbox"
                                        name="transportationMode"
                                        value={mode}
                                        onChange={handleChange}
                                        className="mr-2"
                                    />
                                    <span className="flex items-center gap-2">{icon} {mode}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <br></br>

                    <button type="submit" className="form-button">
                        Get Itinerary <FaPlaneDeparture className="inline ml-2" />
                    </button>
                </form>
            </div>
            <Layout>
            </Layout>
            <Footer />
        </div>
    );
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">&copy; 2025 Pearl Path. All rights reserved.</div>
        <div className="footer-right">
          <div className="social-links">
          <a href="https://www.instagram.com/yourpage" target="_blank" rel="noopener noreferrer">
  <FaInstagram /> Instagram
</a>
<a href="https://www.facebook.com/yourpage" target="_blank" rel="noopener noreferrer">
  <FaFacebook /> Facebook
</a>

          </div>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default TravelItineraryGenerator;
// src/TravelItineraryGenerator.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaPlaneDeparture, FaWalking, FaCar, FaBiking, FaBusAlt, FaTrain, FaShuttleVan,} from 'react-icons/fa';


const TravelItineraryGenerator = () => {
    const [formData, setFormData] = useState({
        name: '',
        startingDestination: '',
        destinations: [],
        activities: [],
        cuisines: [],
        foodPreferences: '',
        transportationMode: [],
        maxDistance: '',
        numberOfDays: '',
    });

    const navigate = useNavigate(); 

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData((prevData) => ({
                ...prevData,
                [name]: checked
                    ? [...prevData[name], value]
                    : prevData[name].filter((item) => item !== value),
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        navigate('/visualization', { state: { formData } });
    };

    return (
        <div className="page-container" style={{backgroundImage: 'url(https://i0.wp.com/www.tourbooking.lk/wp-content/uploads/2023/03/merlin_148552275_74c0d250-949c-46e0-b8a1-e6d499e992cf-superJumbo-edited.jpg?fit=2048%2C1151&ssl=1)'}}>
            <nav>
                <div className="nav-links">
                    <Link to="/features">Features</Link>
                    <Link to="/privacy">Privacy</Link>
                    <Link to="/help-center">Help Center</Link>
                    <Link to="/blog">Blog</Link>
                    <Link to="/for-business">For Business</Link>
                    <Link to="/login">Log in</Link>
                    <Link to="/create-account">Get Started</Link>
                </div>
            </nav>

            <div className="glass-card">
                <h2 className="page-title">Heal to Nature : Craft your Dream</h2>
                <form onSubmit={handleSubmit} className="form-grid">

                    <div className="col-span-2">
                        <label className="form-label">Itinerary Name:</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your itinerary name"
                            value={formData.name}
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
                            className="w-full p-3 border-2 border-green-500 rounded-md focus:border-green-700 focus:outline-none shadow-sm"
                            required
                        />
                    </div>
                    <br></br>

                    <div>
                        <label className="form-label">Maximum Distance (km): </label>
                        <input
                            type="number"
                            name="maxDistance"
                            placeholder="Enter maximum distance"
                            value={formData.maxDistance}
                            onChange={handleChange}
                            className="w-full p-3 border-2 border-green-500 rounded-md focus:border-green-700 focus:outline-none shadow-sm"
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
                                        name="foodPreference"
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

            <footer className="footer">
                <div className="footer-content">
                    <p>© 2025 Pearl Path. All rights reserved.</p>
                    <p>Contact Us: info@pearlpath.com</p>
                    <div className="social-links">
                        <a href="https://twitter.com/pearlpath" target="_blank" rel="noopener noreferrer">X</a>
                        <a href="https://instagram.com/pearlpath" target="_blank" rel="noopener noreferrer">Instagram</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TravelItineraryGenerator;
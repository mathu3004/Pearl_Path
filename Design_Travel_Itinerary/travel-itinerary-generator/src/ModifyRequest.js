import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Layout from './components/Layout';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import './TravelItineraryRadius.css';
import { AuthContext } from './context/auth.context'; // Import AuthContext

const NormalModifyRequest = () => {
  const { fetchProfile } = useContext(AuthContext); // Get fetchProfile from context
  const [username, setUsername] = useState('');
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await fetchProfile();
        if (profile && profile.user) {
          setUsername(profile.user.username);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
    loadProfile();
  }, [fetchProfile]);

  const handleSearch = async () => {
    if (!username) {
      alert('Username is missing!');
      return;
    }

    setLoading(true);
    try {
      // Use the new endpoint for the friend's DB/collection
      const response = await axios.get(`http://localhost:5001/api/user-itineraries/${username.toLowerCase()}`);
      setItineraries(response.data || []);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      alert('Error retrieving itineraries.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (itineraryName) => {
    // Navigate to the modify route for the friend's itineraries
    navigate(`/modify/${username}/${itineraryName}`)
  };

  return (
    <div className="main">
      <div className="editrequest-page-wrapper">
        <Header />

        {/* Form Container */}
        <div className="editrequest-left">
          <h2>Find and Modify Your Itinerary</h2>
          <input
            type="text"
            value={username}
            placeholder="Enter your username"
            readOnly
            className="input"
          />
          <br />
          <button className="button" onClick={handleSearch}>Search Itineraries</button>
        </div>

        {/* Itinerary Grid */}
        {loading && <p>Loading...</p>}
        {itineraries.length > 0 && (
          <div className="editrequest-day">
            <h3>Available Itineraries</h3>
            <ul>
            {itineraries.map((itinerary, idx) => (
  <li key={idx}>
    <button
      className="button"
      onClick={() => handleNavigate(itinerary.itineraryName)}
    >
      {itinerary.itineraryName?.toUpperCase() || "(Unnamed Itinerary)"}
    </button>
  </li>
))}

            </ul>
          </div>
        )}

        <Layout />
        <Footer />
      </div>
    </div>
  );
};

export default NormalModifyRequest;
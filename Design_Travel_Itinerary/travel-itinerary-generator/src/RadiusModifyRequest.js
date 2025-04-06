import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Layout from './components/Layout';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import './TravelItineraryRadius.css';
import { AuthContext } from './context/auth.context'; // Import AuthContext

// === 2. Main Component: ModifyRequest ===
const ModifyRequest = () => {
  const { fetchProfile } = useContext(AuthContext); // Get fetchProfile from context
  const [username, setUsername] = useState('');
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // === 3. On Component Mount: Fetch Logged-In User's Username ===
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

  // === 4. Handle Itinerary Fetch for Logged-In User ===
  const handleSearch = async () => {
    if (!username) {
      alert('Username is missing!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5003/api/user-itineraries/${username.toLowerCase()}`
      );
      setItineraries(response.data || []);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      alert('Error retrieving itineraries.');
    } finally {
      setLoading(false);
    }
  };

  // === 5. Navigate to Modify Page on Click ===
  const handleNavigate = (itineraryName) => {
    navigate(`/modify-radius/${username.toLowerCase()}/${itineraryName.toLowerCase()}`);
  };

  // === 6. Render Component ===
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
        {/* === Results Panel: Show Itinerary Buttons === */}
        {loading && <p>Loading...</p>}
        {itineraries.length > 0 && (
          <div className="editrequest-day">
            <h3>Available Itineraries</h3>
            <ul>
              {itineraries.map((itinerary, idx) => (
                <li key={idx}>
                  <button
                    className="button"
                    onClick={() => handleNavigate(itinerary.name)}
                  >
                    {itinerary.name.toUpperCase()}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

{/* === Message if No Itineraries Found === */}
        {!loading && itineraries.length === 0 && (
          <div className="editrequest-day">
            <p>No itineraries created yet.</p>
          </div>
        )}
  
        <Layout />
        <Footer />
      </div>
    </div>
  );
};

export default ModifyRequest;
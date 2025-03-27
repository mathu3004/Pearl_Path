import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../src/components/Layout';
import axios from 'axios';
import './TravelItineraryRadius.css';

const ModifyRequest = () => {
  const [username, setUsername] = useState('');
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!username) {
      alert('Please enter a username');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/user-itineraries/${username.toLowerCase()}`);
      setItineraries(response.data || []);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      alert('Error retrieving itineraries.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (itineraryName) => {
    navigate(`/modify/${username.toLowerCase()}/${itineraryName.toLowerCase()}`);
  };

  return (
    <div className="edit-page-wrapper">
      <div className="edit-left">
        <h2>Find and Modify Your Itinerary</h2>
        <input
          type="text"
          value={username}
          placeholder="Enter your username"
          onChange={(e) => setUsername(e.target.value)}
          className="input"
        />
        <button className="button" onClick={handleSearch}>Search Itineraries</button>

        {loading && <p>Loading...</p>}
        {itineraries.length > 0 && (
          <div className="edit-day">
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
      </div>
      <Layout>
      <div className="demo-content">
      </div>
    </Layout>
    </div>
  );
};

export default ModifyRequest;

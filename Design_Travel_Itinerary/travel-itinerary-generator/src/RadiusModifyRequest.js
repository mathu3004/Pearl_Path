import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import Layout from './components/Layout';
import { FaInstagram, FaFacebook } from "react-icons/fa";
import axios from 'axios';
import './TravelItineraryRadius.css';

const Header = () => {
  return (
    <header className="header">
      <img src="/assests/IconPearl.png" alt="Logo" />
      <ul className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/Pearl.js">Itinerary</Link>
        <Link to="/chatbot">Help!</Link>
        <Link to="/about-us">AboutUs</Link>
        <Link to="/features">Features</Link>
      </ul>
    </header>
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

const ModifyRequest = () => {
  const [username, setUsername] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    return storedUser?.username || '';
  });
  
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
      const response = await axios.get(`http://localhost:5003/api/user-itineraries/${username.toLowerCase()}`);
      setItineraries(response.data || []);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      alert('Error retrieving itineraries.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (itineraryName) => {
    navigate(`/modify-radius/${username.toLowerCase()}/${itineraryName.toLowerCase()}`);
  };

  return (
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
    /> <br />
    <button className="button" onClick={handleSearch}>Search Itineraries</button>
  </div>

  {/* Itinerary Grid Outside for Full Width */}
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
  <Layout />
  <Footer />
</div>

  );
};

export default ModifyRequest;

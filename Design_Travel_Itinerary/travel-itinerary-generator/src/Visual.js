//Visual.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
//import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { FaHotel, FaUtensils, FaMapMarkerAlt, FaTrain } from "react-icons/fa";
import { FaInstagram, FaFacebook } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./App.css";

const Header = () => {
  return (
    <header className="header">
      <img src="/assests/IconPearl.png" alt="Logo" />
      <ul className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/generateItinerary">Itinerary</Link>
        <Link to="/chatbot">Help!</Link>
        <Link to="/about-us">AboutUs</Link>
        <Link to="/features">Features</Link>
      </ul>
    </header>
  );
};

//const mapContainerStyle = { width: "100%", height: "910px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",};

const TravelItinerary = () => {
  const [itineraries, setItineraries] = useState(null);
  const [loading, setLoading] = useState(true);

  const { username, name } = useParams();
  const lowerUsername = username ? username.toLowerCase() : null;
  const lowerName = name ? name.toLowerCase() : null;
 
  useEffect(() => {
    console.log("📡 useEffect triggered for:", lowerUsername, lowerName);
    if (!lowerUsername || !lowerName) {
      console.warn("⚠️ Username or name missing from URL params");
      return;
    }    

    const fetchItinerary = async () => {
      try {
          console.log("🔍 Fetching itinerary for:", lowerUsername, lowerName);
          console.log(`🌐 Fetching from URL: http://localhost:5000/api/itineraries/${lowerUsername}/${lowerName}`);

          const response = await axios.get(`http://localhost:5000/api/itineraries/${lowerUsername}/${lowerName}`);
  
          console.log("✅ API Response:", response.data);  // Debugging log
  
          if (!response.data || !response.data.itinerary) {
              console.error("❌ No valid itinerary data received.");
              setItineraries(null);
          } else {
              setItineraries(response.data);  // ✅ Store object, not array
              console.log("📦 Stored itinerary:", response.data);
          }
      } catch (error) {
          console.error("❌ Error fetching itinerary:", error);
      } finally {
          console.log("🔄 Setting loading to false");
          setLoading(false);
      }
  };  
        fetchItinerary();
      }, [lowerUsername, lowerName]);

if (loading) {
  return <p>Loading itineraries...</p>;
}

console.log("🖥️ Rendering itineraries:", itineraries);


if (!itineraries || !itineraries.itinerary) {
  console.log("🖥️ Rendering itineraries:", itineraries);
  return <p>No itinerary data available.</p>;
}

  return (
    <div>
      <div className="page-containers">
        <Header />
        <div className="main-layout">
          <div className="itinerary-card">
            <h2>Itineraries for {username}</h2>
            <h2>{itineraries?.name?.toUpperCase()}'s ITINERARY</h2>

              {itineraries && itineraries.itinerary ? (
  Object.entries(itineraries.itinerary).length > 0 ? (
    Object.entries(itineraries.itinerary).map(([dayKey, details]) => {
      const dayNumberMatch = dayKey.match(/Day (\d+)/);
      const dayNumber = dayNumberMatch ? dayNumberMatch[1] : "Unknown";

      return (
        <div key={dayKey} className="day-plan">
          <h3>Day {dayNumber}: {dayKey.split(" - ")[0]}</h3>
          <div className="card">
            <p><FaHotel /> <strong>Hotel:</strong> {details?.Hotel || "Not available"}</p>
          </div>
          <div className="card">
            <p><FaUtensils /> <strong>Restaurants:</strong> {details?.Restaurants?.join(", ") || "No restaurants listed"}</p>
          </div>
          <div className="card">
            <p><FaMapMarkerAlt /> <strong>Attractions:</strong> {details?.Attractions?.join(", ") || "No attractions listed"}</p>
          </div>
        </div>
      );
    })
  ) : (
    <p>No itinerary details available.</p>
  )
) : (
  <p>No itinerary found for {username}.</p>
)}

          </div>

        {/* ✅ Ensure map loads dynamically after data */}
        <div className="map-container">
             {/* Future Google Maps integration here */}
        </div>
      </div>
      <div className="button-container">
        <button className="button">Edit</button>
        <button className="button">Save Itinerary</button>
        <button className="button">Export</button>
      </div>
      <p className="thank-you-message">Thank You! Enjoy Your Trip! <FaTrain /> </p>

    </div> <Footer />
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

export default TravelItinerary;
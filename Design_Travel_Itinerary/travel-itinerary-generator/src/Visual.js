import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { FaHotel, FaUtensils, FaMapMarkerAlt, FaStar, FaTrain } from "react-icons/fa";
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

const TravelItinerary = () => {
  const location = useLocation();
  const { state } = location;
  const itineraryName = state?.formData?.name || "default_itinerary";  
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await fetch("http://localhost:5000/generate_itinerary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: itineraryName }),
        });
        const data = await response.json();
        if (response.ok) {
          setItinerary(data.itinerary);
        } else {
          console.error("Error fetching itinerary:", data.message);
        }
      } catch (error) {
        console.error("Error fetching itinerary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [itineraryName]);

  if (loading) return <p>Loading...</p>;

  if (!itinerary) return <p>No itinerary found.</p>;

  // Prepare map settings
  const mapContainerStyle = {
    width: "100%",
    height: "910px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
  };

  const center = {
    lat: 6.9271,
    lng: 79.8612,
  };

  return (
    <div>
      <div className="page-containers">
        <Header />
        <div className="main-layout">
          <div className="itinerary-card">
            <h2 className="itinerary-title">{itinerary.name}'s Itinerary</h2>
            {itinerary.destinations.map((destination, index) => (
              <div key={index}>
                <h3 className="itinerary-subtitle">Destination: {destination}</h3>
                <ul className="itinerary-list">
                  {itinerary.activities.map((activity, idx) => (
                    <li key={idx} className="itinerary-item">
                      <div className="activity-header">
                        <span className="activity-icon">{activity.type === "Hotel" ? <FaHotel /> : <FaUtensils />}</span>
                        <span className="activity-type">{activity.type}:</span> {activity.name}
                      </div>
                        <div>
                          <h2>{itineraryName} - Your Personalized Itinerary</h2>
                          {Object.entries(itinerary).map(([destination, details]) => (
                            <div key={destination}>
                              <h3>📍 {destination} ({details.days_allocated} days)</h3>
                              <p>🏨 Hotel: {details.hotels.join(", ")}</p>
                              <p>🍽️ Restaurants: {details.restaurants.join(", ")}</p>
                              <p>🎢 Attractions: {details.attractions.join(", ")}</p>
                            </div>
                          ))}
                        </div>
                      <div className="activity-second-row">
                        <span className="activity-location"><FaMapMarkerAlt /> {activity.location}</span>
                        <span className="activity-rating"><FaStar /> {activity.rating.toFixed(1)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="map-container">
            <LoadScript googleMapsApiKey="AIzaSyBmfj-U3U-CXmdqT6bpn_WdIQUub-JO0gk">
              <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={13}>
                {itinerary.activities.map((place, index) => (
                  <Marker 
                    key={index} 
                    position={{ lat: place.lat, lng: place.lng }} 
                    title={`${index + 1}. ${place.name}`} 
                    label={{ text: `${index + 1}`, color: "white", fontWeight: "bold" }}
                  />
                ))}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>
        <div className="button-container">
          <button className="button">Edit</button>
          <button className="button">Save Itinerary</button>
          <button className="button">Export</button>
        </div>
        <p className="thank-you-message">Thank You! Enjoy Your Trip! <FaTrain /> </p>
      </div>
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
            <a href="https://www.instagram.com/yourpage" target="_blank" rel="noopener noreferrer"><FaInstagram /> Instagram</a>
            <a href="https://www.facebook.com/yourpage" target="_blank" rel="noopener noreferrer"><FaFacebook /> Facebook</a>
          </div>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default TravelItinerary;
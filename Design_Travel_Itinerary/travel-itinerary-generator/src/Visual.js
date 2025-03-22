//Visual.js
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import MapComponent from "./MapComponent";
import { FaHotel, FaUtensils, FaMapMarkerAlt, FaTrain, FaStar} from "react-icons/fa";
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
  const [itineraries, setItineraries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const scrollRefs = useRef([]);

  const { username, name } = useParams();
  const lowerUsername = username ? username.toLowerCase() : null;
  const lowerName = name ? name.toLowerCase() : null;
 
  useEffect(() => {
    if (!lowerUsername || !lowerName) {
      console.warn("Username or name missing from URL params");
      return;
    }    

    const fetchItinerary = async (retries = 5) => {
      try {
          console.log("Fetching itinerary for:", lowerUsername, lowerName);
          console.log(`Fetching from URL: http://localhost:5000/api/itineraries/${lowerUsername}/${lowerName}`);
          const response = await axios.get(`http://localhost:5000/api/itineraries/${lowerUsername}/${lowerName}`);
          console.log("API Response:", response.data);  // Debugging log
  
          if (!response.data || !response.data.itinerary) {
              console.error("No valid itinerary data received.");
              throw new Error("Itinerary data not ready.");
          } else {
              setItineraries(response.data);  // Store object, not array
              console.log("Stored itinerary:", response.data);
          }
      } catch (error) {
          console.error("Error fetching itinerary:", error);
          if (retries > 0) {
            console.log(`Retrying... (${6 - retries}/5)`);
            setTimeout(() => fetchItinerary(retries - 1), 500); // wait 2 seconds and try again
          } else {
            console.error("Itinerary generation timeout.");
          }
      } finally {
          console.log("Setting loading to false");
          setLoading(false);
      }
  };  
        fetchItinerary();
      }, [lowerUsername, lowerName]);
      useEffect(() => {
        const loadCoordinates = async () => {
          if (!itineraries?.itinerary) return;
      
          const extractedLocations = [];
      
          Object.values(itineraries.itinerary).forEach(day => {
            if (day?.Hotel?.latitude && day?.Hotel?.longitude) {
              extractedLocations.push({
                lat: day.Hotel.latitude,
                lng: day.Hotel.longitude,
                name: day.Hotel.name
              });
            }
      
            day?.Restaurants?.forEach(rest => {
              if (rest.latitude && rest.longitude) {
                extractedLocations.push({
                  lat: rest.latitude,
                  lng: rest.longitude,
                  name: rest.name
                });
              }
            });
      
            day?.Attractions?.forEach(att => {
              if (att.latitude && att.longitude) {
                extractedLocations.push({
                  lat: att.latitude,
                  lng: att.longitude,
                  name: att.name
                });
              }
            });
          });
      
          setLocations(extractedLocations);
        };
      
        loadCoordinates();
      }, [itineraries]);
      

if (loading) {
  return <p>Loading itineraries...</p>;
}

if (!itineraries || !itineraries.itinerary) {
  return <p>No itinerary found.</p>;
}

  return (
    <div>
      <div className="page-containers">
        <Header />
        <div className="main-layout">
          <div className="itinerary-card">
          <h2 className="itinerary-title">Itineraries for {username}</h2>
          {itineraries?.name && (
  <h2 className="itinerary-subtitle">{itineraries.name.toUpperCase()}'s Itinerary</h2>
)}

          {Object.entries(itineraries.itinerary).map(([dayKey, details], index) => {
              const dayNumberMatch = dayKey.match(/Day (\d+)/);
              const dayNumber = dayNumberMatch ? dayNumberMatch[1] : index + 1;
              const location = dayKey.split(" - ")[0];

              const orderedItems = [
                { type: "Hotel", data: details?.Hotel },
                { type: "Restaurant", data: details?.Restaurants?.[0], label: "Breakfast" },
                { type: "Attraction", data: details?.Attractions?.[0] },
                { type: "Attraction", data: details?.Attractions?.[1] },
                { type: "Restaurant", data: details?.Restaurants?.[1], label: "Lunch" },
                { type: "Attraction", data: details?.Attractions?.[2] },
                { type: "Attraction", data: details?.Attractions?.[3] },
                { type: "Restaurant", data: details?.Restaurants?.[2], label: "Dinner" },
              ];

              return (
                <div key={dayKey}>
                  <h3 className="itinerary-subtitle">Day {dayNumber}: {location}</h3>
                  <ul className="itinerary-list">
                    {orderedItems.map((item, i) => {
                      if (!item.data) return null;
                      const icon = item.type === "Hotel" ? <FaHotel className="activity-icon" />
                        : item.type === "Restaurant" ? <FaUtensils className="activity-icon" />
                        : <FaMapMarkerAlt className="activity-icon" />;
                                     
                      // Identify if this is the active one
                      const isActive =
                        activeLocation &&
                        `${item.data.latitude}-${item.data.longitude}` === `${activeLocation?.lat}-${activeLocation?.lng}`;

                        const refIndex = `${dayKey}-${i}`;
                        scrollRefs.current[refIndex] = React.createRef();

                      return (
                        <li
                          key={i}
                          ef={scrollRefs.current[refIndex]}
                          className="itinerary-item"
                          style={{
                            backgroundColor: isActive ? "#c4f1eb" : "",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            const newLocation = {
                              lat: item.data.latitude,
                              lng: item.data.longitude,
                              name: item.data.name
                            };
                            setActiveLocation(newLocation);
                            setSelectedLocation(newLocation);
                            setTimeout(() => {
                              scrollRefs.current[refIndex]?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }, 100);
                          }}
                        >
                          <div className="activity-header">
                            {icon}
                            <span className="activity-type">{item.label || item.type}:</span> {item.data.name}
                          </div>
                          <div className="activity-second-row">
                            <div className="activity-location"><FaMapMarkerAlt /> <span>{item.data.city || 'Unknown'}</span></div>
                            <div className="activity-rating"><FaStar /> <span>{item.data.rating}/5</span></div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        {/* Ensure map loads dynamically after data */}
        <div className="map-container">
        <MapComponent
  locations={locations}
  activeLocation={activeLocation}
  selectedLocation={selectedLocation}
/>
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
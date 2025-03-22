import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaInstagram, FaFacebook } from "react-icons/fa";

import { Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

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
const Modify = () => {
  const { username, name } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [alternatives, setAlternatives] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/itineraries/${username}/${name}`);
        setItinerary(response.data);

        // Load alternatives for all entries in parallel (mock example)
        const fetchedAlternatives = {};
        for (const [dayKey, day] of Object.entries(response.data.itinerary)) {
          fetchedAlternatives[dayKey] = {
            Hotels: [day.Hotel],
            Restaurants: day.Restaurants,
            Attractions: day.Attractions,
          };
        }
        setAlternatives(fetchedAlternatives);
      } catch (error) {
        console.error('Error fetching itinerary:', error);
      }
    };

    fetchData();
  }, [username, name]);

  const handleReplace = (dayKey, type, indexOrKey, newItem) => {
    const updated = { ...itinerary };
    if (type === 'Hotel') updated.itinerary[dayKey].Hotel = newItem;
    else if (type === 'Restaurants') updated.itinerary[dayKey][type][indexOrKey] = newItem;
    else updated.itinerary[dayKey][type][indexOrKey] = newItem;
    setItinerary(updated);
  };
  
  const handleRemove = (dayKey, type, indexOrKey) => {
    const updated = { ...itinerary };
    if (type === 'Hotel') updated.itinerary[dayKey].Hotel = null;
    else if (type === 'Restaurants') delete updated.itinerary[dayKey][type][indexOrKey];
    else updated.itinerary[dayKey][type].splice(indexOrKey, 1);
    setItinerary(updated);
  };  

  const handleSave = async () => {
    try {
      await axios.post(`http://localhost:5000/api/save-edited-itinerary`, itinerary);
      alert('Itinerary updated!');
      navigate(`/visual/${username}/${name}`);
    } catch (error) {
      console.error('Error saving edited itinerary:', error);
    }
  };

  if (!itinerary) return <div>Loading...</div>;

  return (
    <div className="full-page-container">
        <Header />
    <div className="edit-page-wrapper"> 
      <div className="edit-left">
        <h2>Modify {username.toUpperCase()}'s {name.toUpperCase()} Itinerary</h2>
        {Object.entries(itinerary.itinerary).map(([dayKey, day]) => (
          <div key={dayKey} className="edit-day">
            <h3>{dayKey}</h3>
  
            {/* Hotel */}
            <div>
              <h4>Hotel</h4>
              {day.Hotel ? (
                <div className="edit-item">
                  <span>{day.Hotel.name}</span>
                  <button onClick={() => handleRemove(dayKey, 'Hotel')}>Remove</button>
                </div>
              ) : <p>No hotel selected</p>}
  
          {Object.entries(alternatives[dayKey]?.AlternativeRestaurants || {}).map(([meal, altList]) => (
          altList.slice(0, 3).map((alt, aIdx) => (
            <button key={aIdx} onClick={() => handleReplace(dayKey, 'Restaurants', meal, alt)}>
              Replace {meal} with: {alt.name}
            </button>
          ))
        ))}
            </div>
  
            {/* Restaurants */}
            <div>
              <h4>Restaurants</h4>
              {Object.entries(day.Restaurants || {}).map(([meal, rest], idx) => (
                <div key={idx} className="edit-item">
                  <span>{meal.toUpperCase()}: {rest.name}</span>
                  <button onClick={() => handleRemove(dayKey, 'Restaurants', meal)}>Remove</button>

                  <div className="alt-row">
                    {(alternatives[dayKey]?.AlternativeRestaurants?.[meal] || []).slice(0, 3).map((alt, aIdx) => (
                      <button key={aIdx} onClick={() => handleReplace(dayKey, 'Restaurants', meal, alt)}>
                        Replace with: {alt.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            </div>
  
            {/* Attractions */}
            <div>
              <h4>Attractions</h4>
              {day.Attractions?.map((att, idx) => (
                <div key={idx} className="edit-item">
                  <span>{att.name}</span>
                  <button onClick={() => handleRemove(dayKey, 'Attractions', idx)}>Remove</button>
                  <div className="alt-row">
                    {[...alternatives[dayKey].Attractions].slice(0, 3).map((alt, aIdx) => (
                      <button key={aIdx} onClick={() => handleReplace(dayKey, 'Attractions', idx, alt)}>
                        Replace with: {alt.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button className="save-button" onClick={handleSave}>Save Changes</button>
       
      </div>
  
      <div className="edit-map">
        {/* Optional: You can reuse MapComponent here */}
        {/* Example: */}
        {/* <MapComponent locations={extractedLocations} /> */}
        <div className="placeholder-map">Map will go here</div>
      </div>
    </div>
    <Footer />
    </div>
  );
}

export default Modify;

import React, { useEffect, useState } from 'react';
import Layout from '../src/components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { FaInstagram, FaFacebook } from "react-icons/fa";
import { Link } from 'react-router-dom';
import axios from 'axios';
import MapComponent from './MapComponent'; 
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

const Modify = () => {
  const { username, name } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [alternatives, setAlternatives] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/itineraries/${username}/${name}`);
        const data = response.data;
        setItinerary(data);

        // Load alternatives for all entries in parallel (mock example)
        const fetchedAlternatives = {};
        for (const [dayKey, day] of Object.entries(data.itinerary)) {
          const parsedHotels = (day["Alternative Hotels"] || []).map((item) => {
            if (typeof item === 'object') return item;
            try {
              return JSON.parse(item.replace(/'/g, '"'));
            } catch (e) {
              console.warn('Failed to parse alternative hotel:', item);
              return null;
            }
          }).filter(Boolean);

          fetchedAlternatives[dayKey] = {
            Hotels: [day.Hotel, ...parsedHotels],
            Restaurants: day["Alternative Restaurants"] || {},
            Attractions: day["Alternative Attractions"] || []
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
    const updatedAlts = { ...alternatives };
    const dayData = updated.itinerary[dayKey];
    const altData = updatedAlts[dayKey];
  
    // 🏨 Swap Hotels
    if (type === 'Hotel') {
      const currentHotel = dayData.Hotel;
  
      // Replace current with selected
      dayData.Hotel = newItem;
  
      // Update alternatives: swap currentHotel into alt list, remove newItem
      dayData['Alternative Hotels'] = (dayData['Alternative Hotels'] || []).map(h =>
        h.name === newItem.name ? currentHotel : h
      );
  
      // Also update alternatives state to re-render the button list immediately
      altData.Hotels = [dayData.Hotel, ...(dayData['Alternative Hotels'] || [])];
    }
  
    // 🍽 Swap Restaurants
    else if (type === 'Restaurants') {
      const currentRest = dayData.Restaurants[indexOrKey];
      dayData.Restaurants[indexOrKey] = newItem;
  
      const altList = (dayData['Alternative Restaurants']?.[indexOrKey] || []).map(r =>
        r.name === newItem.name ? currentRest : r
      );
  
      dayData['Alternative Restaurants'] = {
        ...(dayData['Alternative Restaurants'] || {}),
        [indexOrKey]: altList
      };
  
      // Sync with alternatives state
      altData.Restaurants[indexOrKey] = altList;
    }
  
    // 🗺 Swap Attractions
    else if (type === 'Attractions') {
      const currentAtt = dayData.Attractions[indexOrKey];
      dayData.Attractions[indexOrKey] = newItem;
  
      dayData['Alternative Attractions'] = (dayData['Alternative Attractions'] || []).map(a =>
        a.name === newItem.name ? currentAtt : a
      );
  
      // Sync with alternatives state
      altData.Attractions = dayData['Alternative Attractions'];
    }
  
    updated.itinerary[dayKey] = dayData;
    updatedAlts[dayKey] = altData;
  
    setItinerary(updated);
    setAlternatives(updatedAlts);
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
      await axios.post(`http://localhost:5000/api/save-edited-itinerary`, {
        username: itinerary.username,
        name: itinerary.name,
        itinerary: itinerary.itinerary
      });
      
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
        <div className="edit-left-scrollable">
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
                  </div>
                ) : <p>No hotel selected</p>}
                <div className="alt-row">
                {alternatives[dayKey]?.Hotels?.slice(1, 4).map((alt, idx) => (
                  <button key={idx} className="replace-btn" onClick={() => handleReplace(dayKey, 'Hotel', null, alt)}>
                    Replace with: {alt.name}
                  </button>
                  ))}
              </div>
              </div>

              {/* Restaurants */}
              <div>
                <h4>Restaurants</h4>
                {Object.entries(day.Restaurants || {}).map(([meal, rest], idx) => (
                  <div key={idx} className="edit-item">
                    <span>{meal.toUpperCase()}: {rest.name}</span>
                    <button className="remove-btn" onClick={() => handleRemove(dayKey, 'Restaurants', meal)}>Remove</button>
                    <div className="alt-row">
                    {(alternatives[dayKey]?.Restaurants?.[meal] || []).slice(0, 3).map((alt, aIdx) => (
                      <button key={aIdx} className="replace-btn" onClick={() => handleReplace(dayKey, 'Restaurants', meal, alt)}>
                        Replace {meal} with: {alt.name}
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
    <button className="remove-btn" onClick={() => handleRemove(dayKey, 'Attractions', idx)}>Remove</button>
    <div className="alt-row">
      {(alternatives[dayKey]?.Attractions?.[att.name] || []).map((alt, aIdx) => (
        <button key={aIdx} className="replace-btn" onClick={() => handleReplace(dayKey, 'Attractions', idx, alt)}>
          Replace with: {alt.name}
        </button>
      ))}
    </div>
  </div>
))}

              </div>
            </div>
          ))}
        </div>
  
        <div className="edit-map">
  <MapComponent
    locations={
      Object.values(itinerary.itinerary).flatMap((day) => {
        const locs = [];

        if (day.Hotel)
          locs.push({ ...day.Hotel, lat: day.Hotel.latitude, lng: day.Hotel.longitude });

        Object.values(day.Restaurants || {}).forEach((rest) => {
          if (rest) locs.push({ ...rest, lat: rest.latitude, lng: rest.longitude });
        });

        (day.Attractions || []).forEach((att) => {
          if (att) locs.push({ ...att, lat: att.latitude, lng: att.longitude });
        });

        return locs;
      })
    }
    activeLocation={null}
    transportModesPerDay={itinerary.itinerary}
  />
</div>


      </div>
      <button className="save-button" onClick={handleSave}>Save Changes</button>

      <Layout>
    </Layout>
      <Footer />
    </div>
  );
};

export default Modify;

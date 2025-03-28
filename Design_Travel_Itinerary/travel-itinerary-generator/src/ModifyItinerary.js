import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaHotel, FaUtensils, FaMapMarkerAlt, FaInstagram, FaFacebook } from 'react-icons/fa';
import './ItineraryApp.css';
import Layout from './components/Layout';

const Header = () => {
  const { username, itinerary_name } = useParams();
  return (
    <header className="header">
      <img src="/assests/IconPearl.png" alt="Logo" />
      <ul className="nav-links">
        <Link to="/home">Home</Link>
        <Link to={`/visual/${username}/${itinerary_name}`}>Itinerary</Link>
        <Link to="/chatbot">Help!</Link>
        <Link to="/about-us">About Us</Link>
        <Link to="/features">Features</Link>
      </ul>
    </header>
  );
};

const Footer = () => (
  <footer className="footer mt-8">
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

const ModifyItinerary = () => {
  const { username, itinerary_name } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/itinerary/${username}/${itinerary_name}`);
        const data = await res.json();
        setItinerary(data);
      } catch (err) {
        console.error("Failed to load itinerary:", err);
      }
    };

    fetchItinerary();
  }, [username, itinerary_name]);

  const handleChange = async (type, dayIndex, mealType = null, attractionIndex = null) => {
    try {
      const res = await fetch(`http://localhost:5001/api/change-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          itineraryName: itinerary_name,
          dayIndex,
          type,
          mealType,
          attractionIndex
        })
      });
  
      const newRec = await res.json();
      if (!itinerary) return;
  
      // ❌ If backend responds with an error, show alert and skip
      if (newRec.error) {
        alert(`⚠️ ${newRec.error}`);
        return;
      }
  
      // ✅ Update frontend itinerary only if response is valid
      const updatedItinerary = { ...itinerary };
      const day = updatedItinerary.days[dayIndex];
  
      if (type === 'hotel') {
        day.hotel = newRec;
      } else if (type === 'restaurant') {
        day.meals[mealType] = newRec;
      } else if (type === 'attraction') {
        day.attractions[attractionIndex] = newRec;
      }
  
      setItinerary(updatedItinerary);
    } catch (err) {
      console.error("Change failed:", err);
      alert("Something went wrong while changing.");
    }
  };
  

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/save-updated-itinerary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itinerary)
      });

      if (res.ok) {
        alert("✅ Itinerary updated successfully!");
        navigate(`/visual/${username}/${itinerary_name}`);
      } else {
        alert("❌ Failed to save itinerary.");
      }
    } catch (err) {
      console.error("Error saving updated itinerary:", err);
      alert("❌ Failed to save changes.");
    }
  };

  if (!itinerary) return <p className="text-center mt-20 text-lg">Loading itinerary...</p>;

  return (
    <div className="page-containers">
      <Header />

      <div className="main-layout single">
        <div className="itinerary-card">
          <h1 className="itinerary-title">
            MODIFY {(username || itinerary.username || "Your").toUpperCase()}'S ITINERARY
          </h1>

          {itinerary.days.map((day, idx) => (
            <div key={idx} className="bg-green-50 p-4 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Day {day.day}: {day.destination}</h2>

              {/* Hotel */}
              {day.hotel?.name && (
                <div className="itinerary-item">
                  <div className="activity-header">
                    <FaHotel className="activity-icon" />Hotel: {day.hotel.name}
                  </div>
                  <div className="activity-second-row">
                    <div className="activity-location"><FaMapMarkerAlt /> {day.hotel.address || day.hotel.city}</div>
                    <div className="activity-rating">⭐ {day.hotel.rating} {day.hotel.price && `| Rs. ${day.hotel.price}`}</div>
                  </div>
                  <button className="change-button" onClick={() => handleChange('hotel', idx)}>Change Hotel</button>
                </div>
              )}

              {/* Meals */}
              {['breakfast', 'lunch', 'dinner'].map(mealType => {
                const meal = day.meals?.[mealType];
                return meal?.name && (
                  <div key={mealType} className="itinerary-item">
                    <div className="activity-header">
                      <FaUtensils className="activity-icon" />{mealType.charAt(0).toUpperCase() + mealType.slice(1)}: {meal.name}
                    </div>
                    <div className="activity-second-row">
                      <div className="activity-location"><FaMapMarkerAlt /> {meal.address || meal.city}</div>
                      <div className="activity-rating">
                        ⭐ {meal.rating} {meal.cuisines && `| ${meal.cuisines}`} {meal.pricelevel_lkr && `| Rs. ${meal.pricelevel_lkr}`}
                      </div>
                    </div>
                    <button className="change-button" onClick={() => handleChange('restaurant', idx, mealType)}>
                      Change {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Restaurant
                    </button>
                  </div>
                );
              })}

              {/* Attractions */}
              {day.attractions?.map((attr, i) => attr?.name && (
                <div key={i} className="itinerary-item">
                  <div className="activity-header">
                    <FaMapMarkerAlt className="activity-icon" />Attraction: {attr.name}
                  </div>
                  <div className="activity-second-row">
                    <div className="activity-location"><FaMapMarkerAlt /> {attr.address || attr.city}</div>
                    <div className="activity-rating">⭐ {attr.rating} {attr.price && `| Rs. ${attr.price}`}</div>
                  </div>
                  <button className="change-button" onClick={() => handleChange('attraction', idx, null, i)}>
                    Change Attraction
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

      
      </div>
      <div className="save-button-wrapper">
        <button className="viz-button" onClick={handleSave}>Save Changes</button>
      </div>
      <Layout>
      </Layout>
      <Footer />
    </div>
  );
};

export default ModifyItinerary;
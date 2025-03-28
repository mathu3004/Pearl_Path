import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from './components/Layout';
import L from 'leaflet';
import { FaHotel, FaUtensils, FaMapMarkerAlt, FaInstagram, FaFacebook } from 'react-icons/fa';
import './ItineraryApp.css';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom'; 

// Marker icon fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

const Header = () => {
  return (
    <header className="header">
      <img src="/assests/IconPearl.png" alt="Logo" />
      <ul className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/visual/testuser/sample-itinerary">Itinerary</Link>
        <Link to="/chatbot">Help!</Link>
        <Link to="/about-us">AboutUs</Link>
        <Link to="/features">Features</Link>
      </ul>
    </header>
  );
};

const Footer = () => {
  return (
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
};

const VisualizationItinerary = () => {
  const { username, itinerary_name } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/itinerary/${username.toLowerCase()}/${itinerary_name.toLowerCase()}`);
        if (!res.ok) {
          const text = await res.text();
          console.error(`Failed to fetch itinerary: ${res.status}`, text);
          return;
        }

        const data = await res.json();
        setItinerary(data);
        const allLocations = [];

        const fetchCoordinates = async (placeName) => {
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName + " Sri Lanka")}`);
            const result = await response.json();
            if (result.length > 0) {
              return {
                lat: parseFloat(result[0].lat),
                lng: parseFloat(result[0].lon),
              };
            }
          } catch (error) {
            console.warn("Geocoding failed for:", placeName);
          }
          return null;
        };

        for (const day of data?.days || []) {
          // Hotel
          if (day.hotel?.name) {
            if (day.hotel.latitude && day.hotel.longitude) {
              allLocations.push({
                type: 'Hotel',
                name: day.hotel.name,
                lat: day.hotel.latitude,
                lng: day.hotel.longitude,
              });
            } else {
              const coords = await fetchCoordinates(day.hotel.name);
              if (coords) {
                allLocations.push({
                  type: 'Hotel',
                  name: day.hotel.name,
                  ...coords,
                });
              }
            }
          }

          // Meals
          if (day.meals) {
            for (const mealType of ['breakfast', 'lunch', 'dinner']) {
              const place = day.meals[mealType];
              if (place?.name) {
                if (place.latitude && place.longitude) {
                  allLocations.push({ type: mealType, name: place.name, lat: place.latitude, lng: place.longitude });
                } else {
                  const coords = await fetchCoordinates(place.name);
                  if (coords) {
                    allLocations.push({ type: mealType, name: place.name, ...coords });
                  }
                }
              }
            }
          }

          // Attractions
          if (Array.isArray(day.attractions)) {
            for (const attraction of day.attractions) {
              if (attraction?.name) {
                if (attraction.latitude && attraction.longitude) {
                  allLocations.push({ type: 'Attraction', name: attraction.name, lat: attraction.latitude, lng: attraction.longitude });
                } else {
                  const coords = await fetchCoordinates(attraction.name);
                  if (coords) {
                    allLocations.push({ type: 'Attraction', name: attraction.name, ...coords });
                  }
                }
              }
            }
          }
        }

        setLocations(allLocations);
      } catch (err) {
        console.error("Error fetching itinerary:", err);
      }
    };

    fetchItinerary();
  }, [username, itinerary_name]);

  if (!itinerary) return <p className="text-center mt-20 text-lg">Loading itinerary...</p>;

  const handleOptionalSave = async () => {
    console.log("🚀 Itinerary object in save handler:", itinerary);
  
    if (!itinerary?.username || !itinerary?.itinerary_name) {
      alert("❌ Cannot save: Missing username or itinerary name.");
      return;
    }
  
    try {
      const res = await fetch('http://localhost:5001/api/save-itinerary-to-saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: itinerary.username,
          itinerary_name: itinerary.itinerary_name,
        }),
      });
  
      const contentType = res.headers.get('content-type');
  
      if (!res.ok) {
        const errorText = contentType?.includes("application/json")
          ? await res.json()
          : await res.text(); // fallback for HTML error page
  
        throw new Error(
          typeof errorText === "string"
            ? errorText
            : errorText?.error || "Server error"
        );
      }
  
      alert("✅ Itinerary saved to your saved list!");
    } catch (err) {
      console.error("❌ Error saving itinerary:", err);
      alert("❌ Failed to save itinerary: " + err.message);
    }
  };
  
  
  return (
    <div className="page-containers">
      <Header />

      <div className="main-layout">
        <div className="itinerary-card">
          <h1 className="itinerary-title">
            {(itinerary.username || username || "Your").toUpperCase()}'S ITINERARY
          </h1>

          {Array.isArray(itinerary.days) && itinerary.days.map((day, idx) => (
            <div key={idx} className="bg-green-50 p-4 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Day {day.day}: {day.destination}</h2>

              {/* Hotel */}
              {day.hotel?.name && (
                <a href={day.hotel.weburl || "#"} target="_blank" rel="noreferrer" className="itinerary-item">
                  <div className="activity-header"><FaHotel className="activity-icon" />Hotel: {day.hotel.name}</div>
                  <div className="activity-second-row">
                    <div className="activity-location"><FaMapMarkerAlt /> {day.hotel.address || day.hotel.city}</div>
                    <div className="activity-rating">
                      ⭐ {day.hotel.rating}
                      {day.hotel.price && <> | Rs. {day.hotel.price}</>}
                    </div>
                  </div>
                </a>
              )}

              {/* Breakfast */}
              {day.meals?.breakfast?.name && (
                <a href={day.meals.breakfast.weburl || "#"} target="_blank" rel="noreferrer" className="itinerary-item">
                  <div className="activity-header"><FaUtensils className="activity-icon" />Breakfast: {day.meals.breakfast.name}</div>
                  <div className="activity-second-row">
                    <div className="activity-location"><FaMapMarkerAlt /> {day.meals.breakfast.address || day.meals.breakfast.city}</div>
                    <div className="activity-rating">
                      ⭐ {day.meals.breakfast.rating}
                      {day.meals.breakfast.cuisines && <> | {day.meals.breakfast.cuisines}</>}
                      {day.meals.breakfast.pricelevel_lkr && <> | Rs. {day.meals.breakfast.pricelevel_lkr}</>}
                    </div>
                  </div>
                </a>
              )}

              {/* Attraction 1 */}
              {day.attractions?.[0]?.name && (
                <a href={day.attractions[0].weburl || "#"} target="_blank" rel="noreferrer" className="itinerary-item">
                  <div className="activity-header"><FaMapMarkerAlt className="activity-icon" />Attraction: {day.attractions[0].name}</div>
                  <div className="activity-second-row">
                    <div className="activity-location"><FaMapMarkerAlt /> {day.attractions[0].address || day.attractions[0].city}</div>
                    <div className="activity-rating">
                      ⭐ {day.attractions[0].rating}
                      {day.attractions[0].price && <> | Rs. {day.attractions[0].price}</>}
                    </div>
                  </div>
                </a>
              )}

              {/* Lunch */}
              {day.meals?.lunch?.name && (
                <a href={day.meals.lunch.weburl || "#"} target="_blank" rel="noreferrer" className="itinerary-item">
                  <div className="activity-header"><FaUtensils className="activity-icon" />Lunch: {day.meals.lunch.name}</div>
                  <div className="activity-second-row">
                    <div className="activity-location"><FaMapMarkerAlt /> {day.meals.lunch.address || day.meals.lunch.city}</div>
                    <div className="activity-rating">
                      ⭐ {day.meals.lunch.rating}
                      {day.meals.lunch.cuisines && <> | {day.meals.lunch.cuisines}</>}
                      {day.meals.lunch.pricelevel_lkr && <> | Rs. {day.meals.lunch.pricelevel_lkr}</>}
                    </div>
                  </div>
                </a>
              )}

              {/* Attraction 2 */}
              {day.attractions?.[1]?.name && (
                <a href={day.attractions[1].weburl || "#"} target="_blank" rel="noreferrer" className="itinerary-item">
                  <div className="activity-header"><FaMapMarkerAlt className="activity-icon" />Attraction: {day.attractions[1].name}</div>
                  <div className="activity-second-row">
                    <div className="activity-location"><FaMapMarkerAlt /> {day.attractions[1].address || day.attractions[1].city}</div>
                    <div className="activity-rating">
                      ⭐ {day.attractions[1].rating}
                      {day.attractions[1].price && <> | Rs. {day.attractions[1].price}</>}
                    </div>
                  </div>
                </a>
              )}

              {/* Dinner */}
              {day.meals?.dinner?.name && (
                <a href={day.meals.dinner.weburl || "#"} target="_blank" rel="noreferrer" className="itinerary-item">
                  <div className="activity-header"><FaUtensils className="activity-icon" />Dinner: {day.meals.dinner.name}</div>
                  <div className="activity-second-row">
                    <div className="activity-location"><FaMapMarkerAlt /> {day.meals.dinner.address || day.meals.dinner.city}</div>
                    <div className="activity-rating">
                      ⭐ {day.meals.dinner.rating}
                      {day.meals.dinner.cuisines && <> | {day.meals.dinner.cuisines}</>}
                      {day.meals.dinner.pricelevel_lkr && <> | Rs. {day.meals.dinner.pricelevel_lkr}</>}
                    </div>
                  </div>
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="map-container" style={{ height: '90vh', width: '100%' }}>
          <MapContainer
            center={[7.8731, 80.7718]}
            zoom={7}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '25px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {locations
              .filter(loc => loc.lat !== null && loc.lng !== null && !isNaN(loc.lat) && !isNaN(loc.lng))
              .map((loc, idx) => (
               <Marker key={idx} position={[loc.lat, loc.lng]}>
                <Popup>
                    <strong>{loc.type}</strong>: {loc.name}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
      <div className="button-container" style={{ marginTop: '40px', marginBottom: '30px' }}>
  <button
    className="viz-button"
    onClick={() => navigate(`/modify/${username}/${itinerary_name}`)}
  >
    Modify Itinerary
  </button>

  <button
    className="viz-button"
    onClick={async () => {
      const itineraryDiv = document.querySelector(".main-layout");
      if (!itineraryDiv) return alert("Unable to find itinerary section");

      try {
        const canvas = await html2canvas(itineraryDiv, { useCORS: true });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `${username}_${itinerary_name}_itinerary.png`;
        link.href = image;
        link.click();
      } catch (err) {
        console.error("Error exporting itinerary:", err);
      }
    }}
  >
    Export Itinerary
  </button>

  <button className="viz-button" onClick={handleOptionalSave}>
    Save Itinerary
  </button>

</div>
<Layout>
</Layout>
      <Footer />
    </div>
  );
};

export default VisualizationItinerary;
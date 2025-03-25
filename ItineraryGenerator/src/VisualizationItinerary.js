import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaHotel, FaUtensils, FaMapMarkerAlt, FaInstagram, FaFacebook } from 'react-icons/fa';
import './App.css';

// Marker icon fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

// Explicitly reset marker defaults
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

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/itinerary/${username.toLowerCase()}/${itinerary_name.toLowerCase()}`);
        
        if (!res.ok) {
          const text = await res.text();
          console.error(`Failed to fetch itinerary: ${res.status}`, text);
          return; // Stop execution if error
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
              <h2 className="text-xl font-semibold mb-2">Day {day.day}: {day.destination}</h2>

              <div className="mb-2">
                <p className="font-bold text-green-800 flex items-center gap-2"><FaHotel /> Hotel: {day.hotel.name}</p>
                <p className="text-sm text-gray-600">
                  Rating: {day.hotel.rating} | Price: {day.hotel.price} <br />
                  <a href={day.hotel.weburl} className="text-blue-500 underline" target="_blank" rel="noreferrer">Hotel Website</a>
                </p>
              </div>

              {['breakfast', 'lunch', 'dinner'].map((mealKey) => {
                const meal = day.meals[mealKey];
                return (
                  <div key={mealKey} className="mb-2">
                    <p className="font-bold text-green-700 flex items-center gap-2"><FaUtensils /> {mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}: {meal.name}</p>
                    <p className="text-sm text-gray-600">
                      Cuisines: {meal.cuisines} <br />
                      Meal Types: {meal.mealtypes} <br />
                      Dietary: {meal.dietaryrestrictions} <br />
                      Price: {meal.pricelevel_lkr} <br />
                      <a href={meal.weburl} className="text-blue-500 underline" target="_blank" rel="noreferrer">Restaurant Website</a>
                    </p>
                  </div>
                );
              })}

              {day.attractions.map((attraction, aIdx) => (
                <div key={aIdx} className="mb-2">
                  <p className="font-bold text-green-600 flex items-center gap-2"><FaMapMarkerAlt /> Attraction: {attraction.name}</p>
                  <p className="text-sm text-gray-600">
                    Rating: {attraction.rating} | Price: {attraction.price} <br />
                    <a href={attraction.weburl} className="text-blue-500 underline" target="_blank" rel="noreferrer">Attraction Website</a>
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="map-container">
          <MapContainer center={[7.8731, 80.7718]} zoom={7} scrollWheelZoom={true} className="h-[90vh] w-full rounded-xl shadow-md">
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

      <Footer />
    </div>
  );
};

export default VisualizationItinerary;

import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  FaHotel,
  FaUtensils,
  FaMapMarkerAlt,
  FaStar,
  FaTrain,
  FaInstagram,
  FaFacebook,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";

const Header = () => {
  return (
    <header className="header">
      <img src="IconPearl.png" alt="Logo" />
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

const itinerary = {
  name: "Minal's Itinerary",
  days: [
    {
      day: 1,
      destination: "Colombo",
      activities: [
        {
          type: "Hotel",
          name: "Cinnamon Grand",
          location: "Colombo 03",
          rating: 4.5,
          lat: 6.9271,
          lng: 79.8612,
          icon: <FaHotel />,
        },
        {
          type: "Breakfast",
          name: "The English Cake Company",
          location: "Park Road, Colombo",
          rating: 4.7,
          lat: 6.917,
          lng: 79.875,
          icon: <FaUtensils />,
        },
        {
          type: "Attraction",
          name: "Galle Face Green",
          location: "Galle Road, Colombo",
          rating: 4.6,
          lat: 6.9271,
          lng: 79.8449,
          icon: <FaMapMarkerAlt />,
        },
        {
          type: "Lunch",
          name: "Ministry of Crab",
          location: "Old Dutch Hospital, Colombo",
          rating: 4.8,
          lat: 6.9344,
          lng: 79.8428,
          icon: <FaUtensils />,
        },
        {
          type: "Attraction",
          name: "National Museum",
          location: "Sir Marcus Fernando Mawatha, Colombo",
          rating: 4.5,
          lat: 6.9271,
          lng: 79.8659,
          icon: <FaMapMarkerAlt />,
        },
        {
          type: "Dinner",
          name: "Nuga Gama",
          location: "Colombo 02",
          rating: 4.7,
          lat: 6.926,
          lng: 79.8496,
          icon: <FaUtensils />,
        },
      ],
    },
  ],
};

const mapContainerStyle = {
  width: "100%",
  height: "910px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
};

const center = { lat: 6.9271, lng: 79.8612 };

const TravelItinerary = () => {
  return (
    <div>
      <div className="page-containers">
        <Header />
        <div className="main-layout">
          <div className="itinerary-card">
            <h2 className="itinerary-title">{itinerary.name}</h2>
            {itinerary.days.map((day, index) => (
              <div key={index}>
                <h3 className="itinerary-subtitle">
                  Day {day.day}: {day.destination}
                </h3>
                <ul className="itinerary-list">
                  {day.activities.map((activity, idx) => (
                    <li key={idx} className="itinerary-item">
                      <div className="activity-header">
                        <span className="activity-icon">{activity.icon}</span>
                        <span className="activity-type">
                          {activity.type}:
                        </span>{" "}
                        {activity.name}
                      </div>
                      <div className="activity-second-row">
                        <span className="activity-location">
                          <FaMapMarkerAlt /> {activity.location}
                        </span>
                        <span className="activity-rating">
                          <FaStar /> {activity.rating.toFixed(1)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="map-container">
            <LoadScript googleMapsApiKey="AIzaSyBmfj-U3U-CXmdqT6bpn_WdIQUub-JO0gk">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
              >
                {itinerary.days[0].activities.map((place, index) => (
                  <Marker
                    key={index}
                    position={{ lat: place.lat, lng: place.lng }}
                    title={`${index + 1}. ${place.name}`}
                    label={{
                      text: `${index + 1}`,
                      color: "white",
                      fontWeight: "bold",
                    }}
                    icon={
                      window.google && window.google.maps
                        ? {
                            url: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=${
                              index + 1
                            }|0f766e|ffffff`,
                            scaledSize: new window.google.maps.Size(40, 40),
                          }
                        : undefined
                    }
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
        <p className="thank-you-message">
          Thank You! Enjoy Your Trip! <FaTrain />{" "}
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default TravelItinerary;

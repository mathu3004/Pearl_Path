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

  const Header = () => (
    <header className="flex items-center justify-between bg-gray-800 bg-opacity-75 px-6 py-4 fixed top-0 left-0 w-full z-50">
      <img src="IconPearl.png" alt="Logo" className="h-12" />
      <ul className="hidden md:flex space-x-6 text-white">
        <li>
          <Link to="/home" className="hover:text-gray-300">
            Home
          </Link>
        </li>
        <li>
          <Link to="/generateItinerary" className="hover:text-gray-300">
            Itinerary
          </Link>
        </li>
        <li>
          <Link to="/chatbot" className="hover:text-gray-300">
            Help!
          </Link>
        </li>
        <li>
          <Link to="/about-us" className="hover:text-gray-300">
            About Us
          </Link>
        </li>
        <li>
          <Link to="/features" className="hover:text-gray-300">
            Features
          </Link>
        </li>
      </ul>
    </header>
  );

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
            icon: <FaHotel className="text-green-600" />,
          },
          {
            type: "Breakfast",
            name: "The English Cake Company",
            location: "Park Road, Colombo",
            rating: 4.7,
            lat: 6.917,
            lng: 79.875,
            icon: <FaUtensils className="text-green-600" />,
          },
          {
            type: "Attraction",
            name: "Galle Face Green",
            location: "Galle Road, Colombo",
            rating: 4.6,
            lat: 6.9271,
            lng: 79.8449,
            icon: <FaMapMarkerAlt className="text-green-600" />,
          },
          {
            type: "Lunch",
            name: "Ministry of Crab",
            location: "Old Dutch Hospital, Colombo",
            rating: 4.8,
            lat: 6.9344,
            lng: 79.8428,
            icon: <FaUtensils className="text-green-600" />,
          },
          {
            type: "Attraction",
            name: "National Museum",
            location: "Sir Marcus Fernando Mawatha, Colombo",
            rating: 4.5,
            lat: 6.9271,
            lng: 79.8659,
            icon: <FaMapMarkerAlt className="text-green-600" />,
          },
          {
            type: "Dinner",
            name: "Nuga Gama",
            location: "Colombo 02",
            rating: 4.7,
            lat: 6.926,
            lng: 79.8496,
            icon: <FaUtensils className="text-green-600" />,
          },
        ],
      },
    ],
  };

  const mapContainerStyle = {
    width: "100%",
    height: "910px",
    borderRadius: "20px",
  };

  const center = {
    lat: 6.9271,
    lng: 79.8612,
  };

  const HomePage = () => {
    return (
      <div className="pt-20 bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white bg-opacity-75 backdrop-blur-md rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-center mb-6">
              {itinerary.name}
            </h2>
            {itinerary.days.map((day, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-xl font-semibold text-green-700 mb-4">
                  Day {day.day}: {day.destination}
                </h3>
                <ul className="space-y-3">
                  {day.activities.map((activity, idx) => (
                    <li key={idx} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        <span className="mr-2">{activity.icon}</span>
                        <span className="font-semibold">{activity.type}:</span>
                        <span className="ml-2">{activity.name}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="flex items-center">
                          <FaMapMarkerAlt className="mr-1" /> {activity.location}
                        </span>
                        <span className="flex items-center">
                          <FaStar className="mr-1 text-yellow-500" />{" "}
                          {activity.rating.toFixed(1)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-white bg-opacity-75 backdrop-blur-md rounded-xl shadow-lg p-8 mb-8">
            <LoadScript googleMapsApiKey="AIzaSyBmfj-U3U-CXmdqT6bpn_WdIQUub-JO0gk">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
                options={{ disableDefaultUI: true }}
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
                      window.google?.maps
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

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Edit
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
              Save Itinerary
            </button>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">
              Export
            </button>
          </div>

          <p className="text-center text-xl font-semibold text-green-700">
            Thank You! Enjoy Your Trip! <FaTrain className="inline ml-2" />
          </p>
        </div>
        <Footer />
      </div>
    );
  };

  const Footer = () => (
    <footer className="bg-gray-800 bg-opacity-75 text-white py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div>&copy; 2025 Pearl Path. All rights reserved.</div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a
            href="https://www.instagram.com/yourpage"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300"
          >
            <FaInstagram className="inline mr-1" /> Instagram
          </a>
          <a
            href="https://www.facebook.com/yourpage"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300"
          >
            <FaFacebook className="inline mr-1" /> Facebook
          </a>
          <a href="/contact" className="hover:text-gray-300">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );

  export default HomePage;

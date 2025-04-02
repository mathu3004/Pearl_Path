import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { FaMapMarkerAlt, FaStar, FaTrain } from "react-icons/fa";

const itinerary = {
  name: "Minal's Itinerary",
  days: [
    {
      day: 1,
      destination: "Colombo",
      activities: [
        // Insert your activity objects here if needed
      ],
    },
  ],
};

const mapContainerStyle = {
  width: "100%",
  height: "700px",
  borderRadius: "20px",
};
const center = { lat: 6.9271, lng: 79.8612 };

const UserDashboard = () => {
  return (
    <div className="min-h-screen pt-20 pb-8 px-4 bg-gray-100">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="glass-container p-6">
          <h2 className="text-2xl font-bold text-center mb-4">
            {itinerary.name}
          </h2>
          {itinerary.days.map((day, dIndex) => (
            <div key={dIndex} className="mb-6">
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                Day {day.day}: {day.destination}
              </h3>
              <ul className="space-y-3">
                {day.activities.map((activity, aIndex) => (
                  <li
                    key={aIndex}
                    className="p-4 bg-white bg-opacity-50 backdrop-blur-md rounded-lg shadow-sm"
                  >
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
        <div className="glass-container p-6">
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
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
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
        <p className="text-center text-lg font-semibold text-green-700">
          Thank You! Enjoy Your Trip! <FaTrain className="inline ml-2" />
        </p>
      </div>
    </div>
    
  );
};

export default UserDashboard;

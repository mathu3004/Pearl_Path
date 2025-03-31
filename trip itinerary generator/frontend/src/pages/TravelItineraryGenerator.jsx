import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlaneDeparture,
  FaCar,
  FaBusAlt,
  FaBiking,
  FaWalking,
  FaTrain,
  FaShuttleVan,
} from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";

const TravelItineraryGenerator = () => {
  const [formData, setFormData] = useState({
    name: "",
    startingDestination: "",
    destinations: [],
    activities: [],
    cuisines: [],
    foodPreferences: "",
    transportationMode: [],
    maxDistance: "",
    numberOfDays: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((item) => item !== value),
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/api/itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Itinerary saved successfully!");
        navigate("/pearl", { state: { formData } });
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to save itinerary.");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto p-8">
          <h2 className="text-3xl font-bold text-center mb-6">
            Heal to Nature: Craft your Dream
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="col-span-2">
              <label className="block font-semibold mb-1">
                Itinerary Name:
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your itinerary name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-green-500 rounded-md"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold mb-1">
                Destinations:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Ella", "Kandy", "Nuwara Eliya", "Colombo"].map(
                  (destination) => (
                    <label key={destination} className="flex items-center">
                      <input
                        type="checkbox"
                        name="destinations"
                        value={destination}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      {destination}
                    </label>
                  )
                )}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block font-semibold mb-1">
                Starting Destination:
              </label>
              <select
                name="startingDestination"
                value={formData.startingDestination}
                onChange={handleChange}
                className="w-full p-3 border border-green-500 rounded-md"
                required
              >
                <option value="">Select Starting Destination</option>
                <option value="Ella">Ella</option>
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Nuwara Eliya">Nuwara Eliya</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Number of Days:
              </label>
              <input
                type="number"
                name="numberOfDays"
                placeholder="Enter number of days"
                value={formData.numberOfDays}
                onChange={handleChange}
                className="w-full p-3 border border-green-500 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Maximum Distance (km):
              </label>
              <input
                type="number"
                name="maxDistance"
                placeholder="Enter maximum distance"
                value={formData.maxDistance}
                onChange={handleChange}
                className="w-full p-3 border border-green-500 rounded-md"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold mb-1">Activities:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Historical Sites",
                  "Nature Trails",
                  "Cultural",
                  "Adventurous",
                  "Shopping",
                  "Wildlife",
                  "Religious",
                  "Spa and Wellness",
                ].map((activity) => (
                  <label key={activity} className="flex items-center">
                    <input
                      type="checkbox"
                      name="activities"
                      value={activity}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {activity}
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block font-semibold mb-1">Cuisines:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Italian",
                  "Chinese",
                  "Indian",
                  "Mexican",
                  "Sri-Lankan",
                  "Western",
                  "Thai",
                ].map((cuisine) => (
                  <label key={cuisine} className="flex items-center">
                    <input
                      type="checkbox"
                      name="cuisines"
                      value={cuisine}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {cuisine}
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block font-semibold mb-1">People Count:</label>
              <div className="grid grid-cols-2 gap-2">
                {["1", "2", "3-5", "6+"].map((count) => (
                  <label key={count} className="flex items-center">
                    <input
                      type="radio"
                      name="peopleCount"
                      value={count}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {count}
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block font-semibold mb-1">Food Preference:</label>
              <div className="grid grid-cols-2 gap-2">
                {["Veg", "Non-Veg"].map((preference) => (
                  <label
                    key={preference}
                    className="flex items-center p-2 bg-green-50 border border-green-300 rounded-lg shadow-sm hover:bg-green-100 transition"
                  >
                    <input
                      type="radio"
                      name="foodPreferences"
                      value={preference}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {preference}
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block font-semibold mb-1">
                Transportation Mode:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { mode: "Car", icon: <FaCar /> },
                  { mode: "Bus", icon: <FaBusAlt /> },
                  { mode: "Bike", icon: <FaBiking /> },
                  { mode: "Walk", icon: <FaWalking /> },
                  { mode: "Train", icon: <FaTrain /> },
                  { mode: "Tuk-Tuk", icon: <FaShuttleVan /> },
                ].map(({ mode, icon }) => (
                  <label
                    key={mode}
                    className="flex items-center p-2 bg-green-50 border border-green-300 rounded-lg shadow-sm hover:bg-green-100 transition"
                  >
                    <input
                      type="checkbox"
                      name="transportationMode"
                      value={mode}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="flex items-center gap-2">
                      {icon} {mode}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="col-span-2 w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Get Itinerary <FaPlaneDeparture className="inline ml-2" />
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TravelItineraryGenerator;

// TravelItineraryGenerator.js
// Import necessary dependencies and components
import React, { useState, useContext, useEffect } from 'react';
import Layout from './components/Layout';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import {
  FaPlaneDeparture,
  FaWalking,
  FaCar,
  FaBiking,
  FaBusAlt,
  FaTrain,
  FaShuttleVan,
} from 'react-icons/fa';
import { AuthContext } from './context/auth.context'; // AuthContext provides the fetchProfile method
import './TravelItineraryRadius.css';

// Main component for travel itinerary generation
const TravelItineraryGenerator = () => {
  const { fetchProfile } = useContext(AuthContext); // Auth context for user profile
  const navigate = useNavigate(); // Hook for navigation

  // Initialize form data state
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    startingDestination: '',
    destinations: [],
    hotelBudget: '',
    activities: [],
    cuisines: [],
    foodPreferences: '',
    transportationMode: [],
    maxDistance: '',
    numberOfDays: '',
    peopleCount: '',
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Fetch current logged-in user's username and update state
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await fetchProfile();
        if (profile && profile.user) {
          setFormData((prev) => ({
            ...prev,
            username: profile.user.username,
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
    loadProfile();
  }, [fetchProfile]);

  // Individual field-level validation
  const validateField = (name, value) => {
    let error = '';

    if (name === 'name') {
      if (!/^[A-Za-z\s]+$/.test(value) || value.trim() === '') {
        error = 'Name must contain only alphabetical characters.';
      }
    }

    if (name === 'startingDestination') {
      if (!formData.destinations.includes(value)) {
        error = 'Starting destination must be one of the selected destinations.';
      }
    }

    if (name === 'numberOfDays') {
      if (value < 1 || value > 7) {
        error = 'Number of days must be between 1 and 7.';
      }
    }

    if (name === 'maxDistance') {
      if (value < 20 || value > 40) {
        error = 'Maximum distance must be between 20 and 40 km.';
      }
    }

    if (name === 'hotelBudget') {
      if (value <= 5000) {
        error = 'Hotel budget must be more than 5000.';
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  // Handle form input changes and update state accordingly
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevData) => {
      let newData;

      if (type === 'checkbox') {
        newData = {
          ...prevData,
          [name]: checked
            ? [...prevData[name], value]
            : prevData[name].filter((item) => item !== value),
        };
      } else if (['numberOfDays', 'maxDistance', 'hotelBudget'].includes(name)) {
        newData = { ...prevData, [name]: value ? Number(value) : 0 };
      } else if (name === 'peopleCount') {
        newData = { ...prevData, [name]: String(value) };
      } else {
        newData = { ...prevData, [name]: value };
      }

      validateField(name, newData[name]);
      return newData;
    });
  };

  // Validate the entire form before submission
  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    // Username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required.';
      isValid = false;
    }

    // Name Validation
    if (!/^[A-Za-z\s]+$/.test(formData.name) || formData.name.trim() === '') {
      newErrors.name = 'Name must contain only alphabetical characters.';
      isValid = false;
    }

    // Destinations
    if (formData.destinations.length === 0) {
      newErrors.destinations = 'At least one destination must be selected.';
      isValid = false;
    }

    // Starting destination check
    if (
      !formData.startingDestination ||
      !formData.destinations.includes(formData.startingDestination)
    ) {
      newErrors.startingDestination =
        'Starting destination must be one of the selected destinations.';
      isValid = false;
    }

    // Hotel Budget
    if (!formData.hotelBudget || formData.hotelBudget <= 5000) {
      newErrors.hotelBudget = 'Hotel budget must be more than 5000.';
      isValid = false;
    }

    // Number of Days
    if (
      !formData.numberOfDays ||
      formData.numberOfDays < 1 ||
      formData.numberOfDays > 7
    ) {
      newErrors.numberOfDays = 'Number of days must be between 1 and 7.';
      isValid = false;
    }

    // Max Distance
    if (!formData.maxDistance || formData.maxDistance < 20 || formData.maxDistance > 40) {
      newErrors.maxDistance = 'Maximum distance must be between 20 and 40 km.';
      isValid = false;
    }

    // People Count
    if (!formData.peopleCount) {
      newErrors.peopleCount = 'Please select people count.';
      isValid = false;
    }

    // Food Preference
    if (!formData.foodPreferences) {
      newErrors.foodPreferences = 'Please select your food preference.';
      isValid = false;
    }

    // Transportation Mode
    if (!formData.transportationMode.length) {
      newErrors.transportationMode = 'At least one transportation mode must be selected.';
      isValid = false;
    }

    // Enforce activities and cuisines
    if (!formData.activities.length) {
      newErrors.activities = 'Please select at least one activity.';
      isValid = false;
    }
    if (!formData.cuisines.length) {
      newErrors.cuisines = 'Please select at least one cuisine.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

   // Submit form to backend and handle response
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Data Before Sending:', formData);

    if (!validateForm()) {
      alert(
        'Please fix the errors or select at least one for each field before submitting.'
      );
      return;
    }

    try {
      // POST itinerary data to server
      const response = await fetch('http://localhost:5003/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Itinerary saved successfully!');

        // Poll until itinerary is available (max 8 attempts, ~5 seconds apart)
        let success = false;
        const itineraryName = formData.name.toLowerCase();

        for (let i = 0; i < 8; i++) {
          const checkResponse = await fetch(
            `http://localhost:5003/api/itinerary/${itineraryName}`
          );
          if (checkResponse.ok) {
            success = true;
            break;
          }
          console.log(`Attempt ${i + 1}: Itinerary not ready yet...`);
          await new Promise((resolve) => setTimeout(resolve, 5003));
        }

        if (success) {
          alert('Processing completed! Redirecting...');
          navigate(
            `/visual-radius/${formData.username.toLowerCase()}/${formData.name.toLowerCase()}`
          );
        } else {
          alert('Processing timeout. Try again later.');
        }
      } else {
        // Handle client errors (e.g., duplicate itinerary)
        if (response.status === 400 && data.error) {
          alert('Error: ' + data.error);
        } else {
          console.error('API Error:', data);
          alert('Unexpected error: ' + data.message);
        }
      }
    } catch (error) {
      console.error('Network or Fetch Error:', error);
      alert('Failed to connect to the server. Is it running on port 5003?');
    }
  };

  // JSX structure and form rendering
  return (
    <div className="main">
      <div className="page-container" id="travel-itinerary-generator">
        <Header />
        <div className="glass-card">
          <h2 className="page-title">Craft your Dream</h2>
          <h3 className="page-subtitle">Max Range Based Itinerary</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            {/* Username Field (Read-only) */}
            <div className="col-span-2">
              <label className="form-label">Username:</label>
              <input
                type="text"
                name="username"
                placeholder="Loading username..."
                value={formData.username}
                readOnly
                className="input-box"
                required
              />
              {errors.username && <p className="error-text">{errors.username}</p>}
            </div>
            <br />

            {/* Itinerary Name */}
            <div className="col-span-2">
              <label className="form-label">Itinerary Name:</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your itinerary name"
                value={formData.name}
                onChange={handleChange}
                className="input-box"
                required
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>
            <br />

            {/* Destinations */}
            <div className="col-span-2">
              <label className="form-label">Destinations:</label>
              <div className="form-grid">
                {['Ella', 'Kandy', 'Nuwara Eliya', 'Colombo'].map((destination) => (
                  <label key={destination} className="option-tile">
                    <input
                      type="checkbox"
                      name="destinations"
                      value={destination}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {destination}
                  </label>
                ))}
              </div>
              {errors.destinations && <p className="error-text">{errors.destinations}</p>}
            </div>
            <br />

            {/* Starting Destination */}
            <div className="col-span-2">
              <label className="form-label">Starting Destination:</label>
              <select
                name="startingDestination"
                value={formData.startingDestination}
                onChange={handleChange}
                className="input-box"
                required
              >
                <option value="">Select Starting Destination</option>
                <option value="Ella">Ella</option>
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Nuwara Eliya">Nuwara Eliya</option>
              </select>
              {errors.startingDestination && (
                <p className="error-text">{errors.startingDestination}</p>
              )}
            </div>
            <br />

            {/* Hotel Budget */}
            <div>
              <label className="form-label">Hotel budget per day:</label>
              <input
                type="number"
                name="hotelBudget"
                placeholder="Enter hotel budget per day:"
                value={formData.hotelBudget}
                onChange={handleChange}
                className="input-box"
                required
              />
              {errors.hotelBudget && <p className="error-text">{errors.hotelBudget}</p>}
            </div>
            <br />

            {/* Number of Days */}
            <div>
              <label className="form-label">Number of Days:</label>
              <input
                type="number"
                name="numberOfDays"
                placeholder="Enter number of days"
                value={formData.numberOfDays}
                onChange={handleChange}
                className="input-box"
                required
              />
              {errors.numberOfDays && <p className="error-text">{errors.numberOfDays}</p>}
            </div>
            <br />

            {/* Max Distance */}
            <div>
              <label className="form-label">Maximum Distance (km):</label>
              <input
                type="number"
                name="maxDistance"
                placeholder="Maximum distance from hotel"
                value={formData.maxDistance}
                onChange={handleChange}
                className="input-box"
              />
              {errors.maxDistance && <p className="error-text">{errors.maxDistance}</p>}
            </div>
            <br />

            {/* Activities */}
            <div className="col-span-2">
              <label className="form-label">Activities:</label>
              <div className="checkbox-grid">
                {[
                  'Historical Sites',
                  'Nature Trails',
                  'Cultural',
                  'Adventurous',
                  'Shopping',
                  'Wildlife',
                  'Religious',
                  'Spa and Wellness',
                ].map((activity) => (
                  <label key={activity} className="option-tile">
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
              {errors.activities && <p className="error-text">{errors.activities}</p>}
            </div>
            <br />

            {/* Cuisines */}
            <div className="col-span-2">
              <label className="form-label">Cuisines:</label>
              <div className="checkbox-grid">
                {[
                  'Italian',
                  'Chinese',
                  'Indian',
                  'Mexican',
                  'Sri Lankan',
                  'Western',
                  'Thai',
                ].map((cuisine) => (
                  <label key={cuisine} className="option-tile">
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
              {errors.cuisines && <p className="error-text">{errors.cuisines}</p>}
            </div>
            <br />

            {/* People Count */}
            <div className="col-span-2">
              <label className="form-label">People Count:</label>
              <div className="radio-grid">
                {['1', '2', '3-5', '6+'].map((count) => (
                  <label key={count} className="option-tile">
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
              {errors.peopleCount && <p className="error-text">{errors.peopleCount}</p>}
            </div>
            <br />

            {/* Food Preference */}
            <div className="col-span-2">
              <label className="form-label">Food Preference:</label>
              <div className="radio-grid">
                {['Veg', 'Non-Veg'].map((preference) => (
                  <label key={preference} className="option-tile">
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
              {errors.foodPreferences && (
                <p className="error-text">{errors.foodPreferences}</p>
              )}
            </div>
            <br />

            {/* Transportation Mode */}
            <div className="col-span-2">
              <label className="form-label">Transportation Mode:</label>
              <div className="checkbox-grid">
                {[
                  { mode: 'Car', icon: <FaCar /> },
                  { mode: 'Bus', icon: <FaBusAlt /> },
                  { mode: 'Bike', icon: <FaBiking /> },
                  { mode: 'Walk', icon: <FaWalking /> },
                  { mode: 'Train', icon: <FaTrain /> },
                  { mode: 'Tuk-Tuk', icon: <FaShuttleVan /> },
                ].map(({ mode, icon }) => (
                  <label key={mode} className="option-tile">
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
              {errors.transportationMode && (
                <p className="error-text">{errors.transportationMode}</p>
              )}
            </div>
            <br />

            <button type="submit" className="form-button">
              Get Itinerary <FaPlaneDeparture className="inline ml-2" />
            </button>
          </form>
        </div>
        <Layout />
        <Footer />
      </div>
    </div>
  );
};

// CSS Styling for Green Error Messages
const styles = `
  .error-text {
    color: green;
    font-size: 14px;
    font-weight: bold;
    margin-top: 5px;
  }
`;

// Append styles to document head
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default TravelItineraryGenerator;
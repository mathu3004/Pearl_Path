import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import Select from "react-select";
import { AuthContext } from "../context/auth.context";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../index.css"; // Import your external CSS file

// Fade-in keyframes (injected as a <style> block)
const fadeInKeyframes = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    category: "",
    hotel_name: "",
    hotel_hotelclass: "",
    hotel_address: "",
    hotel_description: "",
    hotel_latitude: "",
    hotel_longitude: "",
    hotel_city: "",
    hotel_email: "",
    hotel_phone: "",
    hotel_website: "",
    hotel_weburl: "",
    hotel_all_amenities: "",
    hotel_pricelevel: "",
    hotel_pricerange: "",
    hotel_rankingposition: "",
    hotel_rankingdenom: "",
    hotel_rankingstring: "",
    restaurant_name: "",
    restaurant_address: "",
    restaurant_addressobj_city: "",
    restaurant_latitude: "",
    restaurant_longitude: "",
    restaurant_email: "",
    restaurant_phone: "",
    restaurant_weburl: "",
    restaurant_cuisines: [],
    restaurant_dietaryrestrictions: [],
    restaurant_features: [],
    restaurant_mealtypes: [],
    restaurant_pricelevel_lkr: "",
    restaurant_numberofreviews: "",
    restaurant_rankingposition: "",
    restaurant_rankingdenom: "",
  });

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Example options for your MultiSelect fields
  const cuisinesOptions = [
    { value: "American", label: "American" },
    { value: "Arabic", label: "Arabic" },
    { value: "Asian", label: "Asian" },
    { value: "Bar", label: "Bar" },
    { value: "Cafe", label: "Cafe" },
    { value: "Chinese", label: "Chinese" },
    { value: "Indian", label: "Indian" },
    { value: "Italian", label: "Italian" },
    { value: "Pizza", label: "Pizza" },
    { value: "Pub", label: "Pub" },
    { value: "Sri Lankan", label: "Sri Lankan" },
  ];

  const dietaryOptions = [
    { value: "Vegetarian Friendly", label: "Vegetarian Friendly" },
    { value: "Vegan Options", label: "Vegan Options" },
    { value: "Gluten-Free Options", label: "Gluten-Free Options" },
    { value: "Halal", label: "Halal" },
  ];

  const featuresOptions = [
    { value: "Accepts Credit Cards", label: "Accepts Credit Cards" },
    { value: "Delivery", label: "Delivery" },
    { value: "Free Wifi", label: "Free Wifi" },
    { value: "Outdoor Seating", label: "Outdoor Seating" },
    { value: "Reservations", label: "Reservations" },
    { value: "Serves Alcohol", label: "Serves Alcohol" },
  ];

  const mealTypesOptions = [
    { value: "Breakfast", label: "Breakfast" },
    { value: "Brunch", label: "Brunch" },
    { value: "Lunch", label: "Lunch" },
    { value: "Dinner", label: "Dinner" },
    { value: "Late Night", label: "Late Night" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (fieldName, selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: selectedOptions
          ? selectedOptions.map((opt) => opt.value)
          : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const registrationData = {
      username: formData.username,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role,
      category: formData.category,
      hotelData: {
        name: formData.hotel_name,
        hotelClass: formData.hotel_hotelclass,
        address: formData.hotel_address,
        description: formData.hotel_description,
        latitude: formData.hotel_latitude,
        longitude: formData.hotel_longitude,
        city: formData.hotel_city,
        email: formData.hotel_email,
        phone: formData.hotel_phone,
        website: formData.hotel_website,
        weburl: formData.hotel_weburl,
        amenities: formData.hotel_all_amenities,
        priceLevel: formData.hotel_pricelevel,
        priceRange: formData.hotel_pricerange,
        rankingPosition: formData.hotel_rankingposition,
        rankingDenom: formData.hotel_rankingdenom,
        rankingString: formData.hotel_rankingstring,
      },
      restaurantData: {
        name: formData.restaurant_name,
        address: formData.restaurant_address,
        city: formData.restaurant_addressobj_city,
        latitude: formData.restaurant_latitude,
        longitude: formData.restaurant_longitude,
        email: formData.restaurant_email,
        phone: formData.restaurant_phone,
        weburl: formData.restaurant_weburl,
        cuisines: formData.restaurant_cuisines,
        dietaryRestrictions: formData.restaurant_dietaryrestrictions,
        features: formData.restaurant_features,
        mealTypes: formData.restaurant_mealtypes,
        priceLevelLKR: formData.restaurant_pricelevel_lkr,
        numberOfReviews: formData.restaurant_numberofreviews,
        rankingPosition: formData.restaurant_rankingposition,
        rankingDenom: formData.restaurant_rankingdenom,
      },
    };

    try {
      const res = await register(registrationData);
      if (res.success) {
        setMsg("Registration successful! You can now log in.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Server error");
    }
  };

  return (
      <>
        <Header />
        {/* Inject fade-in keyframes */}
        <style>{fadeInKeyframes}</style>

        {/* Outer container */}
        <div id="register-container">
          {/* Dark overlay */}
          <div id="register-overlay"></div>

          {/* Background image container */}
          <div id="register-bg-container">
            {/* Form container */}
            <div id="register-form-content">
              <h2 id="register-title">Register</h2>

              {error && <p id="register-error">{error}</p>}
              {msg && <p id="register-message">{msg}</p>}

              <form id="register-form" onSubmit={handleSubmit}>
                {/* Role Selection */}
                <div>
                  <label htmlFor="register-role">Register as:</label>
                  <select
                      id="register-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="register-username">Username</label>
                  <input
                      id="register-username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="register-password">Password</label>
                  <input
                      id="register-password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="register-confirmPassword">Confirm Password</label>
                  <input
                      id="register-confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                  />
                </div>

                {/* If Vendor is selected */}
                {role === "vendor" && (
                    <>
                      {/* Category Selection */}
                      <div>
                        <label htmlFor="register-category">Category</label>
                        <select
                            id="register-category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                          <option value="">-- Select Category --</option>
                          <option value="Hotel">Hotel</option>
                          <option value="Restaurant">Restaurant</option>
                        </select>
                      </div>

                      {/* HOTEL FIELDS */}
                      {formData.category === "Hotel" && (
                          <div id="hotel-fields">
                            <h3>Basic Hotel Information</h3>
                            <div>
                              <label htmlFor="hotel-name">Name *</label>
                              <input
                                  id="hotel-name"
                                  type="text"
                                  name="hotel_name"
                                  value={formData.hotel_name}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <div>
                              <label htmlFor="hotel-class">Hotel Class *</label>
                              <select
                                  id="hotel-class"
                                  name="hotel_hotelclass"
                                  value={formData.hotel_hotelclass}
                                  onChange={handleChange}
                                  required
                              >
                                <option value="">-- Select Class --</option>
                                <option value="1 Star">1 Star</option>
                                <option value="2 Star">2 Star</option>
                                <option value="3 Star">3 Star</option>
                                <option value="4 Star">4 Star</option>
                                <option value="5 Star">5 Star</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="hotel-address">Address *</label>
                              <input
                                  id="hotel-address"
                                  type="text"
                                  name="hotel_address"
                                  value={formData.hotel_address}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <div>
                              <label htmlFor="hotel-description">
                                Description (Optional)
                              </label>
                              <textarea
                                  id="hotel-description"
                                  name="hotel_description"
                                  value={formData.hotel_description}
                                  onChange={handleChange}
                                  rows="3"
                              />
                            </div>
                            <div>
                              <label htmlFor="hotel-latitude">Latitude *</label>
                              <input
                                  id="hotel-latitude"
                                  type="text"
                                  name="hotel_latitude"
                                  placeholder="e.g., 6.9271"
                                  value={formData.hotel_latitude}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <div>
                              <label htmlFor="hotel-longitude">Longitude *</label>
                              <input
                                  id="hotel-longitude"
                                  type="text"
                                  name="hotel_longitude"
                                  placeholder="e.g., 79.8612"
                                  value={formData.hotel_longitude}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <div>
                              <label htmlFor="hotel-city">City *</label>
                              <select
                                  id="hotel-city"
                                  name="hotel_city"
                                  value={formData.hotel_city}
                                  onChange={handleChange}
                                  required
                              >
                                <option value="">-- Select City --</option>
                                <option value="Colombo">Colombo</option>
                                <option value="Kandy">Kandy</option>
                                <option value="Nuwara Eliya">Nuwara Eliya</option>
                                <option value="Ella">Ella</option>
                              </select>
                            </div>
                            <h3>Contact Information</h3>
                            <div>
                              <label htmlFor="hotel-email">Email *</label>
                              <input
                                  id="hotel-email"
                                  type="email"
                                  name="hotel_email"
                                  value={formData.hotel_email}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <div>
                              <label htmlFor="hotel-phone">Phone *</label>
                              <input
                                  id="hotel-phone"
                                  type="tel"
                                  name="hotel_phone"
                                  placeholder="+94 712345678"
                                  value={formData.hotel_phone}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <div>
                              <label htmlFor="hotel-website">
                                Website (Official) *
                              </label>
                              <input
                                  id="hotel-website"
                                  type="url"
                                  name="hotel_website"
                                  value={formData.hotel_website}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <div>
                              <label htmlFor="hotel-weburl">External Link (Optional)</label>
                              <input
                                  id="hotel-weburl"
                                  type="url"
                                  name="hotel_weburl"
                                  placeholder="TripAdvisor, etc."
                                  value={formData.hotel_weburl}
                                  onChange={handleChange}
                              />
                            </div>
                            <h3>Hotel Features & Services</h3>
                            <div>
                              <label htmlFor="hotel-all-amenities">
                                Amenities & Services *
                              </label>
                              <input
                                  id="hotel-all-amenities"
                                  type="text"
                                  name="hotel_all_amenities"
                                  placeholder="e.g., Free Wi-Fi, Restaurant, Room Service..."
                                  value={formData.hotel_all_amenities}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <h3>Pricing Information</h3>
                            <div>
                              <label htmlFor="hotel-pricelevel">Price Level *</label>
                              <select
                                  id="hotel-pricelevel"
                                  name="hotel_pricelevel"
                                  value={formData.hotel_pricelevel}
                                  onChange={handleChange}
                                  required
                              >
                                <option value="">-- Select Price Level --</option>
                                <option value="$">Budget ($)</option>
                                <option value="$$">Mid-Range ($$)</option>
                                <option value="$$$">Premium ($$$)</option>
                                <option value="$$$$">Luxury ($$$$)</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="hotel-pricerange">Price Range *</label>
                              <input
                                  id="hotel-pricerange"
                                  type="text"
                                  name="hotel_pricerange"
                                  placeholder="e.g., LKR 5,000 – LKR 15,000"
                                  value={formData.hotel_pricerange}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <div>
                              <label htmlFor="hotel-rankingposition">
                                Ranking Position (Not Required)
                              </label>
                              <input
                                  id="hotel-rankingposition"
                                  type="text"
                                  name="hotel_rankingposition"
                                  value={formData.hotel_rankingposition}
                                  onChange={handleChange}
                              />
                            </div>
                            <div>
                              <label htmlFor="hotel-rankingdenom">
                                Ranking Denominator (Not Required)
                              </label>
                              <input
                                  id="hotel-rankingdenom"
                                  type="text"
                                  name="hotel_rankingdenom"
                                  value={formData.hotel_rankingdenom}
                                  onChange={handleChange}
                              />
                            </div>
                            <div>
                              <label htmlFor="hotel-rankingstring">
                                Ranking String (Not Required)
                              </label>
                              <input
                                  id="hotel-rankingstring"
                                  type="text"
                                  name="hotel_rankingstring"
                                  value={formData.hotel_rankingstring}
                                  onChange={handleChange}
                              />
                            </div>
                          </div>
                      )}

                      {/* RESTAURANT FIELDS */}
                      {formData.category === "Restaurant" && (
                          <div id="restaurant-fields">
                            <h3>Basic Restaurant Information</h3>
                            <div>
                              <label htmlFor="restaurant-name">Name *</label>
                              <input
                                  id="restaurant-name"
                                  type="text"
                                  name="restaurant_name"
                                  value={formData.restaurant_name}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <h3>Location Details</h3>
                            <div>
                              <label htmlFor="restaurant-address">Address *</label>
                              <input
                                  id="restaurant-address"
                                  type="text"
                                  name="restaurant_address"
                                  value={formData.restaurant_address}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <div>
                              <label htmlFor="restaurant-city">City *</label>
                              <select
                                  id="restaurant-city"
                                  name="restaurant_addressobj_city"
                                  value={formData.restaurant_addressobj_city}
                                  onChange={handleChange}
                                  required
                              >
                                <option value="">-- Select City --</option>
                                <option value="Colombo">Colombo</option>
                                <option value="Kandy">Kandy</option>
                                <option value="Ella">Ella</option>
                                <option value="Nuwara Eliya">Nuwara Eliya</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="restaurant-latitude">Latitude *</label>
                              <input
                                  id="restaurant-latitude"
                                  type="text"
                                  name="restaurant_latitude"
                                  placeholder="e.g., 6.9271"
                                  value={formData.restaurant_latitude}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <div>
                              <label htmlFor="restaurant-longitude">Longitude *</label>
                              <input
                                  id="restaurant-longitude"
                                  type="text"
                                  name="restaurant_longitude"
                                  placeholder="e.g., 79.8612"
                                  value={formData.restaurant_longitude}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <h3>Contact Information</h3>
                            <div>
                              <label htmlFor="restaurant-email">Email *</label>
                              <input
                                  id="restaurant-email"
                                  type="email"
                                  name="restaurant_email"
                                  value={formData.restaurant_email}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <div>
                              <label htmlFor="restaurant-phone">Phone *</label>
                              <input
                                  id="restaurant-phone"
                                  type="tel"
                                  name="restaurant_phone"
                                  placeholder="+94 712345678"
                                  value={formData.restaurant_phone}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <div>
                              <label htmlFor="restaurant-weburl">
                                External Link (Website, Social, etc.) *
                              </label>
                              <input
                                  id="restaurant-weburl"
                                  type="url"
                                  name="restaurant_weburl"
                                  value={formData.restaurant_weburl}
                                  onChange={handleChange}
                                  required
                              />
                            </div>
                            <h3>Food & Menu Details</h3>
                            <div>
                              <label htmlFor="restaurant-cuisines">Cuisines *</label>
                              <Select
                                  isMulti
                                  name="restaurant_cuisines"
                                  options={cuisinesOptions}
                                  onChange={(selected) =>
                                      handleMultiSelectChange("restaurant_cuisines", selected)
                                  }
                              />
                            </div>
                            <div>
                              <label htmlFor="restaurant-dietaryrestrictions">
                                Dietary Restrictions *
                              </label>
                              <Select
                                  isMulti
                                  name="restaurant_dietaryrestrictions"
                                  options={dietaryOptions}
                                  onChange={(selected) =>
                                      handleMultiSelectChange(
                                          "restaurant_dietaryrestrictions",
                                          selected
                                      )
                                  }
                              />
                            </div>
                            <div>
                              <label htmlFor="restaurant-features">Features *</label>
                              <Select
                                  isMulti
                                  name="restaurant_features"
                                  options={featuresOptions}
                                  onChange={(selected) =>
                                      handleMultiSelectChange("restaurant_features", selected)
                                  }
                              />
                            </div>
                            <div>
                              <label htmlFor="restaurant-mealtypes">Meal Types *</label>
                              <Select
                                  isMulti
                                  name="restaurant_mealtypes"
                                  options={mealTypesOptions}
                                  onChange={(selected) =>
                                      handleMultiSelectChange("restaurant_mealtypes", selected)
                                  }
                              />
                            </div>
                            <div>
                              <label htmlFor="restaurant-pricelevel_lkr">
                                Price Level (LKR) *
                              </label>
                              <select
                                  id="restaurant-pricelevel_lkr"
                                  name="restaurant_pricelevel_lkr"
                                  value={formData.restaurant_pricelevel_lkr}
                                  onChange={handleChange}
                                  required
                              >
                                <option value="">-- Select Range --</option>
                                <option value="Low">Low (&lt; LKR 500)</option>
                                <option value="Medium">Medium (LKR 500–1500)</option>
                                <option value="High">High (&gt; LKR 1500)</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="restaurant-numberofreviews">
                                Number of Reviews (Not Required)
                              </label>
                              <input
                                  id="restaurant-numberofreviews"
                                  type="text"
                                  name="restaurant_numberofreviews"
                                  value={formData.restaurant_numberofreviews}
                                  onChange={handleChange}
                              />
                            </div>
                            <div>
                              <label htmlFor="restaurant-rankingposition">
                                Ranking Position (Not Required)
                              </label>
                              <input
                                  id="restaurant-rankingposition"
                                  type="text"
                                  name="restaurant_rankingposition"
                                  value={formData.restaurant_rankingposition}
                                  onChange={handleChange}
                              />
                            </div>
                            <div>
                              <label htmlFor="restaurant-rankingdenom">
                                Ranking Denominator (Not Required)
                              </label>
                              <input
                                  id="restaurant-rankingdenom"
                                  type="text"
                                  name="restaurant_rankingdenom"
                                  value={formData.restaurant_rankingdenom}
                                  onChange={handleChange}
                              />
                            </div>
                          </div>
                      )}
                    </>
                )}

                {/* Register Button */}
                <button id="register-button" type="submit">
                  Register
                </button>
              </form>

              {/* Link to Login */}
              <div id="register-links">
                <Link to="/login">Already have an account? Login</Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
  );
};

export default Register;
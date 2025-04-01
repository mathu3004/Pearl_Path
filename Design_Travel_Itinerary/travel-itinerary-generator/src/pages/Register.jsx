import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import Select from "react-select";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
        <style>{fadeInKeyframes}</style>
        <div
            style={{
              position: "relative",
              width: "100%",
              minHeight: "100vh",
              animation: "fadeIn 1s ease forwards",
            }}
        >
          <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                zIndex: 1,
              }}
          />
          <div
              className="min-h-screen flex items-center justify-center bg-cover bg-center pt-20 p-4"
              style={{
                backgroundImage: 'url("/CreateAccount1.jpg")',
                position: "relative",
                zIndex: 2,
              }}
          >
            <div className="glass-container p-8 w-full max-w-3xl bg-white bg-opacity-80 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              {msg && <p className="text-green-600 text-center mb-4">{msg}</p>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center space-x-2">
                  <label className="font-semibold">Register as:</label>
                  <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="p-2 border rounded-md"
                  >
                    <option value="user">User</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Username</label>
                    <input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md"
                        required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Password</label>
                    <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md"
                        required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">
                      Confirm Password
                    </label>
                    <input
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-md"
                        required
                    />
                  </div>
                </div>
                {role === "vendor" && (
                    <>
                      <div className="mt-4">
                        <label className="block font-semibold mb-1">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-md"
                            required
                        >
                          <option value="">-- Select Category --</option>
                          <option value="Hotel">Hotel</option>
                          <option value="Restaurant">Restaurant</option>
                        </select>
                      </div>
                      {formData.category === "Hotel" && (
                          <div className="border-t border-gray-300 pt-6 space-y-6">
                            <h3 className="text-2xl font-semibold text-green-700 mb-2">
                              Basic Hotel Information
                            </h3>
                            <div>
                              <label className="block font-semibold mb-1">Name *</label>
                              <input
                                  type="text"
                                  name="hotel_name"
                                  value={formData.hotel_name}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Hotel Class *
                              </label>
                              <select
                                  name="hotel_hotelclass"
                                  value={formData.hotel_hotelclass}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
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
                              <label className="block font-semibold mb-1">
                                Address *
                              </label>
                              <input
                                  type="text"
                                  name="hotel_address"
                                  value={formData.hotel_address}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Description (Optional)
                              </label>
                              <textarea
                                  name="hotel_description"
                                  value={formData.hotel_description}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  rows="3"
                              />
                            </div>
                            <h3 className="text-2xl font-semibold text-green-700 mb-2">
                              Location Details
                            </h3>
                            <div>
                              <label className="block font-semibold mb-1">
                                Latitude *
                              </label>
                              <input
                                  type="text"
                                  name="hotel_latitude"
                                  placeholder="e.g., 6.9271"
                                  value={formData.hotel_latitude}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Longitude *
                              </label>
                              <input
                                  type="text"
                                  name="hotel_longitude"
                                  placeholder="e.g., 79.8612"
                                  value={formData.hotel_longitude}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">City *</label>
                              <select
                                  name="hotel_city"
                                  value={formData.hotel_city}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              >
                                <option value="">-- Select City --</option>
                                <option value="Colombo">Colombo</option>
                                <option value="Kandy">Kandy</option>
                                <option value="Nuwara Eliya">Nuwara Eliya</option>
                                <option value="Ella">Ella</option>
                              </select>
                            </div>
                            <h3 className="text-2xl font-semibold text-green-700 mb-2">
                              Contact Information
                            </h3>
                            <div>
                              <label className="block font-semibold mb-1">Email *</label>
                              <input
                                  type="email"
                                  name="hotel_email"
                                  value={formData.hotel_email}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Phone *</label>
                              <input
                                  type="tel"
                                  name="hotel_phone"
                                  placeholder="+94 712345678"
                                  value={formData.hotel_phone}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Website (Official) *
                              </label>
                              <input
                                  type="url"
                                  name="hotel_website"
                                  value={formData.hotel_website}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                External Link (Optional)
                              </label>
                              <input
                                  type="url"
                                  name="hotel_weburl"
                                  placeholder="TripAdvisor, etc."
                                  value={formData.hotel_weburl}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                              />
                            </div>
                            <h3 className="text-2xl font-semibold text-green-700 mb-2">
                              Hotel Features & Services
                            </h3>
                            <div>
                              <label className="block font-semibold mb-1">
                                Amenities & Services *
                              </label>
                              <input
                                  type="text"
                                  name="hotel_all_amenities"
                                  placeholder="e.g., Free Wi-Fi, Restaurant, Room Service..."
                                  value={formData.hotel_all_amenities}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <h3 className="text-2xl font-semibold text-green-700 mb-2">
                              Pricing Information
                            </h3>
                            <div>
                              <label className="block font-semibold mb-1">
                                Price Level *
                              </label>
                              <select
                                  name="hotel_pricelevel"
                                  value={formData.hotel_pricelevel}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
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
                              <label className="block font-semibold mb-1">
                                Price Range *
                              </label>
                              <input
                                  type="text"
                                  name="hotel_pricerange"
                                  placeholder="e.g., LKR 5,000 – LKR 15,000"
                                  value={formData.hotel_pricerange}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Ranking Position (Not Required)
                              </label>
                              <input
                                  type="text"
                                  name="hotel_rankingposition"
                                  value={formData.hotel_rankingposition}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Ranking Denominator (Not Required)
                              </label>
                              <input
                                  type="text"
                                  name="hotel_rankingdenom"
                                  value={formData.hotel_rankingdenom}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Ranking String (Not Required)
                              </label>
                              <input
                                  type="text"
                                  name="hotel_rankingstring"
                                  value={formData.hotel_rankingstring}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                              />
                            </div>
                          </div>
                      )}
                      {formData.category === "Restaurant" && (
                          <div className="border-t border-gray-300 pt-6 space-y-6">
                            <h3 className="text-2xl font-semibold text-green-700 mb-2">
                              Basic Restaurant Information
                            </h3>
                            <div>
                              <label className="block font-semibold mb-1">Name *</label>
                              <input
                                  type="text"
                                  name="restaurant_name"
                                  value={formData.restaurant_name}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <h3 className="text-2xl font-semibold text-green-700 mb-2">
                              Location Details
                            </h3>
                            <div>
                              <label className="block font-semibold mb-1">
                                Address *
                              </label>
                              <input
                                  type="text"
                                  name="restaurant_address"
                                  value={formData.restaurant_address}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">City *</label>
                              <select
                                  name="restaurant_addressobj_city"
                                  value={formData.restaurant_addressobj_city}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
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
                              <label className="block font-semibold mb-1">
                                Latitude *
                              </label>
                              <input
                                  type="text"
                                  name="restaurant_latitude"
                                  placeholder="e.g., 6.9271"
                                  value={formData.restaurant_latitude}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Longitude *
                              </label>
                              <input
                                  type="text"
                                  name="restaurant_longitude"
                                  placeholder="e.g., 79.8612"
                                  value={formData.restaurant_longitude}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <h3 className="text-2xl font-semibold text-green-700 mb-2">
                              Contact Information
                            </h3>
                            <div>
                              <label className="block font-semibold mb-1">Email *</label>
                              <input
                                  type="email"
                                  name="restaurant_email"
                                  value={formData.restaurant_email}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Phone *</label>
                              <input
                                  type="tel"
                                  name="restaurant_phone"
                                  placeholder="+94 712345678"
                                  value={formData.restaurant_phone}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                External Link (Website, Social, etc.) *
                              </label>
                              <input
                                  type="url"
                                  name="restaurant_weburl"
                                  value={formData.restaurant_weburl}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              />
                            </div>
                            <h3 className="text-2xl font-semibold text-green-700 mb-2">
                              Food & Menu Details
                            </h3>
                            <div>
                              <label className="block font-semibold mb-1">
                                Cuisines *
                              </label>
                              <Select
                                  isMulti
                                  name="restaurant_cuisines"
                                  options={cuisinesOptions}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  onChange={(selected) =>
                                      handleMultiSelectChange("restaurant_cuisines", selected)
                                  }
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Dietary Restrictions *
                              </label>
                              <Select
                                  isMulti
                                  name="restaurant_dietaryrestrictions"
                                  options={dietaryOptions}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  onChange={(selected) =>
                                      handleMultiSelectChange(
                                          "restaurant_dietaryrestrictions",
                                          selected
                                      )
                                  }
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Features *
                              </label>
                              <Select
                                  isMulti
                                  name="restaurant_features"
                                  options={featuresOptions}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  onChange={(selected) =>
                                      handleMultiSelectChange("restaurant_features", selected)
                                  }
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Meal Types *
                              </label>
                              <Select
                                  isMulti
                                  name="restaurant_mealtypes"
                                  options={mealTypesOptions}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  onChange={(selected) =>
                                      handleMultiSelectChange("restaurant_mealtypes", selected)
                                  }
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Price Level (LKR) *
                              </label>
                              <select
                                  name="restaurant_pricelevel_lkr"
                                  value={formData.restaurant_pricelevel_lkr}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                                  required
                              >
                                <option value="">-- Select Range --</option>
                                <option value="Low">Low (&lt; LKR 500)</option>
                                <option value="Medium">Medium (LKR 500–1500)</option>
                                <option value="High">High (&gt; LKR 1500)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Number of Reviews (Not Required)
                              </label>
                              <input
                                  type="text"
                                  name="restaurant_numberofreviews"
                                  value={formData.restaurant_numberofreviews}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Ranking Position (Not Required)
                              </label>
                              <input
                                  type="text"
                                  name="restaurant_rankingposition"
                                  value={formData.restaurant_rankingposition}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">
                                Ranking Denominator (Not Required)
                              </label>
                              <input
                                  type="text"
                                  name="restaurant_rankingdenom"
                                  value={formData.restaurant_rankingdenom}
                                  onChange={handleChange}
                                  className="w-full p-3 border rounded-md"
                              />
                            </div>
                          </div>
                      )}
                    </>
                )}
                <button
                    type="submit"
                    className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Register
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-blue-600 hover:underline">
                  Already have an account? Login
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
  );
};

export default Register;
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth.context.jsx";
import { FaPencilAlt } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../index.css"; // Import the external CSS file

const Profile = () => {
  const { auth, fetchProfile } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const profileRes = await fetchProfile();
        if (profileRes && profileRes.user) {
          setUserData(profileRes.user);
          setVendorData(profileRes.vendor || {});
          setError("");
        } else {
          setError("Failed to fetch profile data.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("An error occurred while fetching profile data.");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(getData, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchProfile]);

  const toggleEdit = () => {
    setEditing((prev) => !prev);
    setMessage("");
    setError("");
  };

  const handleChangeUser = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeVendor = (e) => {
    const { name, value } = e.target;
    setVendorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
          `http://localhost:5001/api/profile/${auth.user.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify({ user: userData, vendor: vendorData }),
          }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage("Profile updated successfully.");
        setEditing(false);
        setUserData(data.user);
        if (data.vendor) setVendorData(data.vendor);
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      setError("Server error while updating profile.");
    }
  };

  if (!auth.token) {
    return (
        <div id="profile-container">
          <p>Please log in to view your profile.</p>
        </div>
    );
  }

  if (loading) {
    return (
        <div id="profile-container">
          <p>Loading profile...</p>
        </div>
    );
  }

  if (!userData) {
    return (
        <div id="profile-container">
          <p>{error || "No profile data available."}</p>
        </div>
    );
  }

  const isVendor = userData.role === "vendor";

  return (
      <>
        <Header />
        <div id="profile-container">
          <div id="profile-card">
            <div id="profile-header">
              <h2 id="profile-title">Profile</h2>
              <button id="profile-edit-button" type="button" onClick={toggleEdit}>
                <FaPencilAlt id="profile-edit-icon" />
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>
            {message && <p id="profile-message">{message}</p>}
            {error && <p id="profile-error">{error}</p>}
            <form id="profile-form" onSubmit={handleSubmit}>
              <div id="user-information">
                <h3>User Information</h3>
                <div>
                  <label htmlFor="profile-username">Username:</label>
                  {editing ? (
                      <input
                          id="profile-username"
                          type="text"
                          name="username"
                          value={userData.username || ""}
                          onChange={handleChangeUser}
                      />
                  ) : (
                      <p>{userData.username}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="profile-email">Email:</label>
                  {editing ? (
                      <input
                          id="profile-email"
                          type="email"
                          name="email"
                          value={userData.email || ""}
                          onChange={handleChangeUser}
                      />
                  ) : (
                      <p>{userData.email || "Not provided"}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="profile-firstName">First Name:</label>
                  {editing ? (
                      <input
                          id="profile-firstName"
                          type="text"
                          name="firstName"
                          value={userData.firstName || ""}
                          onChange={handleChangeUser}
                      />
                  ) : (
                      <p>{userData.firstName || "Not provided"}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="profile-lastName">Last Name:</label>
                  {editing ? (
                      <input
                          id="profile-lastName"
                          type="text"
                          name="lastName"
                          value={userData.lastName || ""}
                          onChange={handleChangeUser}
                      />
                  ) : (
                      <p>{userData.lastName || "Not provided"}</p>
                  )}
                </div>
              </div>
              {isVendor && (
                  <div id="vendor-information">
                    <h3>Vendor Information</h3>
                    <div>
                      <label htmlFor="vendor-propertyName">Property Name:</label>
                      {editing ? (
                          <input
                              id="vendor-propertyName"
                              type="text"
                              name="propertyName"
                              value={vendorData.propertyName || ""}
                              onChange={handleChangeVendor}
                          />
                      ) : (
                          <p>{vendorData.propertyName || "Not provided"}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="vendor-propertyType">Property Type:</label>
                      {editing ? (
                          <input
                              id="vendor-propertyType"
                              type="text"
                              name="propertyType"
                              value={vendorData.propertyType || ""}
                              onChange={handleChangeVendor}
                          />
                      ) : (
                          <p>{vendorData.propertyType || "Not provided"}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="vendor-propertyCity">Property City:</label>
                      {editing ? (
                          <input
                              id="vendor-propertyCity"
                              type="text"
                              name="propertyCity"
                              value={vendorData.propertyCity || ""}
                              onChange={handleChangeVendor}
                          />
                      ) : (
                          <p>{vendorData.propertyCity || "Not provided"}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="vendor-propertyAddress">Property Address:</label>
                      {editing ? (
                          <input
                              id="vendor-propertyAddress"
                              type="text"
                              name="propertyAddress"
                              value={vendorData.propertyAddress || ""}
                              onChange={handleChangeVendor}
                          />
                      ) : (
                          <p>{vendorData.propertyAddress || "Not provided"}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="vendor-phoneNumber">Phone Number:</label>
                      {editing ? (
                          <input
                              id="vendor-phoneNumber"
                              type="text"
                              name="phoneNumber"
                              value={vendorData.phoneNumber || ""}
                              onChange={handleChangeVendor}
                          />
                      ) : (
                          <p>{vendorData.phoneNumber || "Not provided"}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="vendor-propertyDescription">Property Description:</label>
                      {editing ? (
                          <textarea
                              id="vendor-propertyDescription"
                              name="propertyDescription"
                              value={vendorData.propertyDescription || ""}
                              onChange={handleChangeVendor}
                              rows="3"
                          />
                      ) : (
                          <p>{vendorData.propertyDescription || "Not provided"}</p>
                      )}
                    </div>
                  </div>
              )}
              {editing && (
                  <button id="profile-update-button" type="submit">
                    Update Profile
                  </button>
              )}
            </form>
          </div>
        </div>
        <Footer />
      </>
  );
};

export default Profile;
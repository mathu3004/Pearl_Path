// frontend/src/pages/Profile.jsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaPencilAlt } from "react-icons/fa";

const Profile = () => {
  const { auth, fetchProfile } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch profile data on mount
  useEffect(() => {
    const getData = async () => {
      try {
        const profileRes = await fetchProfile();
        if (profileRes && profileRes.user) {
          setUserData(profileRes.user);
          setVendorData(profileRes.vendor || {});
          setError("");
        } else {
          // Only set error if no data is returned after a delay.
          setError("Failed to fetch profile data.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("An error occurred while fetching profile data.");
      } finally {
        setLoading(false);
      }
    };

    // Delay execution slightly to allow transient delays to resolve.
    const timeoutId = setTimeout(getData, 500);

    // Clean up the timeout if the component unmounts
    return () => clearTimeout(timeoutId);
  }, [fetchProfile]);

  // Toggle edit mode
  const toggleEdit = () => {
    setEditing((prev) => !prev);
    setMessage("");
    setError("");
  };

  // Handle input changes for User fields
  const handleChangeUser = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle input changes for Vendor fields
  const handleChangeVendor = (e) => {
    const { name, value } = e.target;
    setVendorData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updated profile data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5001/api/profile/${auth.user._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            user: userData,
            vendor: vendorData,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage("Profile updated successfully.");
        setEditing(false);
        setUserData(data.user);
        if (data.vendor) {
          setVendorData(data.vendor);
        }
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
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!userData) {
    // Display error if no userData is available after loading
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{error || "No profile data available."}</p>
      </div>
    );
  }

  const isVendor = userData.role === "vendor";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-24 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Profile</h2>
          <button
            type="button"
            onClick={toggleEdit}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaPencilAlt className="mr-2" />
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {message && (
          <p className="text-green-600 text-center mb-4">{message}</p>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information Section */}
          <div>
            <h3 className="text-xl font-semibold mb-2">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block font-semibold mb-1">Username:</label>
                {editing ? (
                  <input
                    type="text"
                    name="username"
                    value={userData.username || ""}
                    onChange={handleChangeUser}
                    className="w-full p-2 border rounded"
                  />
                ) : (
                  <p>{userData.username}</p>
                )}
              </div>
              {/* Email */}
              <div>
                <label className="block font-semibold mb-1">Email:</label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={userData.email || ""}
                    onChange={handleChangeUser}
                    className="w-full p-2 border rounded"
                  />
                ) : (
                  <p>{userData.email || "Not provided"}</p>
                )}
              </div>
              {/* First Name */}
              <div>
                <label className="block font-semibold mb-1">First Name:</label>
                {editing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={userData.firstName || ""}
                    onChange={handleChangeUser}
                    className="w-full p-2 border rounded"
                  />
                ) : (
                  <p>{userData.firstName || "Not provided"}</p>
                )}
              </div>
              {/* Last Name */}
              <div>
                <label className="block font-semibold mb-1">Last Name:</label>
                {editing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={userData.lastName || ""}
                    onChange={handleChangeUser}
                    className="w-full p-2 border rounded"
                  />
                ) : (
                  <p>{userData.lastName || "Not provided"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Vendor Information Section */}
          {isVendor && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Vendor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Property Name */}
                <div>
                  <label className="block font-semibold mb-1">
                    Property Name:
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="propertyName"
                      value={vendorData.propertyName || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.propertyName || "Not provided"}</p>
                  )}
                </div>
                {/* Property Type */}
                <div>
                  <label className="block font-semibold mb-1">
                    Property Type:
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="propertyType"
                      value={vendorData.propertyType || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.propertyType || "Not provided"}</p>
                  )}
                </div>
                {/* Property City */}
                <div>
                  <label className="block font-semibold mb-1">
                    Property City:
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="propertyCity"
                      value={vendorData.propertyCity || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.propertyCity || "Not provided"}</p>
                  )}
                </div>
                {/* Property Address */}
                <div>
                  <label className="block font-semibold mb-1">
                    Property Address:
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="propertyAddress"
                      value={vendorData.propertyAddress || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.propertyAddress || "Not provided"}</p>
                  )}
                </div>
                {/* Phone Number */}
                <div>
                  <label className="block font-semibold mb-1">
                    Phone Number:
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="phoneNumber"
                      value={vendorData.phoneNumber || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.phoneNumber || "Not provided"}</p>
                  )}
                </div>
                {/* Property Description */}
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1">
                    Property Description:
                  </label>
                  {editing ? (
                    <textarea
                      name="propertyDescription"
                      value={vendorData.propertyDescription || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                      rows="3"
                    />
                  ) : (
                    <p>{vendorData.propertyDescription || "Not provided"}</p>
                  )}
                </div>
                {/* Number of Rooms */}
                <div>
                  <label className="block font-semibold mb-1">
                    Number of Rooms:
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      name="numberOfRooms"
                      value={vendorData.numberOfRooms || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.numberOfRooms || "Not provided"}</p>
                  )}
                </div>
                {/* Host Full Name */}
                <div>
                  <label className="block font-semibold mb-1">
                    Host Full Name:
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="hostFullName"
                      value={vendorData.hostFullName || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.hostFullName || "Not provided"}</p>
                  )}
                </div>
                {/* Business Name */}
                <div>
                  <label className="block font-semibold mb-1">
                    Business Name:
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="businessName"
                      value={vendorData.businessName || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.businessName || "Not provided"}</p>
                  )}
                </div>
                {/* Host Phone Number */}
                <div>
                  <label className="block font-semibold mb-1">
                    Host Phone Number:
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="hostPhoneNumber"
                      value={vendorData.hostPhoneNumber || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.hostPhoneNumber || "Not provided"}</p>
                  )}
                </div>
                {/* Types of Rooms */}
                <div>
                  <label className="block font-semibold mb-1">
                    Types of Rooms:
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="typesOfRooms"
                      value={vendorData.typesOfRooms || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.typesOfRooms || "Not provided"}</p>
                  )}
                </div>
                {/* Maximum Occupancy */}
                <div>
                  <label className="block font-semibold mb-1">
                    Maximum Occupancy:
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      name="maxOccupancy"
                      value={vendorData.maxOccupancy || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.maxOccupancy || "Not provided"}</p>
                  )}
                </div>
                {/* Base Price */}
                <div>
                  <label className="block font-semibold mb-1">
                    Base Price:
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      name="basePrice"
                      value={vendorData.basePrice || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.basePrice || "Not provided"}</p>
                  )}
                </div>
                {/* Additional Fees */}
                <div>
                  <label className="block font-semibold mb-1">
                    Additional Fees:
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="additionalFees"
                      value={vendorData.additionalFees || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.additionalFees || "Not provided"}</p>
                  )}
                </div>
                {/* Check-In Time */}
                <div>
                  <label className="block font-semibold mb-1">
                    Check-In Time:
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="checkInTime"
                      value={vendorData.checkInTime || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., 2:00 PM"
                    />
                  ) : (
                    <p>{vendorData.checkInTime || "Not provided"}</p>
                  )}
                </div>
                {/* Check-Out Time */}
                <div>
                  <label className="block font-semibold mb-1">
                    Check-Out Time:
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="checkOutTime"
                      value={vendorData.checkOutTime || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., 11:00 AM"
                    />
                  ) : (
                    <p>{vendorData.checkOutTime || "Not provided"}</p>
                  )}
                </div>
                {/* Minimum Stay */}
                <div>
                  <label className="block font-semibold mb-1">
                    Minimum Stay (days):
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      name="minStay"
                      value={vendorData.minStay || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.minStay || "Not provided"}</p>
                  )}
                </div>
                {/* Maximum Stay */}
                <div>
                  <label className="block font-semibold mb-1">
                    Maximum Stay (days):
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      name="maxStay"
                      value={vendorData.maxStay || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{vendorData.maxStay || "Not provided"}</p>
                  )}
                </div>
                {/* House Rules */}
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1">
                    House Rules:
                  </label>
                  {editing ? (
                    <textarea
                      name="houseRules"
                      value={vendorData.houseRules || ""}
                      onChange={handleChangeVendor}
                      className="w-full p-2 border rounded"
                      rows="3"
                    />
                  ) : (
                    <p>{vendorData.houseRules || "Not provided"}</p>
                  )}
                </div>
                {/* Accepted Terms */}
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1">
                    Accepted Terms:
                  </label>
                  {editing ? (
                    <select
                      name="acceptedTerms"
                      value={vendorData.acceptedTerms ? "true" : "false"}
                      onChange={(e) =>
                        handleChangeVendor({
                          target: {
                            name: "acceptedTerms",
                            value: e.target.value === "true",
                          },
                        })
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <p>{vendorData.acceptedTerms ? "Yes" : "No"}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Update button appears only when editing */}
          {editing && (
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
            >
              Update Profile
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;

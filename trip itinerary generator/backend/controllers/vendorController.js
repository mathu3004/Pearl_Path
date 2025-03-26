exports.getVendorDashboard = (req, res) => {
  res.json({ message: "Welcome to Vendor Dashboard!" });
};

// controllers/vendorController.js
const User = require("../models/User");
const Vendor = require("../models/Vendor");

/**
 * GET /profile (Vendor)
 * Retrieve the currently logged-in *vendor* data from the database.
 */
exports.getVendorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Find user by ID, excluding password
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2. Ensure user is vendor
    if (user.role !== "vendor") {
      return res
          .status(403)
          .json({ message: "Access denied: This endpoint is for vendors only." });
    }

    // 3. Fetch vendor data from Vendor collection
    const vendorData = await Vendor.findOne({ user: user._id });
    if (!vendorData) {
      return res
          .status(404)
          .json({ message: "Vendor data not found for this user." });
    }

    // Return user data + vendor data
    return res.status(200).json({
      user,
      vendor: vendorData,
    });
  } catch (err) {
    console.error("getVendorProfile error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

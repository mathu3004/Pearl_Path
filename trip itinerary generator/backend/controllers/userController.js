exports.getUserDashboard = (req, res) => {
  res.json({ message: "Welcome to User Dashboard!" });
};

// controllers/userController.js
const User = require("../models/User");

/**
 * GET /profile (User)
 * Retrieve the currently logged-in *user* (non-vendor) data from the database.
 */
exports.getUserProfile = async (req, res) => {
  try {
    // req.user is set by authenticateToken middleware
    const userId = req.user.id;

    // 1. Find user by ID, excluding password
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2. Ensure user is not vendor
    if (user.role !== "user") {
      return res
          .status(403)
          .json({ message: "Access denied: This endpoint is for standard users." });
    }

    // Return user data
    return res.status(200).json({ user });
  } catch (err) {
    console.error("getUserProfile error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

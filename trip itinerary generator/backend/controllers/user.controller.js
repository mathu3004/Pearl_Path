const User = require("../models/user.model");

exports.getUserDashboard = (req, res) => {
  res.json({ message: "Welcome to User Dashboard!" });
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role !== "user")
      return res
        .status(403)
        .json({
          message: "Access denied: This endpoint is for standard users.",
        });
    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

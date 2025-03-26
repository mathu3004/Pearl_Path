// backend/routes/profile.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");
const Vendor = require("../models/Vendor");

// Middleware to verify JWT and attach user info to req.user
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded._id, role: decoded.role };
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

// GET profile endpoint
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user._id !== id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to view this profile." });
    }
    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    let vendor = null;
    if (user.role === "vendor") {
      vendor = await Vendor.findOne({ user: user._id }).lean();
    }
    res.status(200).json({ user, vendor });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res
      .status(500)
      .json({ message: "Internal server error while fetching profile." });
  }
});

// PATCH update profile endpoint
const { updateProfile } = require("../controllers/profileController");
router.patch("/:id", verifyToken, updateProfile);

module.exports = router;

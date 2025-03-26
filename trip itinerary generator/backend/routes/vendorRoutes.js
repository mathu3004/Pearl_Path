// routes/vendorRoutes.js
const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

// GET /vendor/dashboard
router.get(
    "/dashboard",
    authenticateToken,
    authorizeRole("vendor"),
    vendorController.getVendorDashboard
);

// GET /vendor/profile
router.get(
    "/profile",
    authenticateToken,
    authorizeRole("vendor"),
    vendorController.getVendorProfile
);

module.exports = router;

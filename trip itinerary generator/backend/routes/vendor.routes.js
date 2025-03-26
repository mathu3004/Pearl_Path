const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendor.controller");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/auth.middleware");

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRole("vendor"),
  vendorController.getVendorDashboard
);
router.get(
  "/profile",
  authenticateToken,
  authorizeRole("vendor"),
  vendorController.getVendorProfile
);

module.exports = router;

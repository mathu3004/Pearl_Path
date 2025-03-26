// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRole("user"),
  userController.getUserDashboard
);

module.exports = router;

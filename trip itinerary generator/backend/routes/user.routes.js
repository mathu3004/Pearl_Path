const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/auth.middleware");

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRole("user"),
  userController.getUserDashboard
);

module.exports = router;

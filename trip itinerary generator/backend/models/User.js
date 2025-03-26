// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  // New optional fields:
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  // Add any other optional fields here.
});

module.exports = mongoose.model("User", userSchema);

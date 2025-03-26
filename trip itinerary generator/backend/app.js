const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const vendorRoutes = require("./routes/vendor.routes");
const profileRoutes = require("./routes/profile.routes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/profile", profileRoutes);

module.exports = app;

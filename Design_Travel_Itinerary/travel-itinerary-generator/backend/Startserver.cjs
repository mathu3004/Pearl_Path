/************************************************************
 * 1) LOAD ENVIRONMENT VARIABLES & IMPORT EXTERNAL DEPENDENCIES
 ************************************************************/
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/************************************************************
 * 2) DATABASE CONNECTION (from config/db.js)
 ************************************************************/
async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

/************************************************************
 * 3) DEFINE MODELS (from user.model.js & vendor.model.js)
 ************************************************************/
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
});
const User = mongoose.model("User", userSchema);

const vendorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, enum: ["Hotel", "Restaurant"], required: true },

  // Generic property fields
  propertyName: { type: String },
  propertyType: { type: String },
  propertyCity: { type: String },
  propertyAddress: { type: String },
  phoneNumber: { type: String },
  propertyDescription: { type: String },

  // Hotel-specific fields
  hotelName: { type: String },
  hotelClass: {
    type: String,
    enum: ["1 Star", "2 Star", "3 Star", "4 Star", "5 Star"],
  },
  hotelAddress: { type: String },
  hotelDescription: { type: String },
  hotelLatitude: { type: String },
  hotelLongitude: { type: String },
  hotelCity: {
    type: String,
    enum: ["Colombo", "Kandy", "Nuwara Eliya", "Ella"],
  },
  hotelEmail: { type: String },
  hotelPhone: { type: String },
  hotelWebsite: { type: String },
  hotelWeburl: { type: String },
  hotelAmenities: { type: String },
  hotelPriceLevel: { type: String, enum: ["$", "$$", "$$$", "$$$$"] },
  hotelPriceRange: { type: String },
  hotelRankingPosition: { type: String },
  hotelRankingDenom: { type: String },
  hotelRankingString: { type: String },

  // Restaurant-specific fields
  restaurantName: { type: String },
  restaurantAddress: { type: String },
  restaurantCity: {
    type: String,
    enum: ["Colombo", "Kandy", "Ella", "Nuwara Eliya"],
  },
  restaurantLatitude: { type: String },
  restaurantLongitude: { type: String },
  restaurantEmail: { type: String },
  restaurantPhone: { type: String },
  restaurantWeburl: { type: String },
  restaurantCuisines: { type: [String] },
  restaurantDietaryRestrictions: { type: [String] },
  restaurantFeatures: { type: [String] },
  restaurantMealTypes: { type: [String] },
  restaurantPriceLevelLKR: { type: String },
  restaurantNumberOfReviews: { type: String },
  restaurantRankingPosition: { type: String },
  restaurantRankingDenom: { type: String },
});
const Vendor = mongoose.model("Vendor", vendorSchema);

/************************************************************
 * 4) DEFINE CONTROLLERS (from controllers/*.js)
 ************************************************************/
/** auth.controller.js **/
const authController = {
  registerUser: async (req, res) => {
    try {
      const { username, password, confirmPassword, role, category } = req.body;
      if (!username || !password || !confirmPassword) {
        return res
            .status(400)
            .json({ message: "Username and passwords are required." });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match." });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists." });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        password: hashedPassword,
        role: role === "vendor" ? "vendor" : "user",
      });
      await user.save();

      // If vendor, create vendor document
      if (role === "vendor") {
        const vendorData = { user: user._id, category };
        if (category === "Hotel" && req.body.hotelData) {
          const {
            name,
            hotelClass,
            address,
            description,
            latitude,
            longitude,
            city,
            email,
            phone,
            website,
            weburl,
            amenities,
            priceLevel,
            priceRange,
            rankingPosition,
            rankingDenom,
            rankingString,
          } = req.body.hotelData;
          vendorData.hotelName = name;
          vendorData.hotelClass = hotelClass;
          vendorData.hotelAddress = address;
          vendorData.hotelDescription = description;
          vendorData.hotelLatitude = latitude;
          vendorData.hotelLongitude = longitude;
          vendorData.hotelCity = city;
          vendorData.hotelEmail = email;
          vendorData.hotelPhone = phone;
          vendorData.hotelWebsite = website;
          vendorData.hotelWeburl = weburl;
          vendorData.hotelAmenities = amenities;
          vendorData.hotelPriceLevel = priceLevel;
          vendorData.hotelPriceRange = priceRange;
          vendorData.hotelRankingPosition = rankingPosition;
          vendorData.hotelRankingDenom = rankingDenom;
          vendorData.hotelRankingString = rankingString;
        } else if (category === "Restaurant" && req.body.restaurantData) {
          const {
            name,
            address,
            city,
            latitude,
            longitude,
            email,
            phone,
            weburl,
            cuisines,
            dietaryRestrictions,
            features,
            mealTypes,
            priceLevelLKR,
            numberOfReviews,
            rankingPosition,
            rankingDenom,
          } = req.body.restaurantData;
          vendorData.restaurantName = name;
          vendorData.restaurantAddress = address;
          vendorData.restaurantCity = city;
          vendorData.restaurantLatitude = latitude;
          vendorData.restaurantLongitude = longitude;
          vendorData.restaurantEmail = email;
          vendorData.restaurantPhone = phone;
          vendorData.restaurantWeburl = weburl;
          vendorData.restaurantCuisines = cuisines;
          vendorData.restaurantDietaryRestrictions = dietaryRestrictions;
          vendorData.restaurantFeatures = features;
          vendorData.restaurantMealTypes = mealTypes;
          vendorData.restaurantPriceLevelLKR = priceLevelLKR;
          vendorData.restaurantNumberOfReviews = numberOfReviews;
          vendorData.restaurantRankingPosition = rankingPosition;
          vendorData.restaurantRankingDenom = rankingDenom;
        }
        const vendor = new Vendor(vendorData);
        await vendor.save();
      }

      res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Username and password are required." });
      }
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials." });
      }
      const payload = { id: user._id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).json({ accessToken: token, role: user.role });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  resetUserPassword: async (req, res) => {
    try {
      const { username, newPassword } = req.body;
      if (!username || !newPassword) {
        return res
            .status(400)
            .json({ message: "Username and new password are required." });
      }
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: "User not found." });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  getUserProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id).lean();
      if (!user) return res.status(404).json({ message: "User not found." });
      let vendor = null;
      if (user.role === "vendor") {
        vendor = await Vendor.findOne({ user: user._id }).lean();
      }
      res.status(200).json({ user, vendor });
    } catch (error) {
      console.error("Fetch profile error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
};

/** profile.controller.js **/
const profileController = {
  fetchProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id).lean();
      if (!user) return res.status(404).json({ message: "User not found." });
      let vendor = null;
      if (user.role === "vendor") {
        vendor = await Vendor.findOne({ user: user._id }).lean();
      }
      res.status(200).json({ user, vendor });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const { user: userUpdates, vendor: vendorUpdates } = req.body;

      // Check ownership or admin role
      if (req.user.id !== id && req.user.role !== "admin") {
        return res
            .status(403)
            .json({ message: "Not authorized to update this profile." });
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(id, userUpdates, {
        new: true,
        runValidators: true,
      });
      if (!updatedUser)
        return res.status(404).json({ message: "User not found." });

      // Update vendor if the user is a vendor
      let updatedVendor = null;
      if (updatedUser.role === "vendor") {
        if (vendorUpdates && typeof vendorUpdates === "object") {
          updatedVendor = await Vendor.findOneAndUpdate(
              { user: id },
              vendorUpdates,
              { new: true, runValidators: true }
          );
          if (!updatedVendor) {
            updatedVendor = await Vendor.create({ user: id, ...vendorUpdates });
          }
        } else {
          return res
              .status(400)
              .json({ message: "Vendor update data is missing or invalid." });
        }
      }

      res.status(200).json({
        message: "Profile updated successfully.",
        user: updatedUser,
        vendor: updatedVendor,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      if (error.name === "ValidationError")
        return res
            .status(400)
            .json({ message: "Validation error", details: error.message });
      res
          .status(500)
          .json({ message: "Internal server error during profile update." });
    }
  },
};

/** user.controller.js **/
const userController = {
  getUserDashboard: (req, res) => {
    res.json({ message: "Welcome to User Dashboard!" });
  },

  getUserProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password");
      if (!user) return res.status(404).json({ message: "User not found." });
      if (user.role !== "user")
        return res
            .status(403)
            .json({ message: "Access denied: This endpoint is for standard users." });
      res.status(200).json({ user });
    } catch (error) {
      console.error("Get user profile error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
};

/** vendor.controller.js **/
const vendorController = {
  getVendorDashboard: (req, res) => {
    res.json({ message: "Welcome to Vendor Dashboard!" });
  },

  getVendorProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password");
      if (!user) return res.status(404).json({ message: "User not found." });
      if (user.role !== "vendor")
        return res
            .status(403)
            .json({ message: "Access denied: This endpoint is for vendors only." });
      const vendorData = await Vendor.findOne({ user: user._id });
      if (!vendorData)
        return res
            .status(404)
            .json({ message: "Vendor data not found for this user." });
      res.status(200).json({ user, vendor: vendorData });
    } catch (error) {
      console.error("Get vendor profile error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
};

/************************************************************
 * 5) DEFINE MIDDLEWARE (from auth.middleware.js)
 ************************************************************/
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function authorizeRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res
          .status(403)
          .json({ message: "Access denied: insufficient permissions." });
    }
    next();
  };
}

/************************************************************
 * 6) DEFINE ROUTES (merging code from auth.routes.js, profile.routes.js, user.routes.js, vendor.routes.js)
 ************************************************************/
const authRoutes = express.Router();
// /api/auth
authRoutes.post("/register", authController.registerUser);
authRoutes.post("/login", authController.loginUser);
authRoutes.post("/reset-password", authController.resetUserPassword);
// Notice the original route was POST /fetch-profile, but it uses a param-based approach in the controller:
authRoutes.post("/fetch-profile/:id?", authController.getUserProfile);
// Adjust as needed (the original had no param, but the controller expects `req.params.id`).

const profileRoutes = express.Router();
// Custom verifyToken specifically for profile.routes
function profileVerifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided." });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(403).json({ message: "Invalid or expired token." });
  }
}
// GET /api/profile/:id
profileRoutes.get("/:id", profileVerifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id && req.user.role !== "admin") {
      return res
          .status(403)
          .json({ message: "Not authorized to view this profile." });
    }
    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ message: "User not found." });
    let vendor = null;
    if (user.role === "vendor") {
      vendor = await Vendor.findOne({ user: user._id }).lean();
    }
    res.status(200).json({ user, vendor });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res
        .status(500)
        .json({ message: "Internal server error while fetching profile." });
  }
});
// PATCH /api/profile/:id
profileRoutes.patch("/:id", profileVerifyToken, profileController.updateProfile);

const userRoutes = express.Router();
// /api/user
userRoutes.get(
    "/dashboard",
    authenticateToken,
    authorizeRole("user"),
    userController.getUserDashboard
);

const vendorRoutes = express.Router();
// /api/vendor
vendorRoutes.get(
    "/dashboard",
    authenticateToken,
    authorizeRole("vendor"),
    vendorController.getVendorDashboard
);
vendorRoutes.get(
    "/profile",
    authenticateToken,
    authorizeRole("vendor"),
    vendorController.getVendorProfile
);

/************************************************************
 * 7) CREATE AND CONFIGURE EXPRESS APP (from app.js)
 ************************************************************/
const app = express();
app.use(express.json());
app.use(cors());

// Register route paths
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/profile", profileRoutes);

/************************************************************
 * 8) CONNECT TO DATABASE AND START THE SERVER (from server.js)
 ************************************************************/
const PORT = process.env.PORT_START || 5002;
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

/************************************************************
 * 9) (OPTIONAL) EXPORT APP IF NEEDED FOR TESTING
 ************************************************************/
module.exports = app;

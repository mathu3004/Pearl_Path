require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Vendor = require("../models/vendor.model");

exports.registerUser = async (req, res) => {
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
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      role: role === "vendor" ? "vendor" : "user",
    });
    await user.save();

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
};

exports.loginUser = async (req, res) => {
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
};

exports.resetUserPassword = async (req, res) => {
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
};

exports.getUserProfile = async (req, res) => {
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
};

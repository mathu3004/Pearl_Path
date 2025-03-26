// routes/auth.js (or another appropriate file name)
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Vendor = require("../models/Vendor");

exports.register = async (req, res) => {
  try {
    const {
      username,
      password,
      confirmPassword,
      role,
      propertyName,
      propertyType,
      propertyCity,
      propertyAddress,
      phoneNumber,
      propertyDescription,
      numberOfRooms,
      hostFullName,
      businessName,
      hostPhoneNumber,
      typesOfRooms,
      maxOccupancy,
      basePrice,
      additionalFees,
      checkInTime,
      checkOutTime,
      minStay,
      maxStay,
      houseRules,
      acceptedTerms,
    } = req.body;

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

    const newUser = new User({
      username,
      password: hashedPassword,
      role: role === "vendor" ? "vendor" : "user",
    });
    await newUser.save();

    if (role === "vendor") {
      const newVendor = new Vendor({
        user: newUser._id,
        propertyName,
        propertyType,
        propertyCity,
        propertyAddress,
        phoneNumber,
        propertyDescription,
        numberOfRooms,
        hostFullName,
        businessName,
        hostPhoneNumber,
        typesOfRooms,
        maxOccupancy,
        basePrice,
        additionalFees,
        checkInTime,
        checkOutTime,
        minStay,
        maxStay,
        houseRules,
        acceptedTerms: acceptedTerms || false,
      });
      await newVendor.save();
    }

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.login = async (req, res) => {
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

    const payload = { _id: user._id, role: user.role };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ accessToken: token, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.resetPassword = async (req, res) => {
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
  } catch (err) {
    console.error("Reset Password error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.fetchProfile = async (req, res) => {
  try {
    const { id } = req.params; // The user ID should be provided in the URL
    // Find the user by ID
    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If the user is a vendor, also retrieve the vendor document
    let vendor = null;
    if (user.role === "vendor") {
      vendor = await Vendor.findOne({ user: user._id }).lean();
    }

    res.status(200).json({ user, vendor });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

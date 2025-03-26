exports.getVendorDashboard = (req, res) => {
  res.json({ message: "Welcome to Vendor Dashboard!" });
};

const User = require("../models/user.model");
const Vendor = require("../models/vendor.model");

exports.getVendorProfile = async (req, res) => {
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
};

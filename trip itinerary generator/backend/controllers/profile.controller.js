const User = require("../models/user.model");
const Vendor = require("../models/vendor.model");

exports.fetchProfile = async (req, res) => {
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
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { user: userUpdates, vendor: vendorUpdates } = req.body;
    if (req.user.id !== id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile." });
    }
    const updatedUser = await User.findByIdAndUpdate(id, userUpdates, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser)
      return res.status(404).json({ message: "User not found." });
    let updatedVendor = null;
    if (updatedUser.role === "vendor") {
      if (vendorUpdates && typeof vendorUpdates === "object") {
        updatedVendor = await Vendor.findOneAndUpdate(
          { user: id },
          vendorUpdates,
          { new: true, runValidators: true }
        );
        if (!updatedVendor)
          updatedVendor = await Vendor.create({ user: id, ...vendorUpdates });
      } else {
        return res
          .status(400)
          .json({ message: "Vendor update data is missing or invalid." });
      }
    }
    res
      .status(200)
      .json({
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
};

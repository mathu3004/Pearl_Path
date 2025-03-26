// backend/controllers/profileController.js
const User = require("../models/User");
const Vendor = require("../models/Vendor");

/**
 * PATCH /api/profile/:id
 * Updates the user profile. Accepts an object for user updates and,
 * if the user is a vendor, an object for vendor updates.
 *
 * Expected request body:
 * {
 *   user: { username, firstName, lastName, email, ... },
 *   vendor: { propertyName, propertyCity, ... } // Only if applicable.
 * }
 */
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { user: userUpdates, vendor: vendorUpdates } = req.body;

    // Check if the authenticated user is updating their own profile (or is an admin)
    if (req.user._id !== id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile." });
    }

    if (!userUpdates || typeof userUpdates !== "object") {
      return res.status(400).json({ message: "Invalid user update data." });
    }

    // Update user fields. This will add any new fields as long as they're defined in the schema.
    const updatedUser = await User.findByIdAndUpdate(id, userUpdates, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    let updatedVendor = null;
    // If the user is a vendor and vendor update data is provided, update the vendor document.
    if (updatedUser.role === "vendor") {
      if (vendorUpdates && typeof vendorUpdates === "object") {
        updatedVendor = await Vendor.findOneAndUpdate(
          { user: id },
          vendorUpdates,
          {
            new: true,
            runValidators: true,
          }
        );
        if (!updatedVendor) {
          // If vendor data is missing, you might want to create it automatically:
          updatedVendor = await Vendor.create({ user: id, ...vendorUpdates });
        }
      } else {
        return res
          .status(400)
          .json({ message: "Vendor update data is missing or invalid." });
      }
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
      vendor: updatedVendor,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    // Check for validation errors from Mongoose:
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error", details: err.message });
    }
    return res
      .status(500)
      .json({ message: "Internal server error during profile update." });
  }
};

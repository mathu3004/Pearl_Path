const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  propertyName: String,
  propertyType: String,
  propertyCity: String,
  propertyAddress: String,
  phoneNumber: String,
  propertyDescription: String,
  numberOfRooms: Number,
  hostFullName: String,
  businessName: String,
  hostPhoneNumber: String,
  typesOfRooms: String,
  maxOccupancy: Number,
  basePrice: Number,
  additionalFees: String,
  checkInTime: String,
  checkOutTime: String,
  minStay: Number,
  maxStay: Number,
  houseRules: String,
  acceptedTerms: { type: Boolean, default: false },
});

module.exports = mongoose.model("Vendor", vendorSchema);

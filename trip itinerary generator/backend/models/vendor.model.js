// backend/models/vendor.model.js

const mongoose = require("mongoose");

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

module.exports = mongoose.model("Vendor", vendorSchema);

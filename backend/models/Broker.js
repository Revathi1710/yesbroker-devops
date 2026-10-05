const mongoose = require('mongoose');

const brokerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  mobile_number: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    required: true
  },
  service_offered: {
    type: [String],
    required: true   // array of services
  },
  about: {
    type: String
  },
  introduction: {
    type: String
  },
  locality: {
    type: [String]
  },
  area: {
    type: [String]
  },
  success_stories: {
    type: [String]
  },
  testimonials: {
    type: [String]
  },
  property_listings: {
    type: Number   // count of properties
  },
  year_experience: {
    type: Number
  },
  languages_spoken: {
    type: [String]
  },
  // FIXED: Added missing commas and corrected syntax
  active: {
    type: Boolean,
    default: false
  },
  // FIXED: Removed extra colon and added missing comma
  feature: {
    type: Boolean,
    default: false
  },
  emailVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Broker', brokerSchema);
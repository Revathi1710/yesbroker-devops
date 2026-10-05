const mongoose = require('mongoose');

// limit photos to 5
function arrayLimit(val) {
  return val.length <= 5;
}

const SuccessSchema = new mongoose.Schema(
{
  // 🔗 Broker Reference
  broker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Broker',
    required: true
  },

  // 🏆 Basic Info
  title: {
    type: String,
    required: true,
    trim: true
  },

  shortSummary: {
    type: String,
    trim: true,
    maxlength: 150
  },

  description: {
    type: String,
    required: true
  },

  // 📊 Performance Metrics
  totalPropertiesSold: {
    type: Number,
    default: 0
  },

  totalRevenue: {
    type: Number,
    default: 0
  },

  dealValue: {
    type: Number
  },

  timeTaken: {
    type: String // example: "15 days", "1 month"
  },

  // 📍 Property Info
  location: {
    type: String
  },

  propertyType: {
    type: String,
    enum: ['Villa', 'Apartment', 'Land', 'Commercial']
  },

  // ⭐ Client Testimonial
  clientName: {
    type: String
  },

  clientFeedback: {
    type: String
  },

  rating: {
    type: Number,
    min: 1,
    max: 5
  },

  // 🖼 Media
  photos: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 5']
  },

  videoUrl: {
    type: String
  },

  // 📅 Timeline
  successDate: {
    type: Date
  },

  // 📌 Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Pending'
  },

  isFeatured: {
    type: Boolean,
    default: false
  }

},
{ timestamps: true }
);

module.exports = mongoose.model('SuccessStory', SuccessSchema);
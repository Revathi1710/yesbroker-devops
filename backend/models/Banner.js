const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
 
  profileImage: {
    type: String,
     required: true
  },

  subtitle: {
    type: String
  },
  button: {
    type: String
  },
  url: {
    type: String
  }
 
}, { timestamps: true });

module.exports = mongoose.model('banner', bannerSchema);
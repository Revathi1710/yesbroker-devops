const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
    listingType: {
        type: String,
        enum: ['Sell', 'Rent', 'PG','Commercial','Plot'],
        required: true,
        default: 'Sell'
    },
    propertyType: {
        type: String,
        required: true,
        // Matches the options in your React frontend
        enum: ['Apartment', 'Independent House', 'Villa', 'Plot', 'Commercial']
    },
    // Changed to Array because AreasOfOperation allows multiple selections
    localities: {
        type: [String], 
        required: true,
    },
    size: {
        type: String, // Stored as string to allow "1200 Sq. Ft" or "3BHK"
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    // Array of strings to store image URLs or file paths
    photos: {
        type: [String],
        validate: [arrayLimit, '{PATH} exceeds the limit of 5']
    },
    status: {
        type: String,
        enum: ['Active', 'Sold', 'Rented'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },broker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Broker', // Must match the name of your Broker model
        required: true
    }
}, { timestamps: true });

// Custom validator to ensure no more than 5 photos are uploaded
function arrayLimit(val) {
    return val.length <= 5;
}

module.exports = mongoose.model('Property', PropertySchema);
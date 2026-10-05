const mongoose = require('mongoose');

const localitySchema = new mongoose.Schema({
    zone: {
        type: String,
        required: true
    },
    state: {
        type: String, // Or [String] if you want an array of states
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Locality', localitySchema);
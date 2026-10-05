const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    broker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Broker', // Ensure this matches your Broker model name
        required: true
    },
    planName: {
        type: String,
        required: true,
        enum: ['Basic', 'Premium', 'Pro', 'Elite'], // Define your plan tiers
        default: 'Basic'
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    billingCycle: {
        type: String,
        enum: ['Monthly', 'Yearly'],
        default: 'Monthly'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Expired', 'Cancelled', 'Pending'],
        default: 'Active'
    },
    paymentId: {
        type: String, // Store Razorpay/Stripe payment ID
        required: true
    },
    features: {
        maxProperties: { type: Number, default: 5 },
        premiumSupport: { type: Boolean, default: false },
        featuredListings: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Middleware to auto-calculate if subscription is expired before saving
subscriptionSchema.pre('save', function(next) {
    if (this.endDate < new Date()) {
        this.status = 'Expired';
    }
    next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
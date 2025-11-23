const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    property_name: {
        type: String,
        required: [true, 'Property name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    property_type: {
        type: String,
        enum: ['apartment', 'house', 'villa', 'cabin', 'studio', 'condo'],
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    bedrooms: {
        type: Number,
        required: true,
        min: 0
    },
    bathrooms: {
        type: Number,
        required: true,
        min: 0
    },
    max_guests: {
        type: Number,
        required: true,
        min: 1
    },
    price_per_night: {
        type: Number,
        required: true,
        min: 0
    },
    images: [{
        type: String
    }],
    amenities: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['active', 'snoozed', 'unlisted'],
        default: 'active'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for search performance
propertySchema.index({ city: 1, status: 1 });
propertySchema.index({ owner_id: 1 });
propertySchema.index({ price_per_night: 1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;


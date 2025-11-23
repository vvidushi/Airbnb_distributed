const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password_hash: {
        type: String,
        required: [true, 'Password is required']
    },
    full_name: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['traveler', 'owner'],
        required: [true, 'Role is required']
    },
    phone: {
        type: String,
        default: null
    },
    profile_pic: {
        type: String,
        default: null
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

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password_hash')) {
        return next();
    }
    
    try {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        this.password_hash = await bcrypt.hash(this.password_hash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

// Remove password from JSON responses
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password_hash;
    return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;


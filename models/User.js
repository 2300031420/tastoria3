const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
        type: String,
        required: true,
        minlength: [6, "Password must be at least 6 characters long"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
    },
    verificationCodeExpires: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    googleId: {
        type: String,
        sparse: true
    },
    photoURL: {
        type: String,
        default: '' // Default avatar URL can be set here
    },
    bio: {
        type: String,
        default: '',
        maxlength: [500, "Bio cannot be more than 500 characters"]
    },
    location: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        default: '',
        match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, "Please enter a valid phone number"]
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Favorite'
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    preferences: {
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            }
        },
        dietary: {
            vegetarian: {
                type: Boolean,
                default: false
            },
            vegan: {
                type: Boolean,
                default: false
            },
            glutenFree: {
                type: Boolean,
                default: false
            }
        }
    }
}, {
    timestamps: true,
});

// Password hashing middleware
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user profile (excluding sensitive information)
userSchema.methods.getProfile = function() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        photoURL: this.photoURL,
        bio: this.bio,
        location: this.location,
        phoneNumber: this.phoneNumber,
        isVerified: this.isVerified,
        preferences: this.preferences,
        createdAt: this.createdAt
    };
};

// Method to check if user has favorited an item
userSchema.methods.hasFavorited = async function(itemId) {
    const favorite = await mongoose.model('Favorite').findOne({
        user: this._id,
        item: itemId
    });
    return !!favorite;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
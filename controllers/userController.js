const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendOTPEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');

// Register User
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate verification code
        const verificationCode = crypto.randomBytes(32).toString('hex');
        const verificationCodeExpires = new Date(Date.now() + 24*60*60*1000); // 24 hours

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            verificationCode,
            verificationCodeExpires
        });

        // TODO: Send verification email

        res.status(201).json({
            message: 'User registered successfully. Please check your email for verification.',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email first' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Verify Email
const verifyEmail = async (req, res) => {
    try {
        const { code } = req.body;

        const user = await User.findOne({
            verificationCode: code,
            verificationCodeExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Send Verification OTP
const sendVerificationOTP = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate OTP (6 digits)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store temporary user data
        const tempUser = {
            name,
            email,
            password,
            otp,
            otpExpires
        };

        // In production, you should store this in Redis or a temporary collection
        // For now, we'll store it in memory (not recommended for production)
        global.tempUsers = global.tempUsers || new Map();
        const tempUserId = crypto.randomBytes(16).toString('hex');
        global.tempUsers.set(tempUserId, tempUser);

        // Send email with OTP
        await sendOTPEmail(email, otp, name);

        res.status(200).json({
            message: 'OTP sent successfully',
            tempUserId
        });
    } catch (error) {
        console.error('Error in sendVerificationOTP:', error);
        res.status(500).json({ 
            message: error.message || 'Failed to send OTP'
        });
    }
};

// Verify Signup OTP and Create User
const verifySignupOTP = async (req, res) => {
    try {
        const { tempId, otp } = req.body;

        // Get temporary user data
        const tempUser = global.tempUsers.get(tempId);
        if (!tempUser) {
            return res.status(400).json({ message: 'Invalid or expired session' });
        }

        // Verify OTP
        if (tempUser.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Check if OTP is expired
        if (new Date() > new Date(tempUser.otpExpires)) {
            global.tempUsers.delete(tempId);
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Create user
        const user = await User.create({
            name: tempUser.name,
            email: tempUser.email,
            password: tempUser.password,
            isVerified: true
        });

        // Clean up temp data
        global.tempUsers.delete(tempId);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error in verifySignupOTP:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Google Sign Up
const googleSignup = async (req, res) => {
    try {
        const { name, email, googleId, photoURL } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        
        if (user) {
            return res.status(200).json({
                message: 'User already exists',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    photoURL: user.photoURL
                }
            });
        }

        // Create new user
        user = await User.create({
            name,
            email,
            googleId,
            photoURL,
            isVerified: true,
            password: crypto.randomBytes(20).toString('hex') // Random password for Google users
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL
            }
        });
    } catch (error) {
        console.error('Error in googleSignup:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Google Login/Signup
const googleAuth = async (req, res) => {
    try {
        const { name, email, googleId, photoURL } = req.body;

        // Find or create user
        let user = await User.findOne({ email });
        
        if (!user) {
            // Create new user
            user = await User.create({
                name,
                email,
                googleId,
                photoURL,
                isVerified: true,
                password: crypto.randomBytes(20).toString('hex') // Random password for Google users
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Authentication successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL
            },
            token
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    sendVerificationOTP,
    verifySignupOTP,
    googleSignup,
    googleAuth
};
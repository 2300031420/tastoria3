const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Test route - no auth required
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Profile routes are working' });
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
    console.log('GET /me route hit');
    try {
        console.log('User ID from token:', req.user.id);
        
        const user = await User.findById(req.user.id).select('-password');
        console.log('Database query result:', user ? 'User found' : 'User not found');
        
        if (!user) {
            console.log('User not found in database');
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log('Sending user data');
        res.json(user);
    } catch (error) {
        console.error('Profile route error:', error);
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message 
        });
    }
});

// Update user profile
router.put('/', auth, async (req, res) => {
    try {
        const { name, phoneNumber, location } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    name: name || undefined,
                    phoneNumber: phoneNumber || undefined,
                    location: location || undefined,
                }
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message 
        });
    }
});

// Delete user profile
router.delete('/', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete profile error:', error);
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message 
        });
    }
});

module.exports = router;
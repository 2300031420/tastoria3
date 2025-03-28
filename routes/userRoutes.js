const express = require('express');
const router = express.Router();
const {
    sendVerificationOTP,
    verifySignupOTP,
    googleSignup,
    loginUser,
    googleAuth
} = require('../controllers/userController');

router.post('/send-verification-otp', sendVerificationOTP);
router.post('/verify-signup-otp', verifySignupOTP);
router.post('/google-signup', googleSignup);
router.post('/login', loginUser);
router.post('/google-auth', googleAuth);

module.exports = router;
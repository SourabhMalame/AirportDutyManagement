const router = require('express').Router();
const { sendOTP, verifyOTP, resendOTP, logout, saveFcmToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/logout', protect, logout);
router.post('/fcm-token', protect, saveFcmToken);

module.exports = router;

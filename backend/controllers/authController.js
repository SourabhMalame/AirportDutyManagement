const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// Fixed OTP for development — replace with real provider later
const generateOTP = () => '123456';

const findUser = identifier =>
  User.findOne({
    $or: [
      { username: identifier.toLowerCase() },
      { email: identifier.toLowerCase() },
      { phone: identifier },
    ],
  });

// Step 1: validate credentials → generate & store OTP
exports.sendOTP = async (req, res, next) => {
  console.log(req.body)

  try {
    const { identifier, password, role } = req.body;
    if (!identifier || !password)
      return res.status(400).json({ message: 'Identifier and password are required' });

    const user = await findUser(identifier).select('+password');

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials. Please check your username/email/phone and password.' });

    if (!user.isEnabled)
      return res.status(403).json({ message: 'Your account has been disabled. Contact admin.' });

    if (role && user.role !== role)
      return res.status(403).json({ message: `This account is not registered as ${role}. Please select the correct role.` });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await User.findByIdAndUpdate(user._id, { otp, otpExpiry });

    const maskedEmail = user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    const response = {
      message: `OTP sent to ${maskedEmail}`,
      userId: user._id,
      maskedEmail,
    };

    // Return OTP in response during development so it can be tested without SMTP
    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
      console.log(`[DEV] OTP for ${user.email}: ${otp}`);
    }

    res.json(response);

  } catch (err) {
    next(err);
  }

};

// Step 2: verify OTP → return JWT
exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp)
      return res.status(400).json({ message: 'User ID and OTP are required' });

    const user = await User.findById(userId).select('+otp +otpExpiry');
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    if (!user.otp || user.otp !== otp)
      return res.status(401).json({ message: 'Invalid OTP. Please check and try again.' });

    if (user.otpExpiry < new Date())
      return res.status(401).json({ message: 'OTP has expired. Please login again.' });

    await User.findByIdAndUpdate(user._id, { otp: null, otpExpiry: null });

    const token = signToken(user._id);
    res.json({ token, role: user.role, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

// Resend OTP (re-validates credentials not needed, just regenerate for same userId)
exports.resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ message: 'User ID is required' });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    if (!user.isEnabled)
      return res.status(403).json({ message: 'Account disabled.' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await User.findByIdAndUpdate(userId, { otp, otpExpiry });

    const maskedEmail = user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    const response = { message: `OTP resent to ${maskedEmail}`, maskedEmail };

    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
      console.log(`[DEV] Resent OTP for ${user.email}: ${otp}`);
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

exports.saveFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ message: 'fcmToken is required' });
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.json({ message: 'FCM token saved' });
  } catch (err) {
    next(err);
  }
};

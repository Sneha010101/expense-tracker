const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const sendEmail = require("../utils/sendEmail");

// Helper: generate a 6-digit numeric OTP and save it to the user document
const generateAndSaveOTP = async (user) => {
  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  user.otp = otp;
  user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await user.save();

  return otp;
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    res.json({ message: "Registration successful", user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Register error" });
  }
};

// LOGIN → generate OTP and send via email
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Wrong password" });

    const otp = await generateAndSaveOTP(user);

    console.log(`[2FA] OTP for ${email}: ${otp}`); // visible in server logs for debugging

    try {
      await sendEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      // OTP is still saved in DB — user can use the resend endpoint
    }

    res.json({ message: "OTP sent to your email address", email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login error" });
  }
};

// RESEND OTP — rate-limited by the router; only works if user already attempted login
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const otp = await generateAndSaveOTP(user);

    console.log(`[2FA] Resent OTP for ${email}: ${otp}`);

    try {
      await sendEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
    }

    res.json({ message: "A new OTP has been sent to your email address" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Resend OTP error" });
  }
};

// VERIFY OTP → issue JWT
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp) {
      return res.status(400).json({ message: "No OTP found. Please login again." });
    }

    if (new Date() > user.otpExpiresAt) {
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "OTP expired. Please login again." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP verify error" });
  }
};

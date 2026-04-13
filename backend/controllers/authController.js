const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const sendEmail = require("../utils/sendEmail");

// Store OTPs with expiry: { email: { otp, expiresAt } }
let otpStore = {};

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
    console.log(error);
    res.status(500).json({ message: "Register error" });
  }
};

// LOGIN → SEND OTP via SMS
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

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    // Store OTP with 5-minute expiry
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    console.log("OTP:", otp); // For testing

    // Send OTP via Email
    try {
      await sendEmail(email, otp);
      console.log("Email sent to", email);
    } catch (emailError) {
      console.log("Email sending failed (Nodemailer may not be configured):", emailError.message);
      console.log("Use the OTP from console log above for testing.");
    }

    res.json({ message: `OTP sent to your email address`, email });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Login error" });
  }
};

// VERIFY OTP → LOGIN SUCCESS
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const stored = otpStore[email];

    if (!stored) {
      return res.status(400).json({ message: "No OTP found. Please login again." });
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired. Please login again." });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear used OTP
    delete otpStore[email];

    const user = await User.findOne({ email });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "OTP verify error" });
  }
};
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
  verifyOTP,
  resendOTP,
} = require("../controllers/authController");

// Limit resend requests to prevent abuse: max 3 per 10 minutes per IP
const resendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { message: "Too many resend requests. Please wait 10 minutes." },
});

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendLimiter, resendOTP);

module.exports = router;

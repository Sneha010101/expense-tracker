const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Expense Tracker - OTP Verification",
    text: `Your OTP for login is: ${otp}\n\nThis OTP is valid for the next 5 minutes. Please do not share it with anyone.`,
  });
};

module.exports = sendEmail;
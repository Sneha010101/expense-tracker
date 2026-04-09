const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "yourgmail@gmail.com",
      pass: "your_app_password",
    },
  });

  await transporter.sendMail({
    from: "Expense Tracker",
    to: email,
    subject: "OTP Verification",
    text: `Your OTP is ${otp}`,
  });
};

module.exports = sendEmail;
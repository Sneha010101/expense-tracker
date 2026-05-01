const nodemailer = require("nodemailer");

const sendEmail = async (toEmail, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Expense Tracker Login OTP",
    text: `Your OTP is: ${otp}\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 8px;">Expense Tracker — Login Verification</h2>
        <p style="color: #555;">Use the OTP below to complete your login. It expires in <strong>5 minutes</strong>.</p>
        <div style="font-size: 40px; font-weight: bold; letter-spacing: 10px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 6px; color: #222; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email. Never share this code with anyone.</p>
      </div>
    `,
  });

  console.log(`✅ OTP email sent to ${toEmail}`);
};

module.exports = sendEmail;

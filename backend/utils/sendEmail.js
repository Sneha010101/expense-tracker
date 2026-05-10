const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (toEmail, otp) => {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: toEmail,
      subject: "Your Expense Tracker Login OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333;">Expense Tracker — Login Verification</h2>

          <p style="color: #555;">
            Use the OTP below to complete your login.
            It expires in <strong>5 minutes</strong>.
          </p>

          <div style="
            font-size: 40px;
            font-weight: bold;
            letter-spacing: 10px;
            text-align: center;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 6px;
            margin: 20px 0;
          ">
            ${otp}
          </div>

          <p style="color: #999; font-size: 12px;">
            Never share this code with anyone.
          </p>
        </div>
      `,
    });

    console.log("✅ OTP email sent:", response);
  } catch (error) {
    console.error("❌ Resend email error:", error);
    throw error;
  }
};

module.exports = sendEmail;
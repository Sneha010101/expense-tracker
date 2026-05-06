import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Start a 60-second cooldown timer for the resend button
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/login", { email, password });
      setStep(2);
      startResendCooldown();
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", { email, otp });
      login(res.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await API.post("/auth/resend-otp", { email });
      alert("A new OTP has been sent to your email.");
      startResendCooldown();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {step === 1 ? (
          <>
            <h2>Login</h2>
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button onClick={handleLogin} disabled={loading}>
              {loading ? "Sending OTP..." : "Login"}
            </button>
          </>
        ) : (
          <>
            <h2>Enter OTP</h2>
            <p style={{ color: "#555", fontSize: "14px" }}>
              A 6-digit code was sent to <strong>{email}</strong>. It expires in 5 minutes.
            </p>
            <input
              placeholder="6-digit OTP"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
            <button onClick={handleVerify} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              onClick={handleResend}
              disabled={loading || resendCooldown > 0}
              style={{ marginTop: "8px", background: "transparent", color: "#555", border: "1px solid #ccc" }}
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
            </button>
            <button
              onClick={() => { setStep(1); setOtp(""); }}
              style={{ marginTop: "4px", background: "transparent", color: "#888", border: "none", fontSize: "13px", cursor: "pointer" }}
            >
              ← Back to login
            </button>
          </>
        )}

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendOtpAPI, verifyOtpAPI, resetPasswordAPI } from "../services/authService";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const OTP_REGEX = /^[0-9]{6}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");

  const [email, setEmail] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
    global: "",
  });

  const [emailLoading, setEmailLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const clearErrors = () =>
    setErrors({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
      global: "",
    });

  const validateEmail = () => {
    if (!email.trim()) return "Email is required.";
    if (!EMAIL_REGEX.test(email.trim())) return "Please enter a valid email address.";
    return "";
  };

  const validateOtp = () => {
    if (!enteredOtp.trim()) return "OTP is required.";
    if (!OTP_REGEX.test(enteredOtp.trim())) return "OTP must be a 6-digit code.";
    return "";
  };

  const validatePassword = () => {
    if (!newPassword) return "New password is required.";
    if (!PASSWORD_REGEX.test(newPassword)) {
      return "Password must be at least 8 characters and include letters + numbers.";
    }
    return "";
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) return "Please confirm your password.";
    if (newPassword !== confirmPassword) return "Passwords do not match.";
    return "";
  };

  const stepsConfig = [
    { key: "email", label: "Verify Email" },
    { key: "otp", label: "Enter OTP" },
    { key: "reset", label: "Set Password" },
    { key: "done", label: "Complete" },
  ];

  const handleSendOtp = async () => {
    clearErrors();
    const emailError = validateEmail();
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    setEmailLoading(true);
    try {
      await sendOtpAPI(email.trim());
      setStep("otp");
    } catch (err) {
      const msg = err.response?.data?.message || "No account found with this email.";
      setErrors((prev) => ({ ...prev, global: msg }));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrors((prev) => ({ ...prev, otp: "", global: "" }));
    const otpError = validateOtp();
    if (otpError) {
      setErrors((prev) => ({ ...prev, otp: otpError }));
      return;
    }

    setOtpLoading(true);
    try {
      await verifyOtpAPI(email.trim(), enteredOtp.trim());
      setStep("reset");
    } catch (err) {
      const msg = err.response?.data?.message || "Incorrect OTP.";
      setErrors((prev) => ({ ...prev, otp: msg }));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    setErrors((prev) => ({ ...prev, otp: "", global: "" }));
    setResendLoading(true);
    try {
      await sendOtpAPI(email.trim());
      setEnteredOtp("");
    } catch {
      setErrors((prev) => ({ ...prev, global: "Failed to resend OTP." }));
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const passwordError = validatePassword();
    const confirmError = validateConfirmPassword();
    setErrors((prev) => ({
      ...prev,
      newPassword: passwordError,
      confirmPassword: confirmError,
      global: "",
    }));
    if (passwordError || confirmError) return;

    setResetLoading(true);
    try {
      await resetPasswordAPI(email.trim(), newPassword);
      setStep("done");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password.";
      setErrors((prev) => ({ ...prev, global: msg }));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div
        className="smp-left-panel"
        style={{ width: "320px", background: "linear-gradient(160deg,#1e1b4b,#4338ca)" }}
      >
        <div className="smp-brand">
          <div className="smp-logo-icon">🔐</div>
          <span className="smp-brand-name">
            Password <span className="smp-brand-accent">Recovery</span>
          </span>
        </div>
        <div style={{ width: "100%", maxWidth: "240px", marginTop: "16px" }}>
          {stepsConfig.map((item, idx) => {
            const activeIndex = stepsConfig.findIndex((x) => x.key === step);
            const isActive = step === item.key;
            const isDone = idx < activeIndex || step === "done";
            return (
              <div
                key={item.key}
                style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "700",
                    background: isDone ? "#10b981" : isActive ? "#ffffff" : "rgba(255,255,255,0.18)",
                    color: isDone ? "#fff" : isActive ? "#312e81" : "rgba(255,255,255,0.65)",
                  }}
                >
                  {isDone ? "✓" : idx + 1}
                </div>
                <span
                  style={{
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.74)",
                    fontSize: "13px",
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="smp-right-panel">
        <div className="smp-form-box" style={{ maxWidth: "420px" }}>
          {errors.global && <div className="smp-error-msg">{errors.global}</div>}

          {step === "email" && (
            <>
              <h2 className="smp-form-title">Reset password</h2>
              <p className="smp-form-subtitle">Enter your account email to receive an OTP.</p>
              <div className="smp-field">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "", global: "" }));
                  }}
                  className={errors.email ? "is-invalid" : ""}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <p className="smp-field-error">{errors.email}</p>}
              </div>
              <button className="smp-btn-primary" onClick={handleSendOtp} disabled={emailLoading}>
                {emailLoading ? "Sending OTP..." : "Send OTP"}
              </button>
              <div className="smp-link-row">
                <Link to="/login">← Back to login</Link>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <h2 className="smp-form-title">Enter OTP</h2>
              <p className="smp-form-subtitle">
                Enter the 6-digit code sent to <strong>{email}</strong>.
              </p>
              <div className="smp-field">
                <label>OTP code</label>
                <input
                  type="text"
                  value={enteredOtp}
                  maxLength={6}
                  onChange={(e) => {
                    setEnteredOtp(e.target.value.replace(/\D/g, ""));
                    setErrors((prev) => ({ ...prev, otp: "", global: "" }));
                  }}
                  className={errors.otp ? "is-invalid" : ""}
                  aria-invalid={Boolean(errors.otp)}
                  style={{ letterSpacing: "0.2em", fontWeight: "700" }}
                />
                {errors.otp && <p className="smp-field-error">{errors.otp}</p>}
              </div>
              <button
                className="smp-btn-primary"
                onClick={handleVerifyOtp}
                disabled={otpLoading || enteredOtp.length !== 6}
              >
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </button>
              <div className="smp-link-row">
                <a onClick={!resendLoading ? handleResend : undefined} style={{ cursor: "pointer" }}>
                  {resendLoading ? "Resending..." : "Resend OTP"}
                </a>
                {" · "}
                <a
                  onClick={() => setStep("email")}
                  style={{ cursor: "pointer" }}
                >
                  Change email
                </a>
              </div>
            </>
          )}

          {step === "reset" && (
            <>
              <h2 className="smp-form-title">Set new password</h2>
              <p className="smp-form-subtitle">Use a strong password to secure your account.</p>

              <div className="smp-field">
                <label>New password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, newPassword: "", global: "" }));
                    }}
                    className={errors.newPassword ? "is-invalid" : ""}
                    aria-invalid={Boolean(errors.newPassword)}
                    style={{ paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showNew ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.newPassword && <p className="smp-field-error">{errors.newPassword}</p>}
              </div>

              <div className="smp-field">
                <label>Confirm password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, confirmPassword: "", global: "" }));
                    }}
                    className={errors.confirmPassword ? "is-invalid" : ""}
                    aria-invalid={Boolean(errors.confirmPassword)}
                    style={{ paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="smp-field-error">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                className="smp-btn-primary"
                onClick={handleResetPassword}
                disabled={resetLoading}
              >
                {resetLoading ? "Resetting..." : "Reset password"}
              </button>
            </>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center" }}>
              <div className="status-icon success">✓</div>
              <h2 className="smp-form-title">Password updated</h2>
              <p className="smp-form-subtitle">Your password has been reset successfully.</p>
              <button className="smp-btn-primary" onClick={() => navigate("/login")}>
                Go to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

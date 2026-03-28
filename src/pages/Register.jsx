import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sendOtpAPI, verifyOtpAPI, verifyEmailAPI } from "../services/authService";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const MOBILE_REGEX = /^\+?[0-9\s-]{10,15}$/;
const OTP_REGEX = /^[0-9]{6}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [emailChecking, setEmailChecking] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!email || !EMAIL_REGEX.test(email)) {
      setEmailStatus("");
      setEmailChecking(false);
      return;
    }

    setEmailChecking(true);
    setEmailStatus("checking");

    const timer = setTimeout(async () => {
      try {
        const data = await verifyEmailAPI(email.trim());
        const isAvailable = data?.succuss === true || data?.success === true;
        setEmailStatus(isAvailable ? "available" : "taken");
      } catch {
        setEmailStatus("");
      } finally {
        setEmailChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const validateName = (value) => {
    if (!value.trim()) return "Full name is required.";
    if (value.trim().length < 2) return "Full name must be at least 2 characters.";
    return "";
  };

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required.";
    if (!EMAIL_REGEX.test(value.trim())) return "Please enter a valid email address.";
    if (emailStatus === "taken") return "This email is already registered.";
    return "";
  };

  const validateMobile = (value) => {
    if (!value.trim()) return "Mobile number is required.";
    if (!MOBILE_REGEX.test(value.trim())) return "Please enter a valid mobile number.";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required.";
    if (!PASSWORD_REGEX.test(value)) {
      return "Password must be at least 8 characters and include letters + numbers.";
    }
    return "";
  };

  const validateOtp = (value) => {
    if (!value.trim()) return "OTP is required.";
    if (!OTP_REGEX.test(value.trim())) return "OTP must be a 6-digit code.";
    return "";
  };

  const handleSendOtp = async () => {
    setError("");
    const emailError = validateEmail(email);
    setFieldErrors((prev) => ({ ...prev, email: emailError }));
    if (emailError || emailStatus !== "available") {
      return;
    }

    setOtpLoading(true);
    try {
      await sendOtpAPI(email.trim());
      setOtpSent(true);
      setEnteredOtp("");
      setEmailVerified(false);
      setFieldErrors((prev) => ({ ...prev, otp: "" }));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP. Please try again.";
      setError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    const otpError = validateOtp(enteredOtp);
    setFieldErrors((prev) => ({ ...prev, otp: otpError }));
    if (otpError) return;

    setVerifyLoading(true);
    try {
      await verifyOtpAPI(email.trim(), enteredOtp.trim());
      setEmailVerified(true);
      setFieldErrors((prev) => ({ ...prev, otp: "" }));
    } catch (err) {
      const msg = err.response?.data?.message || "Incorrect OTP. Please try again.";
      setFieldErrors((prev) => ({ ...prev, otp: msg }));
      setEmailVerified(false);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setOtpSent(false);
    setEmailVerified(false);
    setEnteredOtp("");
    setError("");
    setFieldErrors((prev) => ({ ...prev, email: "", otp: "" }));
    setEmailStatus("");
  };

  const canSubmit =
    !loading &&
    !validateName(name) &&
    !validateEmail(email) &&
    !validateMobile(mobile) &&
    !validatePassword(password) &&
    emailVerified;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const nextErrors = {
      name: validateName(name),
      email: validateEmail(email),
      mobile: validateMobile(mobile),
      password: validatePassword(password),
      otp: "",
    };
    if (!emailVerified) {
      nextErrors.otp = "Please verify your email before creating an account.";
    }
    setFieldErrors(nextErrors);

    if (
      nextErrors.name ||
      nextErrors.email ||
      nextErrors.mobile ||
      nextErrors.password ||
      nextErrors.otp
    ) {
      return;
    }

    setLoading(true);
    const result = await register(
      name.trim(),
      email.trim(),
      mobile.trim(),
      password
    );
    setLoading(false);

    if (result.success) {
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1400);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-shell">
      <div className="smp-left-panel">
        <div className="smp-brand">
          <div className="smp-logo-icon">💳</div>
          <span className="smp-brand-name">
            Sub<span className="smp-brand-accent">Manage</span>
          </span>
        </div>
        <h1 className="smp-headline">
          Start managing
          <br />
          <em>smarter today.</em>
        </h1>
        <p className="smp-subtext">
          Create your free account and get instant access to all subscription tools.
        </p>
        <div className="smp-float-cards">
          <div className="smp-fcard">
            <span className="smp-fcard-num">Free</span>To join
          </div>
          <div className="smp-fcard">
            <span className="smp-fcard-num">JWT</span>Secured
          </div>
          <div className="smp-fcard">
            <span className="smp-fcard-num">Stripe</span>Ready
          </div>
        </div>
      </div>

      <div className="smp-right-panel">
        <div className="smp-form-box">
          <h2 className="smp-form-title">Create account</h2>
          <p className="smp-form-subtitle">
            Join SubManage and manage subscriptions with confidence.
          </p>

          {error && <div className="smp-error-msg">{error}</div>}
          {success && <div className="smp-success-msg">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="smp-field">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, name: "" }));
                  setError("");
                }}
                className={fieldErrors.name ? "is-invalid" : ""}
                aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && <p className="smp-field-error">{fieldErrors.name}</p>}
            </div>

            <div className="smp-field">
              <label>
                Email address
                {emailChecking && (
                  <span className="smp-field-help" style={{ marginLeft: "8px" }}>
                    Checking...
                  </span>
                )}
                {!emailChecking && emailStatus === "available" && (
                  <span className="smp-field-help" style={{ marginLeft: "8px", color: "var(--success)" }}>
                    ✓ Available
                  </span>
                )}
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  className={fieldErrors.email ? "is-invalid" : ""}
                  aria-invalid={Boolean(fieldErrors.email)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="smp-otp-send-btn"
                  disabled={
                    otpLoading ||
                    emailVerified ||
                    emailChecking ||
                    emailStatus !== "available"
                  }
                >
                  {otpLoading ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                </button>
              </div>
              {fieldErrors.email && <p className="smp-field-error">{fieldErrors.email}</p>}
            </div>

            {otpSent && !emailVerified && (
              <div className="smp-field">
                <label>Enter OTP</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="6-digit OTP"
                    value={enteredOtp}
                    maxLength={6}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value.replace(/\D/g, ""));
                      setFieldErrors((prev) => ({ ...prev, otp: "" }));
                    }}
                    className={fieldErrors.otp ? "is-invalid" : ""}
                    aria-invalid={Boolean(fieldErrors.otp)}
                    style={{ flex: 1, letterSpacing: "0.2em", fontWeight: "700" }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="smp-otp-verify-btn"
                    disabled={verifyLoading || enteredOtp.length !== 6}
                  >
                    {verifyLoading ? "Verifying..." : "Verify"}
                  </button>
                </div>
                {fieldErrors.otp && <p className="smp-field-error">{fieldErrors.otp}</p>}
              </div>
            )}

            {emailVerified && (
              <div className="smp-verified-badge">✓ Email verified — {email}</div>
            )}

            <div className="smp-field">
              <label>Mobile number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, mobile: "" }));
                  setError("");
                }}
                className={fieldErrors.mobile ? "is-invalid" : ""}
                aria-invalid={Boolean(fieldErrors.mobile)}
              />
              {fieldErrors.mobile && <p className="smp-field-error">{fieldErrors.mobile}</p>}
            </div>

            <div className="smp-field">
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                    setError("");
                  }}
                  style={{ paddingRight: "44px" }}
                  className={fieldErrors.password ? "is-invalid" : ""}
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-light)",
                    fontSize: "16px",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="smp-field-error">{fieldErrors.password}</p>
              )}
              <p className="smp-field-help">
                Use at least 8 characters with letters and numbers.
              </p>
            </div>

            {!emailVerified && (
              <p className="smp-field-help">Verify your email with OTP to continue.</p>
            )}

            <button type="submit" className="smp-btn-primary" disabled={!canSubmit}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="smp-link-row">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

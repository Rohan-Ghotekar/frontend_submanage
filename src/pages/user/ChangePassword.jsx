import { useMemo, useState } from "react";
import UserNavbar from "../../components/UserNavbar";
import UserSidebar from "../../components/UserSidebar";
import { changePasswordAPI } from "../../services/authService";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    global: "",
  });
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => {
    if (!newPassword) return { label: "", width: "0%", color: "transparent" };
    if (newPassword.length < 8) return { label: "Weak", width: "33%", color: "#ef4444" };
    if (PASSWORD_REGEX.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword)) {
      return { label: "Strong", width: "100%", color: "#10b981" };
    }
    return { label: "Medium", width: "66%", color: "#f59e0b" };
  }, [newPassword]);

  const validate = () => {
    const next = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      global: "",
    };

    if (!oldPassword) next.oldPassword = "Current password is required.";
    if (!newPassword) {
      next.newPassword = "New password is required.";
    } else if (!PASSWORD_REGEX.test(newPassword)) {
      next.newPassword = "Use at least 8 characters with letters and numbers.";
    } else if (newPassword === oldPassword) {
      next.newPassword = "New password must be different from current password.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);
    return !next.oldPassword && !next.newPassword && !next.confirmPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setErrors((prev) => ({ ...prev, global: "" }));
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await changePasswordAPI(oldPassword, newPassword);
      setSuccess(data.message || "Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        global: "",
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to change password. Please verify your current password.";
      setErrors((prev) => ({ ...prev, global: msg }));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    !loading &&
    oldPassword.length > 0 &&
    PASSWORD_REGEX.test(newPassword) &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword &&
    newPassword !== oldPassword;

  const EyeButton = ({ show, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        border: "none",
        background: "none",
        cursor: "pointer",
        color: "var(--text-light)",
        fontSize: "16px",
      }}
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? "🙈" : "👁️"}
    </button>
  );

  return (
    <div>
      <UserNavbar />
      <div className="user-shell">
        <UserSidebar />
        <main className="user-content">
          <div className="admin-page-header">
            <h1 className="admin-page-title">Change password</h1>
            <p className="admin-page-subtitle">
              Update your password regularly to keep your account secure.
            </p>
          </div>

          <div className="change-password-layout">
            <div className="sub-detail-card">
              {errors.global && <div className="smp-error-msg">{errors.global}</div>}
              {success && <div className="smp-success-msg">✓ {success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="smp-field">
                  <label>Current password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showOld ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => {
                        setOldPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, oldPassword: "", global: "" }));
                      }}
                      className={errors.oldPassword ? "is-invalid" : ""}
                      aria-invalid={Boolean(errors.oldPassword)}
                      style={{ paddingRight: "44px" }}
                    />
                    <EyeButton show={showOld} onClick={() => setShowOld((prev) => !prev)} />
                  </div>
                  {errors.oldPassword && <p className="smp-field-error">{errors.oldPassword}</p>}
                </div>

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
                    <EyeButton show={showNew} onClick={() => setShowNew((prev) => !prev)} />
                  </div>
                  {errors.newPassword && <p className="smp-field-error">{errors.newPassword}</p>}
                  {newPassword && (
                    <div style={{ marginTop: "8px" }}>
                      <div
                        style={{
                          height: "6px",
                          background: "var(--border)",
                          borderRadius: "999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: strength.width,
                            height: "100%",
                            background: strength.color,
                          }}
                        />
                      </div>
                      <p className="smp-field-help" style={{ color: strength.color }}>
                        Password strength: {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div className="smp-field">
                  <label>Confirm new password</label>
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
                    <EyeButton
                      show={showConfirm}
                      onClick={() => setShowConfirm((prev) => !prev)}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="smp-field-error">{errors.confirmPassword}</p>
                  )}
                </div>

                <button type="submit" className="smp-btn-primary" disabled={!canSubmit}>
                  {loading ? "Updating password..." : "Update password"}
                </button>
              </form>
            </div>

            <div className="sub-detail-card">
              <h3 className="sub-detail-title">Password checklist</h3>
              {[
                {
                  label: "At least 8 characters",
                  met: newPassword.length >= 8,
                },
                {
                  label: "Contains letters and numbers",
                  met: PASSWORD_REGEX.test(newPassword),
                },
                {
                  label: "New password differs from current",
                  met: newPassword.length > 0 && oldPassword !== newPassword,
                },
                {
                  label: "Passwords match",
                  met: confirmPassword.length > 0 && confirmPassword === newPassword,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ color: item.met ? "var(--success)" : "var(--text-light)" }}>
                    {item.met ? "✓" : "○"}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--text-mid)" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ChangePassword;

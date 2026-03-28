import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import UserNavbar from "../../components/UserNavbar";
import UserSidebar from "../../components/UserSidebar";
import {
  updateProfileAPI,
  getProfileAPI,
  updateProfilePhotoAPI,
} from "../../services/authService";

const formatDate = (isoString) => {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (isoString) => {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

function Profile() {
  const { user, updateUser, updateAvatar } = useAuth();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [mobile, setMobile] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [fetching, setFetching] = useState(true);

  // Photo upload states
  const [photoPreview, setPhotoPreview] = useState(null); // local preview
  const [photoFile, setPhotoFile] = useState(null); // file to upload
  const [photoError, setPhotoError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [toast, setToast] = useState({ msg: "", type: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ name: "", mobile: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setFetching(true);
      try {
        const data = await getProfileAPI();
        setName(data.fullName || user?.name || "");
        setMobile(data.mobile || "");
        setAvatarUrl(data.avatarUrl || null);
        // Sync avatar to context so navbar shows it immediately
if (data.avatarUrl && updateAvatar) updateAvatar(data.avatarUrl)
        setCreatedAt(data.createdAt || null);
        setUpdatedAt(data.updatedAt || null);
      } catch (err) {
        setFetchError("Could not load profile data.");
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3500);
  };

  // ── Handle photo file selection ───────────────────────────────
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    setPhotoError("");

    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file.");
      return;
    }

    // Validate size — max 1 MB
    if (file.size > 1 * 1024 * 1024) {
      setPhotoError("Image must be under 1 MB.");
      return;
    }

    // Show local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    setPhotoFile(file);
  };

  // ── Upload photo to Spring Boot → S3 ─────────────────────────
  const handlePhotoUpload = async () => {
    if (!photoFile) return;

    setUploadingPhoto(true);
    setPhotoError("");
    try {
      const data = await updateProfilePhotoAPI(photoFile);
      // data.avatarUrl = S3 URL returned by Spring Boot
      setAvatarUrl(data.avatarUrl);
      setPhotoPreview(null);
      setPhotoFile(null);
      // Update avatar in context + sessionStorage so navbar refreshes instantly
      if (updateAvatar) updateAvatar(data.avatarUrl);
      showToast("Profile photo updated successfully!");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to upload photo. Please try again.";
      setPhotoError(msg);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCancelPhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    setPhotoError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Save profile details ──────────────────────────────────────
  const handleSave = async () => {
    setError("");
    const nextFieldErrors = { name: "", mobile: "" };
    if (!name.trim()) {
      nextFieldErrors.name = "Name is required.";
    } else if (name.trim().length < 2) {
      nextFieldErrors.name = "Name must be at least 2 characters.";
    }
    if (!mobile.trim()) {
      nextFieldErrors.mobile = "Mobile number is required.";
    } else if (!/^[0-9+\s\-]{7,15}$/.test(mobile.trim())) {
      nextFieldErrors.mobile = "Please enter a valid mobile number.";
    }
    setFieldErrors(nextFieldErrors);
    if (nextFieldErrors.name || nextFieldErrors.mobile) {
      return;
    }

    setLoading(true);
    try {
      const data = await updateProfileAPI(name.trim(), mobile.trim());
      setUpdatedAt(new Date().toISOString());
      const currentUser = JSON.parse(
        sessionStorage.getItem("smp_user") || "{}",
      );
      const updatedUser = { ...currentUser, name: name.trim() };
      sessionStorage.setItem("smp_user", JSON.stringify(updatedUser));
      if (updateUser) updateUser(updatedUser);
      setEditing(false);
      setFieldErrors({ name: "", mobile: "" });
      showToast(data?.message || "Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setError("");
    setFieldErrors({ name: "", mobile: "" });
    setEditing(false);
  };
  const canSave =
    editing &&
    !loading &&
    name.trim().length >= 2 &&
    /^[0-9+\s\-]{7,15}$/.test(mobile.trim());

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Current avatar to display: preview → S3 URL → initials
  const displayAvatar = photoPreview || avatarUrl;

  return (
    <div>
      <UserNavbar />
      <div className="user-shell">
        <UserSidebar />
        <main className="user-content">
          {/* Toast */}
          {toast.msg && (
            <div
              style={{
                position: "fixed",
                top: "76px",
                right: "28px",
                zIndex: 300,
                background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                color: toast.type === "success" ? "#166534" : "#991b1b",
                borderRadius: "10px",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              {toast.type === "success" ? "✓" : "✗"} {toast.msg}
            </div>
          )}

          <div className="admin-page-header">
            <h1 className="admin-page-title">My Profile</h1>
            <p className="admin-page-subtitle">
              View and update your account details.
            </p>
          </div>

          {fetching ? (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                padding: "40px",
                textAlign: "center",
                color: "var(--text-light)",
                fontSize: "14px",
              }}
            >
              Loading profile...
            </div>
          ) : (
            <>
              {fetchError && (
                <div className="smp-error-msg" style={{ marginBottom: "16px" }}>
                  {fetchError}
                </div>
              )}

              <div className="profile-card">
                {/* Green header band */}
                <div className="profile-header-band" />

                {/* Avatar + name row */}
                <div className="profile-avatar-row">
                  {/* ── Avatar with upload overlay ── */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    {/* Avatar circle */}
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt="Profile"
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "3px solid white",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                    ) : (
                      <div className="profile-avatar">{initials}</div>
                    )}

                    {/* Camera overlay button — only in edit mode */}
                    {editing && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "#0f4c3a",
                          color: "white",
                          border: "2px solid white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: "12px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                        title="Upload photo"
                      >
                        📷
                      </button>
                    )}

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handlePhotoSelect}
                    />
                  </div>

                  <div>
                    <div className="profile-name">{name}</div>
                    <span className="profile-role-badge">User</span>
                  </div>

                  {!editing && (
                    <button
                      className="btn-admin-secondary"
                      style={{ marginLeft: "auto" }}
                      onClick={() => setEditing(true)}
                    >
                      ✏️ Edit profile
                    </button>
                  )}
                </div>

                {/* Photo upload confirmation bar */}
                {photoFile && (
                  <div
                    style={{
                      margin: "0 28px 16px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>📷</span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#166534",
                          marginBottom: "2px",
                        }}
                      >
                        {photoFile.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#4d7c60" }}>
                        {(photoFile.size / 1024).toFixed(1)} KB · Preview shown
                        above
                      </div>
                    </div>
                    <button
                      className="btn-profile-save"
                      onClick={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      style={{
                        padding: "7px 16px",
                        fontSize: "13px",
                        opacity: uploadingPhoto ? 0.7 : 1,
                      }}
                    >
                      {uploadingPhoto ? "Uploading..." : "Upload"}
                    </button>
                    <button
                      className="btn-profile-cancel"
                      onClick={handleCancelPhoto}
                      disabled={uploadingPhoto}
                      style={{ padding: "7px 14px", fontSize: "13px" }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Photo error */}
                {photoError && (
                  <div style={{ margin: "0 28px 12px" }}>
                    <div className="smp-error-msg">{photoError}</div>
                  </div>
                )}

                {/* Field error */}
                {error && (
                  <div style={{ margin: "0 28px 12px" }}>
                    <div className="smp-error-msg">{error}</div>
                  </div>
                )}

                {/* Profile fields */}
                <div className="profile-fields">
                  <div className="profile-field">
                    <label>Full name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                        setFieldErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      disabled={!editing}
                      placeholder="Your full name"
                      className={fieldErrors.name ? "is-invalid" : ""}
                      aria-invalid={Boolean(fieldErrors.name)}
                    />
                    {fieldErrors.name && (
                      <p className="smp-field-error">{fieldErrors.name}</p>
                    )}
                  </div>
                  <div className="profile-field">
                    <label>Email address</label>
                    <input type="email" value={user?.email || ""} disabled />
                  </div>
                  <div className="profile-field">
                    <label>Mobile number</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value);
                        setError("");
                        setFieldErrors((prev) => ({ ...prev, mobile: "" }));
                      }}
                      disabled={!editing}
                      placeholder="e.g. +91 98765 43210"
                      className={fieldErrors.mobile ? "is-invalid" : ""}
                      aria-invalid={Boolean(fieldErrors.mobile)}
                    />
                    {fieldErrors.mobile && (
                      <p className="smp-field-error">{fieldErrors.mobile}</p>
                    )}
                  </div>
                  <div className="profile-field">
                    <label>Account role</label>
                    <input value="User" disabled />
                  </div>
                </div>

                {editing && (
                  <div className="profile-save-row">
                    <button
                      className="btn-profile-save"
                      onClick={handleSave}
                      disabled={!canSave}
                      style={{ opacity: canSave ? 1 : 0.65 }}
                    >
                      {loading ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      className="btn-profile-cancel"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Account info */}
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  padding: "24px 28px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "var(--text-dark)",
                    marginBottom: "16px",
                  }}
                >
                  Account info
                </h3>
                <div
                  className="profile-info-grid"
                >
                  {[
                    { label: "Member since", value: formatDate(createdAt) },
                    { label: "Email verified", value: "✓ Verified" },
                    { label: "Last updated", value: formatDateTime(updatedAt) },
                    { label: "Last login", value: "Today" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: "#f8fafc",
                        borderRadius: "10px",
                        padding: "14px 16px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "var(--text-light)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: "6px",
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "var(--text-dark)",
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Profile;

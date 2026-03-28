import { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import {
  createPlanAPI,
  getAllPlansAPI,
  getPlanByNameAPI,
  getPlansByStatusAPI,
  updatePlanAPI,
  deactivatePlanAPI,
  activatePlanAPI,
} from "../../services/planService";

const BILLING_INTERVALS = ["MONTHLY", "QUARTERLY", "ANNUALLY"];
const TIER_OPTIONS = ["BASIC", "PRO", "ENTERPRISE"];

// ══════════════════════════════════════════════════════════════
// PLAN MODAL — only collects + validates form data, calls onSave
// ══════════════════════════════════════════════════════════════
function PlanModal({ plan, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    billingInterval: "MONTHLY",
    tier: "BASIC",
    featuresInput: "",
  });
  const [errors, setErrors] = useState({});

  // Pre-fill form when editing an existing plan
  useEffect(() => {
    if (plan) {
      setForm({
        ...plan,
        tier: plan.tier || "BASIC",
        featuresInput: Array.isArray(plan.features)
          ? plan.features.join(", ")
          : plan.features || "",
      });
    }
  }, [plan]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Plan name is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.price || Number(form.price) <= 0)
      e.price = "Enter a valid price.";
    if (!form.featuresInput.trim())
      e.features = "At least one feature is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    // Convert comma-separated string → array for Spring Boot
    const featuresArray = form.featuresInput
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      billingInterval: form.billingInterval,
      tier: form.tier,
      features: featuresArray,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">
          {plan ? "Edit plan" : "Create new plan"}
        </h3>

        {/* Name */}
        <div className="modal-field">
          <label>Plan name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Starter"
          />
          {errors.name && (
            <p
              style={{
                color: "var(--error)",
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="modal-field">
          <label>Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="e.g. Perfect for small teams"
          />
          {errors.description && (
            <p
              style={{
                color: "var(--error)",
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              {errors.description}
            </p>
          )}
        </div>

        {/* Price + Billing + Tier */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
          }}
        >
          <div className="modal-field">
            <label>Price (₹)</label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="e.g. 499"
            />
            {errors.price && (
              <p
                style={{
                  color: "var(--error)",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                {errors.price}
              </p>
            )}
          </div>

          <div className="modal-field">
            <label>Billing interval</label>
            <select
              value={form.billingInterval}
              onChange={(e) =>
                setForm({ ...form, billingInterval: e.target.value })
              }
            >
              {BILLING_INTERVALS.map((b) => (
                <option key={b} value={b}>
                  {b.charAt(0) + b.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label>Tier</label>
            <select
              value={form.tier}
              onChange={(e) => setForm({ ...form, tier: e.target.value })}
            >
              {TIER_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Features */}
        <div className="modal-field">
          <label>
            Features{" "}
            <span style={{ color: "var(--text-light)", fontWeight: 400 }}>
              (comma separated)
            </span>
          </label>
          <textarea
            rows={3}
            value={form.featuresInput}
            onChange={(e) =>
              setForm({ ...form, featuresInput: e.target.value })
            }
            placeholder="e.g. Up to 10 users, Email support, Analytics"
          />
          {errors.features && (
            <p
              style={{
                color: "var(--error)",
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              {errors.features}
            </p>
          )}
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-light)",
              marginTop: "4px",
            }}
          >
            Each comma-separated item becomes one feature bullet point.
          </p>
        </div>

        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-admin-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : plan ? "Save changes" : "Create plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MANAGE PLANS PAGE
// ══════════════════════════════════════════════════════════════
function ManagePlans() {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [saving, setSaving] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Search states
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  // Status filter states
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [filterLoading, setFilterLoading] = useState(false);

  // ── Fetch all plans on mount ────────────────────────────────
  useEffect(() => {
    fetchAllPlans();
  }, []);

  const fetchAllPlans = async () => {
    setLoadingPlans(true);
    try {
      const data = await getAllPlansAPI();
      setPlans(data);
      localStorage.setItem("smp_plans", JSON.stringify(data));
    } catch (err) {
      setFetchError(err.response?.data?.message || "Failed to load plans.");
      const cached = localStorage.getItem("smp_plans");
      if (cached) setPlans(JSON.parse(cached));
    } finally {
      setLoadingPlans(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3500);
  };

  // ── CREATE or UPDATE plan ───────────────────────────────────
  const handleSave = async (formData) => {
    setSaving(true);

    if (editPlan) {
      // UPDATE
      try {
        await updatePlanAPI({
          id: editPlan.id,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          billingInterval: formData.billingInterval,
          tier: formData.tier,
          features: formData.features,
        });
        const refreshed = await getAllPlansAPI();
        setPlans(refreshed);
        localStorage.setItem("smp_plans", JSON.stringify(refreshed));
        showToast("Plan updated successfully!");
      } catch (err) {
        showToast(
          err.response?.data?.message || "Failed to update plan.",
          "error",
        );
      } finally {
        setSaving(false);
      }
    } else {
      // CREATE
      try {
        await createPlanAPI(formData);
        const refreshed = await getAllPlansAPI();
        setPlans(refreshed);
        localStorage.setItem("smp_plans", JSON.stringify(refreshed));
        showToast("Plan created successfully!");
      } catch (err) {
        showToast(
          err.response?.data?.message || "Failed to create plan.",
          "error",
        );
      } finally {
        setSaving(false);
      }
    }

    setShowModal(false);
    setEditPlan(null);
  };

  // ── ACTIVATE / DEACTIVATE plan ──────────────────────────────
  const handleToggleActive = async (id) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;

    try {
      if (plan.active) {
        await deactivatePlanAPI(id);
        showToast(`"${plan.name}" deactivated successfully!`);
      } else {
        await activatePlanAPI(id);
        showToast(`"${plan.name}" activated successfully!`);
      }
      const refreshed = await getAllPlansAPI();
      setPlans(refreshed);
      localStorage.setItem("smp_plans", JSON.stringify(refreshed));
      // Update search result if it was the toggled plan
      if (searchResult?.id === id) {
        const updated = refreshed.find((p) => p.id === id);
        if (updated) setSearchResult(updated);
      }
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          `Failed to ${plan.active ? "deactivate" : "activate"} plan.`,
        "error",
      );
    }
  };

  // ── SEARCH by name ──────────────────────────────────────────
  const handleSearch = async () => {
    if (!search.trim()) {
      setSearchResult(null);
      setSearchError("");
      return;
    }
    setSearching(true);
    setSearchError("");
    setSearchResult(null);
    try {
      const plan = await getPlanByNameAPI(search.trim());
      setSearchResult(plan);
    } catch (err) {
      if (err.response?.status === 404) {
        setSearchError(`No plan found with name "${search.trim()}".`);
      } else {
        setSearchError(
          err.response?.data?.message || "Search failed. Please try again.",
        );
      }
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchResult(null);
    setSearchError("");
  };

  // ── FILTER by status ────────────────────────────────────────
  const handleStatusFilter = async (value) => {
    setStatusFilter(value);

    if (value === "ALL") {
      setLoadingPlans(true);
      try {
        const data = await getAllPlansAPI();
        setPlans(data);
        localStorage.setItem("smp_plans", JSON.stringify(data));
      } catch (err) {
        showToast("Failed to load plans.", "error");
      } finally {
        setLoadingPlans(false);
      }
      return;
    }

    setFilterLoading(true);
    try {
      const data = await getPlansByStatusAPI(value); // "true" or "false"
      setPlans(data);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to filter plans.",
        "error",
      );
    } finally {
      setFilterLoading(false);
    }
  };

  const openEdit = (plan) => {
    setEditPlan(plan);
    setShowModal(true);
  };
  const openCreate = () => {
    setEditPlan(null);
    setShowModal(true);
  };

  // ── Display helpers ─────────────────────────────────────────
  const displayBilling = (interval = "") =>
    interval.charAt(0) + interval.slice(1).toLowerCase();

  const getFeatures = (plan) =>
    Array.isArray(plan.features)
      ? plan.features
      : (plan.features || "")
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean);

  // ══════════════════════════════════════════════════════════
  return (
    <div>
      <AdminNavbar />
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-content">
          {/* Toast notification */}
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

          {/* Page header */}
          <div
            className="admin-page-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h1 className="admin-page-title">Manage Plans</h1>
              <p className="admin-page-subtitle">
                Create, edit, and deactivate subscription plans.
              </p>
            </div>
            <button className="btn-admin-primary" onClick={openCreate}>
              + Create plan
            </button>
          </div>

          {/* ── Search + Filter card ── */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              padding: "20px 24px",
              marginBottom: "24px",
            }}
          >
            {/* Top row: label + status filter */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--text-dark)",
                }}
              >
                Search plan by name
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text-light)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Filter by status:
                </span>
                <div
                  style={{
                    display: "flex",
                    background: "var(--bg)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  {[
                    { label: "All", value: "ALL" },
                    { label: "✅ Active", value: "true" },
                    { label: "🚫 Inactive", value: "false" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusFilter(opt.value)}
                      disabled={filterLoading}
                      style={{
                        padding: "7px 16px",
                        background:
                          statusFilter === opt.value
                            ? opt.value === "true"
                              ? "#dcfce7"
                              : opt.value === "false"
                                ? "#fee2e2"
                                : "var(--brand)"
                            : "transparent",
                        color:
                          statusFilter === opt.value
                            ? opt.value === "true"
                              ? "#166534"
                              : opt.value === "false"
                                ? "#991b1b"
                                : "white"
                            : "var(--text-mid)",
                        border: "none",
                        cursor: filterLoading ? "not-allowed" : "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "13px",
                        fontWeight: "600",
                        transition: "all 0.15s",
                        opacity: filterLoading ? 0.6 : 1,
                      }}
                    >
                      {filterLoading && statusFilter === opt.value
                        ? "Loading..."
                        : opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search input row */}
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "14px",
                    color: "var(--text-light)",
                  }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="e.g. Basic, Pro, Starter..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (!e.target.value.trim()) {
                      setSearchResult(null);
                      setSearchError("");
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 36px",
                    border: "1.5px solid var(--border)",
                    borderRadius: "10px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    color: "var(--text-dark)",
                    background: "var(--bg)",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
              <button
                className="btn-admin-primary"
                onClick={handleSearch}
                disabled={searching || !search.trim()}
                style={{
                  opacity: !search.trim() ? 0.6 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {searching ? "Searching..." : "Search"}
              </button>
              {(searchResult || searchError) && (
                <button
                  className="btn-modal-cancel"
                  onClick={handleClearSearch}
                  style={{ whiteSpace: "nowrap" }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Search error */}
            {searchError && (
              <div
                style={{
                  marginTop: "12px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "var(--error)",
                }}
              >
                {searchError}
              </div>
            )}

            {/* Search result */}
            {searchResult && (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text-light)",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Search result
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    padding: "16px 20px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <span
                      className={
                        "badge " +
                        (searchResult.tier === "ENTERPRISE"
                          ? "badge-enterprise"
                          : searchResult.tier === "PRO"
                            ? "badge-pro"
                            : "badge-basic")
                      }
                    >
                      {searchResult.tier}
                    </span>
                    <div>
                      <div
                        style={{
                          fontFamily: "'Sora', sans-serif",
                          fontWeight: "700",
                          fontSize: "15px",
                          color: "var(--text-dark)",
                          marginBottom: "2px",
                        }}
                      >
                        {searchResult.name}
                      </div>
                      {searchResult.description && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-light)",
                          }}
                        >
                          {searchResult.description}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Sora', sans-serif",
                        fontWeight: "700",
                        fontSize: "18px",
                        color: "var(--brand)",
                      }}
                    >
                      ₹{searchResult.price}
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "400",
                          color: "var(--text-light)",
                        }}
                      >
                        /{searchResult.billingInterval?.toLowerCase()}
                      </span>
                    </div>
                    <span
                      className={
                        "badge " +
                        (searchResult.active ? "badge-active" : "badge-expired")
                      }
                    >
                      {searchResult.active ? "Active" : "Inactive"}
                    </span>
                    <span
                      style={{ fontSize: "12px", color: "var(--text-light)" }}
                    >
                      👥 {searchResult.subscriberCount ?? 0} subscribers
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      className="btn-admin-secondary"
                      onClick={() => openEdit(searchResult)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className={
                        searchResult.active
                          ? "btn-admin-danger"
                          : "btn-admin-secondary"
                      }
                      onClick={() => handleToggleActive(searchResult.id)}
                    >
                      {searchResult.active ? "🚫 Deactivate" : "✅ Activate"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fetch error */}
          {fetchError && (
            <div className="smp-error-msg" style={{ marginBottom: "16px" }}>
              {fetchError}
            </div>
          )}

          {/* Loading state */}
          {loadingPlans ? (
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                padding: "60px",
                textAlign: "center",
                color: "var(--text-light)",
                fontSize: "14px",
                marginBottom: "28px",
              }}
            >
              Loading plans...
            </div>
          ) : (
            <>
              {/* Plan cards grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "16px",
                  marginBottom: "28px",
                }}
              >
                {plans.map((plan, index) => (
                  <div
                    key={`${plan.id}-${index}`}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      overflow: "hidden",
                      opacity: plan.active ? 1 : 0.6,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Card header */}
                    <div
                      style={{
                        padding: "20px 20px 16px",
                        borderBottom: "1px solid var(--border)",
                        background:
                          plan.tier === "ENTERPRISE"
                            ? "#1e1b4b"
                            : plan.tier === "PRO"
                              ? "#f5f3ff"
                              : "#fafbff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          className={
                            "badge " +
                            (plan.tier === "ENTERPRISE"
                              ? "badge-enterprise"
                              : plan.tier === "PRO"
                                ? "badge-pro"
                                : "badge-basic")
                          }
                        >
                          {plan.tier
                            ? plan.tier.charAt(0) +
                              plan.tier.slice(1).toLowerCase()
                            : plan.name}
                        </span>
                        <span
                          className={
                            "badge " +
                            (plan.active ? "badge-active" : "badge-expired")
                          }
                        >
                          {plan.active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div
                        style={{
                          fontFamily: "'Sora', sans-serif",
                          fontSize: "20px",
                          fontWeight: "700",
                          marginBottom: "4px",
                          color:
                            plan.tier === "ENTERPRISE"
                              ? "white"
                              : "var(--text-dark)",
                        }}
                      >
                        {plan.name}
                      </div>

                      {plan.description && (
                        <div
                          style={{
                            fontSize: "12px",
                            marginBottom: "8px",
                            color:
                              plan.tier === "ENTERPRISE"
                                ? "rgba(255,255,255,0.6)"
                                : "var(--text-light)",
                          }}
                        >
                          {plan.description}
                        </div>
                      )}

                      <div
                        style={{
                          fontFamily: "'Sora', sans-serif",
                          fontSize: "24px",
                          fontWeight: "700",
                          color:
                            plan.tier === "ENTERPRISE"
                              ? "#67e8f9"
                              : "var(--brand)",
                        }}
                      >
                        ₹{plan.price}
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "400",
                            color:
                              plan.tier === "ENTERPRISE"
                                ? "rgba(255,255,255,0.6)"
                                : "var(--text-light)",
                          }}
                        >
                          /{displayBilling(plan.billingInterval)}
                        </span>
                      </div>
                    </div>

                    {/* Features + actions */}
                    <div
                      style={{
                        padding: "16px 20px",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: "0 0 16px",
                        }}
                      >
                        {getFeatures(plan).map((f, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: "13px",
                              color: "var(--text-mid)",
                              padding: "4px 0",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                color: "var(--success)",
                                fontWeight: 700,
                              }}
                            >
                              ✓
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>

                      {plan.subscriberCount !== undefined && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-light)",
                            marginBottom: "12px",
                          }}
                        >
                          👥 {plan.subscriberCount} subscriber
                          {plan.subscriberCount !== 1 ? "s" : ""}
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "auto",
                        }}
                      >
                        <button
                          className="btn-admin-secondary"
                          style={{ flex: 1 }}
                          onClick={() => openEdit(plan)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className={
                            plan.active
                              ? "btn-admin-danger"
                              : "btn-admin-secondary"
                          }
                          style={{ flex: 1 }}
                          onClick={() => handleToggleActive(plan.id)}
                        >
                          {plan.active ? "🚫 Deactivate" : "✅ Activate"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table view */}
              <div className="data-table-card">
                <div className="data-table-header">
                  <h3>All plans — table view</h3>
                  <span
                    style={{ fontSize: "13px", color: "var(--text-light)" }}
                  >
                    {plans.filter((p) => p.active).length} active
                  </span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Plan name</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Billing</th>
                      <th>Subscribers</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan, index) => (
                      <tr key={`table-${plan.id}-${index}`}>
                        <td style={{ fontWeight: 600 }}>{plan.name}</td>
                        <td
                          style={{ color: "var(--text-mid)", fontSize: "13px" }}
                        >
                          {plan.description || "—"}
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--brand)" }}>
                          ₹{plan.price}
                        </td>
                        <td>{displayBilling(plan.billingInterval)}</td>
                        <td style={{ color: "var(--text-mid)" }}>
                          {plan.subscriberCount ?? "—"}
                        </td>
                        <td>
                          <span
                            className={
                              "badge " +
                              (plan.active ? "badge-active" : "badge-expired")
                            }
                          >
                            {plan.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btn-admin-secondary"
                              onClick={() => openEdit(plan)}
                            >
                              Edit
                            </button>
                            <button
                              className={
                                plan.active
                                  ? "btn-admin-danger"
                                  : "btn-admin-secondary"
                              }
                              onClick={() => handleToggleActive(plan.id)}
                            >
                              {plan.active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Plan modal */}
      {showModal && (
        <PlanModal
          plan={editPlan}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditPlan(null);
          }}
          saving={saving}
        />
      )}
    </div>
  );
}

export default ManagePlans;

import { useNavigate } from "react-router-dom";

function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="status-page">
      <div className="status-card">
        <div className="status-icon error">✕</div>
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "24px",
            fontWeight: "700",
            color: "var(--text-dark)",
            marginBottom: "10px",
          }}
        >
          Payment cancelled
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-mid)",
            lineHeight: "1.7",
            marginBottom: "24px",
          }}
        >
          No charges were made. You can review plans and continue whenever you’re ready.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            className="btn-admin-primary"
            onClick={() => navigate("/plans")}
          >
            Back to plans
          </button>
          <button
            className="btn-admin-secondary"
            onClick={() => navigate("/subscription")}
          >
            View subscription
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;

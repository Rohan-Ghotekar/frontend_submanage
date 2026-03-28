import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyPaymentAPI } from "../../services/paymentService";
import { subscribeToPlanAPI, switchPlanAPI } from "../../services/subscriptionService";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const finalize = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setStatus("error");
        setMessage("Missing session ID. Please contact support.");
        return;
      }

      const isSwitch = localStorage.getItem("smp_payment_isswitch") === "true";
      const amount = Number(localStorage.getItem("smp_payment_amount") || 0);

      try {
        const verification = await verifyPaymentAPI(sessionId);

        if (verification.status !== "SUCCESS") {
          setStatus("error");
          setMessage(`Payment status: ${verification.status}. Please contact support.`);
          return;
        }

        const planId =
          verification.planId ||
          localStorage.getItem("smp_payment_preview_planid") ||
          localStorage.getItem("smp_payment_planId");

        const planName =
          verification.planName ||
          localStorage.getItem("smp_payment_preview_planname") ||
          localStorage.getItem("smp_payment_planName");

        if (!planId) {
          setStatus("error");
          setMessage(`Could not determine plan for session: ${sessionId}.`);
          return;
        }

        if (isSwitch) {
          await switchPlanAPI(planId, amount);
        } else {
          await subscribeToPlanAPI(planId);
        }

        localStorage.removeItem("smp_payment_isswitch");
        localStorage.removeItem("smp_payment_amount");
        localStorage.removeItem("smp_payment_preview_planid");
        localStorage.removeItem("smp_payment_preview_planname");
        localStorage.removeItem("smp_payment_planId");
        localStorage.removeItem("smp_payment_planName");

        setStatus("success");
        setMessage(
          isSwitch
            ? `Your plan has been switched to ${planName || verification.planName || "the selected plan"} successfully.`
            : `Your ${planName || verification.planName || "new"} subscription is now active.`
        );
        setTimeout(() => navigate("/subscription"), 2800);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            `Payment was received but activation failed for session: ${sessionId}.`
        );
      }
    };

    finalize();
  }, [navigate, searchParams]);

  return (
    <div className="status-page">
      <div className="status-card">
        {status === "processing" && (
          <>
            <div className="status-icon processing">⏳</div>
            <h2 className="smp-form-title">Verifying payment</h2>
            <p className="smp-form-subtitle">
              Please wait while we confirm your Stripe transaction.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="status-icon success">✓</div>
            <h2 className="smp-form-title">Payment successful</h2>
            <p className="smp-form-subtitle">{message}</p>
            <div
              style={{
                background: "var(--bg-subtle)",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "12px",
                color: "var(--text-light)",
                marginBottom: "16px",
              }}
            >
              Redirecting to your subscription page...
            </div>
            <button className="btn-admin-primary" onClick={() => navigate("/subscription")}>
              Go now
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="status-icon error">!</div>
            <h2 className="smp-form-title">Activation issue</h2>
            <p className="smp-form-subtitle">{message}</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-admin-primary" onClick={() => navigate("/plans")}>
                Back to plans
              </button>
              <button className="btn-admin-secondary" onClick={() => navigate("/subscription")}>
                View subscription
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;

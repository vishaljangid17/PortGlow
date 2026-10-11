import { useEffect } from "react";
import "./toast.css";

/**
 * Reusable PortGlow toast.
 *
 * Usage:
 *   const [toast, setToast] = useState(null);
 *   const closeToast = useCallback(() => setToast(null), []);
 *
 *   setToast({ type: "success", title: "Welcome back!", message: "Login successful." });
 *   setToast({ type: "error",   title: "Login failed", message: "Invalid password." });
 *
 *   <Toast toast={toast} onClose={closeToast} />
 */
function Toast({ toast, onClose }) {
  const duration = toast?.duration || 3500;

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div className="pg-toast-wrap">
      <div
        className={`pg-toast ${isError ? "pg-toast--error" : "pg-toast--success"}`}
        role={isError ? "alert" : "status"}
      >
        <span className="pg-toast-icon" aria-hidden="true">
          {isError ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          )}
        </span>

        <div className="pg-toast-body">
          <strong>{toast.title || (isError ? "Something went wrong" : "Success")}</strong>
          {toast.message && <p>{toast.message}</p>}
        </div>

        <button
          type="button"
          className="pg-toast-close"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          ×
        </button>

        <span
          className="pg-toast-bar"
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
}

export default Toast;

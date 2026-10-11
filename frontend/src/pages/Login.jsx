import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast.jsx";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const redirectTimer = useRef(null);

  const closeToast = useCallback(() => setToast(null), []);

  // Clear the pending redirect if the user leaves this page
  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setToast(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: email.trim().toLowerCase(),
          password,
        }
      );

      const { token, user, message } = response.data;

      if (!token || !user) {
        throw new Error("The server did not return a valid login session.");
      }

      // Save the authenticated session for subsequent API requests.
      localStorage.setItem("portglowToken", token);
      localStorage.setItem("portglowUser", JSON.stringify(user));

      setToast({
        type: "success",
        title: "Welcome back!",
        message: message || "Login successful. Taking you to your dashboard...",
        duration: 1600,
      });

      // Let the user see the toast, then go to the dashboard.
      // The button stays disabled until the redirect happens.
      redirectTimer.current = setTimeout(() => {
        navigate("/dashboard");
      }, 1300);
    } catch (error) {
      console.error("Login error:", error);

      setToast({
        type: "error",
        title: "Login failed",
        message:
          error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again.",
        duration: 4000,
      });

      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Toast toast={toast} onClose={closeToast} />

      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">✦</span>
          <span>PortGlow</span>
        </div>

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Log in to continue building your portfolio.
        </p>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>

            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate("/register")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/register");
              }
            }}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;

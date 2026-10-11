import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast.jsx";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

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

  const showError = (title, message) => {
    setToast({ type: "error", title, message, duration: 4000 });
  };

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();

    if (!name || !email || !formData.password) {
      showError("Missing details", "Please fill in all fields.");
      return;
    }

    if (formData.password.length < 8) {
      showError(
        "Password too short",
        "Password must contain at least 8 characters."
      );
      return;
    }

    setIsLoading(true);
    setToast(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password: formData.password,
        }
      );

      const { token, user, message } = response.data;

      if (!token || !user) {
        throw new Error(
          "Account created, but no login token was returned. Please log in."
        );
      }

      // Save the new user's authenticated session.
      localStorage.setItem("portglowToken", token);
      localStorage.setItem("portglowUser", JSON.stringify(user));

      setToast({
        type: "success",
        title: "Account created!",
        message:
          message || "Welcome to PortGlow. Taking you to your dashboard...",
        duration: 1600,
      });

      // Let the user see the toast, then go to the dashboard.
      // The button stays disabled until the redirect happens.
      redirectTimer.current = setTimeout(() => {
        navigate("/dashboard");
      }, 1300);
    } catch (error) {
      console.error("Registration error:", error);

      showError(
        "Registration failed",
        error.response?.data?.message ||
          error.message ||
          "Registration failed. Please try again."
      );

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

        <h1>Create account</h1>

        <p className="auth-subtitle">
          Create your account and start building your portfolio.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-name">Full Name</label>

            <input
              id="register-name"
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email</label>

            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>

            <input
              id="register-password"
              type="password"
              name="password"
              placeholder="Create a password (8+ characters)"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate("/login")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/login");
              }
            }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;

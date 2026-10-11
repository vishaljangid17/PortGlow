import { useEffect, useState } from "react";

import {

  Routes,

  Route,

  Navigate,

  useNavigate,

} from "react-router-dom";

import Rosey from "./components/Rosey.jsx";

import Builder from "./pages/Builder.jsx";

import Dashboard from "./pages/Dashboard.jsx";

import Login from "./pages/Login.jsx";

import Register from "./pages/Register.jsx";

import Preview from "./pages/Preview.jsx";

import PublicPortfolio from "./pages/PublicPortfolio.jsx";

// =========================================

// OPEN ROSEY CHAT

// =========================================

function openRosey() {

  window.dispatchEvent(new CustomEvent("rosey-open"));

  const floatingButton = Array.from(

    document.querySelectorAll("button")

  ).find(

    (button) =>

      getComputedStyle(button).position === "fixed" &&

      button.textContent.includes("🌹")

  );

  if (floatingButton) {

    floatingButton.click();

  }

}

// =========================================

// FEATURE ACTION BUTTON

// =========================================

function FeatureAction({ gradient, shadow, icon, title, text, onClick }) {

  const [hovered, setHovered] = useState(false);

  return (

    <div

      role="button"

      tabIndex={0}

      onClick={onClick}

      onKeyDown={(event) => {

        if (event.key === "Enter" || event.key === " ") {

          event.preventDefault();

          onClick();

        }

      }}

      onMouseEnter={() => setHovered(true)}

      onMouseLeave={() => setHovered(false)}

      style={{

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        gap: "14px",

        height: "58px",

        boxSizing: "border-box",

        padding: "0 14px",

        borderRadius: "14px",

        cursor: "pointer",

        background: gradient,

        boxShadow: hovered ? shadow.replace("0.28", "0.45") : shadow,

        transform: hovered ? "translateY(-3px)" : "translateY(0)",

        transition: "transform 0.2s ease, box-shadow 0.2s ease",

      }}

    >

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>

        <div

          className="rosey-icon"

          style={{

            width: "34px",

            height: "34px",

            minWidth: "34px",

            fontSize: "17px",

            transform: hovered ? "scale(1.08) rotate(-4deg)" : "scale(1)",

            transition: "transform 0.2s ease",

          }}

        >

          {icon}

        </div>

        <div>

          <h3 style={{ color: "#ffffff", margin: 0, fontSize: "14.5px" }}>

            {title}

          </h3>

          <p

            style={{

              color: "rgba(255, 255, 255, 0.88)",

              margin: 0,

              fontSize: "11.5px",

            }}

          >

            {text}

          </p>

        </div>

      </div>

      <span

        aria-hidden="true"

        style={{

          color: "#ffffff",

          fontSize: "16px",

          fontWeight: 700,

          transform: hovered ? "translateX(4px)" : "translateX(0)",

          transition: "transform 0.2s ease",

        }}

      >

        →

      </span>

    </div>

  );

}

// =========================================

// HOME PAGE

// =========================================

function Home() {

  const navigate = useNavigate();

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Is there a saved login in this browser?

  const [loggedIn, setLoggedIn] = useState(() =>

    Boolean(localStorage.getItem("portglowToken"))

  );

  const handleLogout = () => {

    localStorage.removeItem("portglowToken");

    localStorage.removeItem("portglowUser");

    setLoggedIn(false);

  };

  // Only logged-in users can go to the builder

  const goToBuilder = async () => {

    const token = localStorage.getItem("portglowToken");

    if (!token) {

      setLoggedIn(false);

      setShowLoginPrompt(true);

      return;

    }

    // Ask the server if this login is still valid (it may be expired)

    try {

      const response = await fetch(

        `${import.meta.env.VITE_API_URL || "https://portglow.onrender.com"}/api/portfolio`,

        { headers: { Authorization: `Bearer ${token}` } }

      );

      if (response.status === 401) {

        localStorage.removeItem("portglowToken");

        localStorage.removeItem("portglowUser");

        setLoggedIn(false);

        setShowLoginPrompt(true);

        return;

      }

    } catch {

      // Server unreachable: the Builder will show its own message

    }

    navigate("/builder");

  };

  return (

    <div className="app">

      {/\* Navbar \*/}

      <nav className="navbar">

        <div className="logo">

          <span className="logo-icon">✦</span>

          <div

            style={{

              display: "flex",

              flexDirection: "column",

              alignItems: "flex-start",

              lineHeight: 1.2,

            }}

          >

            <span>PortGlow</span>

            <span

              style={{

                fontSize: "11px",

                fontWeight: 600,

                letterSpacing: "0.04em",

                color: "#7c3aed",

              }}

            >

              We Make Your Skills Glow.

            </span>

          </div>

        </div>

        <div className="nav-links">

          <a href="#features">Features</a>

          <a href="#templates">Templates</a>

          <a href="#how-it-works">How it works</a>

        </div>

        {loggedIn ? (

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

            <button

              className="nav-button"

              onClick={() => navigate("/dashboard")}

            >

              Dashboard

            </button>

            <button

              className="nav-button"

              onClick={handleLogout}

              style={{

                background: "#ffffff",

                color: "#d93636",

                border: "1px solid rgba(239, 68, 68, 0.3)",

              }}

            >

              Logout

            </button>

          </div>

        ) : (

          <button

            className="nav-button"

            onClick={() => navigate("/login")}

          >

            Get Started

          </button>

        )}

      </nav>

      {/\* Hero \*/}

      <main className="hero">

        <div

          style={{

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            gap: "10px",

            flexWrap: "wrap",

          }}

        >

          <div className="badge">

            <span>✦</span>

            AI-Powered Portfolio Builder

          </div>

          <div

            className="badge"

            role="button"

            tabIndex={0}

            style={{ cursor: "pointer" }}

            onClick={openRosey}

            onKeyDown={(event) => {

              if (event.key === "Enter" || event.key === " ") {

                event.preventDefault();

                openRosey();

              }

            }}

          >

            <span>🌹</span>

            Meet Rosey

          </div>

        </div>

        <h1>

          Make your skills

          <br />

          <span>Glow.</span>

        </h1>

        <p className="hero-text">

          Create a professional portfolio that showcases your skills,

          projects, and experience — powered by AI and designed to

          make you stand out.

        </p>

        <div className="hero-buttons">

          <button

            className="primary-button"

            onClick={() => navigate(loggedIn ? "/dashboard" : "/login")}

          >

            {loggedIn ? "Go to Dashboard" : "Create My Portfolio"}

            <span>→</span>

          </button>

          <button

            className="secondary-button"

            onClick={() =>

              document

                .getElementById("templates")

                ?.scrollIntoView({ behavior: "smooth" })

            }

          >

            Explore Templates

          </button>

        </div>

        <div className="hero-note">

          <span>✦</span>

          We Make Your Skills Glow.

        </div>

        <div className="hero-note">

          <span>✦</span>

          Let your portfolio speak.

        </div>

      </main>

      {/\* Features \*/}

      <section className="features-section" id="features">

        <div className="section-heading">

          <div className="section-label">

            ✦ WHY PORTGLOW

          </div>

          <h2>

            Everything you need to

            <br />

            <span>stand out.</span>

          </h2>

          <p>

            From AI-generated content to beautiful templates,

            PortGlow handles the hard work for you.

          </p>

        </div>

        <div className="features-grid">

          <div className="feature-card">

            <div className="feature-icon">✦</div>

            <h3>AI Content Generation</h3>

            <p style={{ minHeight: "102px" }}>

              Turn your basic information into professional

              About sections, project descriptions, and

              portfolio content using AI.

            </p>

            <FeatureAction

              gradient="linear-gradient(135deg, #e11d48 0%, #fb7185 100%)"

              shadow="0 10px 24px rgba(225, 29, 72, 0.28)"

              icon="🌹"

              title="Meet Rosey"

              text="Your AI portfolio assistant."

              onClick={openRosey}

            />

          </div>

          <div className="feature-card" id="templates">

            <div className="feature-icon">◇</div>

            <h3>Beautiful Templates</h3>

            <p style={{ minHeight: "102px" }}>

              Choose from modern, developer-friendly templates

              designed to make your skills and projects stand out.

            </p>

            <FeatureAction

              gradient="linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)"

              shadow="0 10px 24px rgba(37, 99, 235, 0.28)"

              icon="◇"

              title="Explore Builder"

              text="Start building now."

              onClick={goToBuilder}

            />

          </div>

          <div className="feature-card" id="how-it-works">

            <div className="feature-icon">↗</div>

            <h3>One-Click Publishing</h3>

            <p style={{ minHeight: "102px" }}>

              Build your portfolio, customize it, and prepare

              your professional website for sharing.

            </p>

            <FeatureAction

              gradient="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)"

              shadow="0 10px 24px rgba(124, 58, 237, 0.28)"

              icon="🚀"

              title="Publish Now"

              text="Go live in one click."

              onClick={goToBuilder}

            />

          </div>

        </div>

      </section>

      {/\* Footer \*/}

      <footer className="footer">

        <div className="footer-logo">

          <span className="logo-icon">✦</span>

          <span>PortGlow</span>

        </div>

        <p>

          AI-powered portfolios for the next generation.

        </p>

        <div className="footer-divider" />

        <div className="footer-bottom">

          <span>

            © 2026 PortGlow. All rights reserved.

          </span>

          <span>

            Made with <span className="heart">♥</span> by{" "}

            <strong>Vishal Jangid</strong>

          </span>

        </div>

      </footer>

      {showLoginPrompt && (

        <div

          onClick={() => setShowLoginPrompt(false)}

          style={{

            position: "fixed",

            inset: 0,

            zIndex: 9999,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            padding: "20px",

            background: "rgba(15, 15, 20, 0.55)",

          }}

        >

          <section

            role="dialog"

            aria-modal="true"

            aria-labelledby="login-required-title"

            onClick={(event) => event.stopPropagation()}

            style={{

              width: "100%",

              maxWidth: "420px",

              padding: "36px 32px",

              borderRadius: "24px",

              textAlign: "center",

              background: "#ffffff",

              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.25)",

            }}

          >

            <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔒</div>

            <h2 id="login-required-title" style={{ margin: "0 0 8px" }}>

              Login required

            </h2>

            <p style={{ margin: "0 0 24px", color: "#6b7280" }}>

              Please log in to your PortGlow account to build and publish

              your portfolio.

            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>

              <button

                type="button"

                className="primary-button"

                onClick={() => navigate("/login")}

              >

                Log in

              </button>

              <button

                type="button"

                className="secondary-button"

                onClick={() => navigate("/register")}

              >

                Create account

              </button>

            </div>

            <button

              type="button"

              onClick={() => setShowLoginPrompt(false)}

              style={{

                marginTop: "16px",

                background: "none",

                border: "none",

                color: "#6b7280",

                cursor: "pointer",

              }}

            >

              Cancel

            </button>

          </section>

        </div>

      )}

    </div>

  );

}

// =========================================

// PROTECTED ROUTE

// =========================================

function ProtectedRoute({ children }) {

  return localStorage.getItem("portglowToken") ? (

    children

  ) : (

    <Navigate to="/login" replace />

  );

}

// =========================================

// APP ROUTES

// =========================================

function App() {

  const navigate = useNavigate();

  useEffect(() => {

    function handlePreview() {

      navigate("/preview");

    }

    window.addEventListener("portglow-preview", handlePreview);

    return () => {

      window.removeEventListener(

        "portglow-preview",

        handlePreview

      );

    };

  }, [navigate]);

  return (

    <>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route

          path="/dashboard"

          element={

            <ProtectedRoute>

              <Dashboard />

            </ProtectedRoute>

          }

        />

        <Route

          path="/builder"

          element={

            <ProtectedRoute>

              <Builder />

            </ProtectedRoute>

          }

        />

        <Route

          path="/preview"

          element={

            <ProtectedRoute>

              <Preview />

            </ProtectedRoute>

          }

        />

        {/\* Published portfolio — fetches data using its slug \*/}

        <Route

          path="/p/:slug"

          element={<PublicPortfolio />}

        />

      </Routes>

      <Rosey />

    </>

  );

}

export default App;


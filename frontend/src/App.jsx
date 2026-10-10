import { useEffect } from "react";
import {
  Routes,
  Route,
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
// HOME PAGE
// =========================================

function Home() {
  const navigate = useNavigate();

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">✦</span>
          <span>PortGlow</span>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#templates">Templates</a>
          <a href="#how-it-works">How it works</a>
        </div>

        <button
          className="nav-button"
          onClick={() => navigate("/login")}
        >
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <main className="hero">
        <div className="badge">
          <span>✦</span>
          AI-Powered Portfolio Builder
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
            onClick={() => navigate("/login")}
          >
            Create My Portfolio
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
      </main>

      {/* Features */}
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

            <p>
              Turn your basic information into professional
              About sections, project descriptions, and
              portfolio content using AI.
            </p>

            <div className="feature-number">01</div>
          </div>

          <div className="feature-card" id="templates">
            <div className="feature-icon">◇</div>

            <h3>Beautiful Templates</h3>

            <p>
              Choose from modern, developer-friendly templates
              designed to make your skills and projects stand out.
            </p>

            <div className="feature-number">02</div>

            <button
              className="secondary-button"
              onClick={() => navigate("/builder")}
            >
              Explore Builder
            </button>
          </div>

          <div className="feature-card" id="how-it-works">
            <div className="feature-icon">↗</div>

            <h3>One-Click Publishing</h3>

            <p>
              Build your portfolio, customize it, and prepare
              your professional website for sharing.
            </p>

            <div className="feature-number">03</div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
    </div>
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/preview" element={<Preview />} />

        {/* Published portfolio — fetches data using its slug */}
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

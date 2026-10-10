import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("portglowToken");
    localStorage.removeItem("portglowUser");
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <span className="logo-icon">✦</span>
          <span>PortGlow</span>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-welcome">
          <span className="dashboard-label">✦ DASHBOARD</span>

          <h1>
            Let's build your
            <br />
            <span>portfolio.</span>
          </h1>

          <p>
            Create a professional portfolio that showcases your skills,
            projects, and experience.
          </p>
        </div>

        <div className="portfolio-start-card">
          <div className="portfolio-card-icon">✦</div>

          <div className="portfolio-card-content">
            <h2>Start building your portfolio</h2>

            <p>
              Add your information, projects, skills, and let PortGlow help
              you create a professional portfolio.
            </p>
          </div>

          <button
            className="create-portfolio-button"
            onClick={() => navigate("/builder")}
          >
            Create Portfolio
            <span>→</span>
          </button>
        </div>

        <div className="quick-section">
          <h2>Quick actions</h2>

          <div className="quick-grid">
            <div className="quick-card">
              <div className="quick-icon">✦</div>
              <h3>Profile</h3>
              <p>Add your personal information and skills.</p>
            </div>

            <div className="quick-card">
              <div className="quick-icon">◇</div>
              <h3>Projects</h3>
              <p>Showcase your best projects and work.</p>
            </div>

            <div className="quick-card">
              <div className="quick-icon">↗</div>
              <h3>Templates</h3>
              <p>Choose a beautiful portfolio template.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

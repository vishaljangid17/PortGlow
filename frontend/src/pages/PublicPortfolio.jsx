jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PortfolioRenderer from "../templates/PortfolioRenderer.jsx";
import AuroraTemplate from "../templates/AuroraTemplate.jsx";
import { resolveTemplateId } from "../templates/registry.js";
import "../style.css";

const API_URL = import.meta.env.VITE_API_URL || "https://portglow.onrender.com";

export default function PublicPortfolio() {
  const { slug } = useParams();

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPortfolio() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/api/public/portfolio/${encodeURIComponent(slug)}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load this portfolio.");
        }

        setPortfolio(data.portfolio ?? data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load this portfolio.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <div className="premium-preview public-loading">
        <div className="public-loading-card">
          <span className="preview-brand-icon">✦</span>
          <h2>Loading portfolio...</h2>
          <p>Getting everything ready for you.</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="premium-preview public-loading">
        <div className="public-loading-card">
          <span className="preview-brand-icon">✦</span>
          <h1>Portfolio unavailable</h1>
          <p>{error || "This portfolio could not be found."}</p>

          <a className="preview-contact-button primary" href="/">
            Explore PortGlow
          </a>
        </div>
      </div>
    );
  }

  const template = resolveTemplateId(portfolio.template);

  // Every template except Aurora brings its own navbar + footer
  if (template !== "aurora") {
    return <PortfolioRenderer data={portfolio} template={template} />;
  }

  // AURORA — your original published page (navbar + design unchanged)
  return (
    <div className="portfolio-preview-page premium-preview">
      <header className="preview-toolbar">
        <a href="/" className="preview-toolbar-brand">
          <span className="preview-brand-icon">✦</span>
          <span>PortGlow</span>
        </a>

        <span className="preview-status">
          <span className="preview-status-dot" />
          Published Portfolio
        </span>
      </header>

      <AuroraTemplate data={portfolio} />
    </div>
  );
}

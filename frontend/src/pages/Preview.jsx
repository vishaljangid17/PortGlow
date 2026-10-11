import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortfolioRenderer from "../templates/PortfolioRenderer.jsx";
import { TEMPLATES, resolveTemplateId } from "../templates/registry.js";
import "./preview-bar.css";

const STORAGE_KEY = "portglowPortfolioContext";

function readContext() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function Preview() {
  const navigate = useNavigate();
  const [data, setData] = useState(readContext);

  const template = resolveTemplateId(data.template);

  // Always start at the top of the preview
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const changeTemplate = (id) => {
    const next = { ...readContext(), template: id };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("Could not save template choice:", error);
    }

    setData(next);
  };

  return (
    <div className="pv-page">
      <header className="pv-bar">
        <button
          type="button"
          className="pv-back"
          onClick={() => navigate("/builder")}
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Builder
        </button>

        <div className="pv-brand">
          <span className="pv-brand-icon">✦</span>

          <div className="pv-brand-text">
            <span>PortGlow</span>
            <span className="pv-brand-tagline">We Make Your Skills Glow.</span>
          </div>
        </div>

        <div className="pv-right">
          <label className="pv-select-wrap">
            <span>Template</span>

            <select
              className="pv-select"
              value={template}
              onChange={(event) => changeTemplate(event.target.value)}
            >
              {TEMPLATES.map((item) => (
                <option key={item.id} value={item.id} disabled={item.premium}>
                  {item.name}
                  {item.premium ? " (Premium)" : ""}
                </option>
              ))}
            </select>
          </label>

          <span className="pv-status">
            <i className="pv-status-dot" />
            Live Preview
          </span>
        </div>
      </header>

      <PortfolioRenderer data={data} template={template} />
    </div>
  );
}

export default Preview;

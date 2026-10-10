
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  MapPin,
  Code2,
  Sparkles,
} from "lucide-react";
import "../style.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function safeText(value, fallback = "") {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function normalizeUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  const url = value.trim();

  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) {
    return url;
  }

  return `https://${url}`;
}

function getTechnologies(project) {
  const technologies = project?.technologies;

  if (Array.isArray(technologies)) {
    return technologies
      .map((item) => safeText(item).trim())
      .filter(Boolean);
  }

  if (typeof technologies === "string") {
    return technologies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export default function Preview() {
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPortfolio() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("portglowToken");

        if (!token) {
          throw new Error("Please log in to preview your portfolio.");
        }

        const response = await fetch(`${API_URL}/api/portfolio`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            safeText(data?.message, "Unable to load your portfolio.")
          );
        }

        const savedPortfolio = data?.portfolio ?? data;

        if (
          !savedPortfolio ||
          typeof savedPortfolio !== "object" ||
          Array.isArray(savedPortfolio)
        ) {
          throw new Error("Portfolio data is invalid.");
        }

        setPortfolio(savedPortfolio);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            safeText(err?.message, "Unable to load your portfolio.")
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <main className="premium-preview public-loading">
        <div className="public-loading-card">
          <Sparkles size={28} />
          <h2>Preparing your preview...</h2>
          <p>Loading your portfolio information.</p>
        </div>
      </main>
    );
  }

  if (error || !portfolio) {
    return (
      <main className="premium-preview public-loading">
        <div className="public-loading-card">
          <h1>Preview unavailable</h1>
          <p>{error || "Portfolio data could not be loaded."}</p>

          <button
            type="button"
            className="preview-contact-button primary"
            onClick={() => navigate("/builder")}
          >
            Back to Builder
          </button>

          <button
            type="button"
            className="preview-contact-button premium-secondary"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
        </div>
      </main>
    );
  }

  const profile =
    portfolio.profile &&
    typeof portfolio.profile === "object" &&
    !Array.isArray(portfolio.profile)
      ? portfolio.profile
      : {};

  const name = safeText(profile.name, "Your Name");
  const title = safeText(profile.title, "Developer");
  const email = safeText(profile.email);
  const location = safeText(profile.location);
  const about = safeText(
    portfolio.about,
    "Add an About section in the builder to introduce yourself."
  );

  const github = normalizeUrl(profile.github);
  const linkedin = normalizeUrl(profile.linkedin);

  const skills = Array.isArray(portfolio.skills)
    ? portfolio.skills
        .map((skill) => {
          if (typeof skill === "string") return skill;
          if (skill && typeof skill === "object") {
            return safeText(skill.name || skill.title);
          }
          return "";
        })
        .filter(Boolean)
    : [];

  const projects = Array.isArray(portfolio.projects)
    ? portfolio.projects.filter(
        (project) => project && typeof project === "object"
      )
    : [];

  return (
    <div className="portfolio-preview-page premium-preview">
      <header className="preview-toolbar">
        <button
          type="button"
          className="preview-contact-button premium-secondary"
          onClick={() => navigate("/builder")}
        >
          <ArrowLeft size={16} />
          Back to Builder
        </button>

        <div className="preview-toolbar-brand">
          <span className="preview-brand-icon">✦</span>
          <span>PortGlow</span>
        </div>

        <span className="preview-status">
          <span className="preview-status-dot" />
          Live Preview
        </span>
      </header>

      <main className="preview-portfolio premium-portfolio">
        {/* HERO */}
        <section className="premium-hero">
          <div className="premium-hero-copy">
            <div className="preview-eyebrow">
              <Sparkles size={15} />
              <span>HELLO, I'M</span>
            </div>

            <h1 className="premium-name">
              {name}
              <span className="premium-name-dot">.</span>
            </h1>

            <h2 className="premium-title">{title}</h2>

            {location && (
              <p className="preview-location premium-location">
                <MapPin size={15} />
                {location}
              </p>
            )}

            <p className="premium-intro">{about}</p>

            <div className="preview-contact-links premium-hero-actions">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="preview-contact-button primary"
                >
                  <Mail size={17} />
                  Contact Me
                </a>
              )}

              <a
                href="#projects"
                className="preview-contact-button premium-secondary"
              >
                View Projects
              </a>
            </div>

            <div className="premium-social-links">
              {github && (
                <a href={github} target="_blank" rel="noreferrer">
                  <Code2 size={16} />
                  GitHub
                  <ExternalLink size={12} />
                </a>
              )}

              {linkedin && (
                <a href={linkedin} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} />
                  LinkedIn
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          <div className="premium-hero-decoration" aria-hidden="true">
            <div className="premium-decoration-orbit orbit-one" />
            <div className="premium-decoration-orbit orbit-two" />
            <div className="premium-decoration-center">✦</div>
            <span className="premium-decoration-label">
              BUILD · CREATE · GROW
            </span>
          </div>
        </section>

        {/* ABOUT */}
        <section className="preview-section premium-section" id="about">
          <div className="premium-section-heading">
            <span className="preview-section-number">01 / ABOUT</span>
            <h2>
              A little about me<span>.</span>
            </h2>
          </div>

          <div className="premium-about-layout">
            <div className="premium-about-mark" aria-hidden="true">
              “
            </div>
            <p className="preview-about-text premium-about-text">{about}</p>
          </div>
        </section>

        {/* SKILLS */}
        <section className="preview-section premium-section" id="skills">
          <div className="premium-section-heading">
            <span className="preview-section-number">02 / SKILLS</span>
            <h2>
              What I work with<span>.</span>
            </h2>
            <p>The technologies and tools I use to bring ideas to life.</p>
          </div>

          {skills.length > 0 ? (
            <div className="preview-skills premium-skills">
              {skills.map((skill, index) => (
                <div
                  className="preview-skill premium-skill"
                  key={`${skill}-${index}`}
                >
                  <span className="premium-skill-icon">
                    <Code2 size={17} />
                  </span>
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="preview-empty-state">
              Add skills in the builder to display them here.
            </p>
          )}
        </section>

        {/* PROJECTS */}
        <section className="preview-section premium-section" id="projects">
          <div className="premium-section-heading">
            <span className="preview-section-number">03 / PROJECTS</span>
            <h2>
              Things I've built<span>.</span>
            </h2>
            <p>A selection of projects and things I've created.</p>
          </div>

          {projects.length > 0 ? (
            <div className="preview-projects premium-projects">
              {projects.map((project, index) => {
                const projectTitle = safeText(
                  project.title || project.name,
                  "Untitled Project"
                );

                const description = safeText(
                  project.description,
                  "Project description not added yet."
                );

                const technologies = getTechnologies(project);
                const projectGithub = normalizeUrl(project.github);
                const live = normalizeUrl(
                  project.live ||
                    project.liveDemo ||
                    project.demo ||
                    ""
                );

                return (
                  <article
                    className="preview-project-card premium-project-card"
                    key={project._id || project.id || `${projectTitle}-${index}`}
                  >
                    <div className="premium-project-topline">
                      <span className="preview-project-number">
                        PROJECT {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="premium-project-symbol">
                        <Code2 size={20} />
                      </span>
                    </div>

                    <h3>{projectTitle}</h3>
                    <p>{description}</p>

                    {technologies.length > 0 && (
                      <div className="preview-project-tech premium-project-tech">
                        {technologies.map((technology, techIndex) => (
                          <span key={`${technology}-${techIndex}`}>
                            {technology}
                          </span>
                        ))}
                      </div>
                    )}

                    {(projectGithub || live) && (
                      <div className="preview-project-links premium-project-links">
                        {projectGithub && (
                          <a
                            href={projectGithub}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Code2 size={16} />
                            Source Code
                            <ArrowLeft
                              size={14}
                              style={{ transform: "rotate(135deg)" }}
                            />
                          </a>
                        )}

                        {live && (
                          <a
                            href={live}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Live Demo
                            <ExternalLink size={15} />
                          </a>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="preview-empty-state">
              Add projects in the builder to display them here.
            </p>
          )}
        </section>

        {/* CONTACT */}
        <section className="preview-contact-section premium-contact-section">
          <div className="premium-contact-decoration">
            <Sparkles size={20} />
          </div>

          <span className="preview-section-number">04 / CONTACT</span>

          <h2>
            Let's build something great<span>.</span>
          </h2>

          <p>
            Have an opportunity or an interesting idea? I'd love to hear
            from you.
          </p>

          <div className="preview-contact-links premium-contact-actions">
            {email && (
              <a
                href={`mailto:${email}`}
                className="preview-contact-button primary"
              >
                <Mail size={17} />
                Get in touch
              </a>
            )}

            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                className="preview-contact-button premium-secondary"
              >
                <ExternalLink size={16} />
                LinkedIn
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="preview-footer premium-footer">
          <a href="/" className="preview-toolbar-brand">
            <span className="preview-brand-icon">✦</span>
            <span>PortGlow</span>
          </a>

          <span>© 2026 PortGlow. All rights reserved.</span>

          <span>
            Made with <span className="heart">♥</span> by{" "}
            <strong>Vishal Jangid</strong>
          </span>
        </footer>
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Code2,
  ExternalLink,
  Mail,
  MapPin,
  Sparkles,
  Phone,
  X,
} from "lucide-react";
import "../style.css";

/**
 * AURORA — the original PortGlow portfolio design.
 * Uses the existing "premium-*" styles from style.css, so it looks
 * exactly like the published portfolio you already have.
 *
 * Render it inside:  <div className="portfolio-preview-page premium-preview">
 */

function normalizeUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const url = value.trim();

  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) {
    return url;
  }

  return `https://${url}`;
}

function formatSkill(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function getTechnologies(project) {
  if (Array.isArray(project?.technologies)) {
    return project.technologies.filter(
      (item) => typeof item === "string" && item.trim()
    );
  }

  if (typeof project?.technologies === "string") {
    return project.technologies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export default function AuroraTemplate({ data }) {
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (!contactOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setContactOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [contactOpen]);

  const portfolio = data || {};
  const profile = portfolio.profile || {};
  const skills = Array.isArray(portfolio.skills) ? portfolio.skills : [];
  const projects = Array.isArray(portfolio.projects) ? portfolio.projects : [];

  const name = profile.name?.trim() || "Portfolio";
  const title = profile.title?.trim() || "Developer";
  const about =
    portfolio.about?.trim() ||
    "Welcome to my portfolio. More about me coming soon.";
  const email = profile.email?.trim() || "";
  const phone = profile.phone?.trim() || "";
  const github = normalizeUrl(profile.github);
  const linkedin = normalizeUrl(profile.linkedin);
  const instagram = normalizeUrl(profile.instagram);
  const location = profile.location?.trim() || "";

  const contactOptions = [
    {
      label: "Email Me",
      detail: email,
      icon: Mail,
      href: email ? `mailto:${email}` : "",
    },
    {
      label: "Call Me",
      detail: phone,
      icon: Phone,
      href: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "",
    },
    {
      label: "Instagram",
      detail: "Connect on Instagram",
      icon: null,
      href: instagram,
    },
    {
      label: "LinkedIn",
      detail: "Connect professionally",
      icon: ExternalLink,
      href: linkedin,
    },
  ].filter((item) => item.href);

  return (
    <>
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
              <button
                type="button"
                className="preview-contact-button primary"
                onClick={() => setContactOpen(true)}
              >
                <Mail size={17} />
                Contact Me
                <ArrowUpRight size={16} />
              </button>

              <a
                href="#projects"
                className="preview-contact-button premium-secondary"
              >
                View Projects
                <ArrowUpRight size={16} />
              </a>
            </div>

            <div className="premium-social-links">
              {github && (
                <a href={github} target="_blank" rel="noopener noreferrer">
                  <Code2 size={16} />
                  GitHub
                  <ExternalLink size={12} />
                </a>
              )}

              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer">
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
              {skills.map((skill, index) => {
                const skillName = formatSkill(
                  typeof skill === "string"
                    ? skill
                    : skill?.name || skill?.title || ""
                );

                if (!skillName) return null;

                return (
                  <div
                    className="preview-skill premium-skill"
                    key={`${skillName}-${index}`}
                  >
                    <span className="premium-skill-icon">
                      <Code2 size={17} />
                    </span>

                    <span>{skillName}</span>

                    <ArrowUpRight className="premium-skill-arrow" size={14} />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="preview-empty-state">
              No skills have been added yet.
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
            <p>A selection of projects and things I've enjoyed creating.</p>
          </div>

          {projects.length > 0 ? (
            <div className="preview-projects premium-projects">
              {projects.map((project, index) => {
                const projectTitle =
                  project.title || project.name || "Untitled Project";
                const technologies = getTechnologies(project);
                const projectGithub = normalizeUrl(project.github);
                const live = normalizeUrl(
                  project.live || project.liveDemo || project.demo || ""
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

                    <p>
                      {project.description ||
                        "Project description not added yet."}
                    </p>

                    {technologies.length > 0 && (
                      <div className="preview-project-tech premium-project-tech">
                        {technologies.map((technology, techIndex) => (
                          <span key={`${technology}-${techIndex}`}>
                            {formatSkill(technology)}
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
                            rel="noopener noreferrer"
                          >
                            <Code2 size={16} />
                            Source Code
                            <ArrowUpRight size={15} />
                          </a>
                        )}

                        {live && (
                          <a
                            href={live}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Live Demo
                            <ArrowUpRight size={15} />
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
              No projects have been added yet.
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
            Have an opportunity or an interesting idea? I'd love to hear from
            you.
          </p>

          <div className="preview-contact-links premium-contact-actions">
            <button
              type="button"
              className="preview-contact-button primary"
              onClick={() => setContactOpen(true)}
            >
              <Mail size={17} />
              Get in touch
              <ArrowUpRight size={16} />
            </button>

            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="preview-contact-button premium-secondary"
              >
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

      {/* CONTACT POPUP */}
      {contactOpen && (
        <div
          className="portglow-contact-overlay"
          onClick={() => setContactOpen(false)}
        >
          <section
            className="portglow-contact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="portglow-contact-close"
              type="button"
              aria-label="Close contact popup"
              onClick={() => setContactOpen(false)}
            >
              <X size={20} />
            </button>

            <div className="preview-brand-icon">✦</div>

            <h2 id="contact-modal-title">Let's connect!</h2>

            <p>Choose your preferred way to get in touch.</p>

            <div className="portglow-contact-options">
              {contactOptions.length > 0 ? (
                contactOptions.map(({ label, detail, icon: Icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    target={
                      label === "Instagram" || label === "LinkedIn"
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      label === "Instagram" || label === "LinkedIn"
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="portglow-contact-option"
                  >
                    {label === "Instagram" ? (
                      <span
                        className="portglow-instagram-icon"
                        aria-hidden="true"
                      >
                        ◎
                      </span>
                    ) : (
                      <Icon size={20} />
                    )}

                    <span>
                      <strong>{label}</strong>
                      <small>{detail}</small>
                    </span>

                    <ArrowUpRight size={17} />
                  </a>
                ))
              ) : (
                <p>
                  Contact details haven't been added to this portfolio yet.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

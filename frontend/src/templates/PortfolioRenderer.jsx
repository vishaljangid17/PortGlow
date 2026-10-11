import "./templates.css";
import { resolveTemplateId } from "./registry.js";
import AuroraTemplate from "./AuroraTemplate.jsx";

function normalizeUrl(url) {
  const value = typeof url === "string" ? url.trim() : "";
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/**
 * Renders a portfolio in the selected template.
 *
 * data     = { profile, about, skills, projects }
 * template = template id (see registry.js)
 */
function PortfolioRenderer({ data, template }) {
  const id = resolveTemplateId(template);

  // Aurora = your original design (exact same markup + styles as before)
  if (id === "aurora") {
    return (
      <div className="portfolio-preview-page premium-preview">
        <AuroraTemplate data={data} />
      </div>
    );
  }

  const profile = data?.profile || {};
  const about = typeof data?.about === "string" ? data.about.trim() : "";
  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const projects = Array.isArray(data?.projects) ? data.projects : [];

  const name = (profile.name || "").trim() || "Your Name";
  const title = (profile.title || "").trim() || "Your Professional Title";
  const location = (profile.location || "").trim();
  const email = (profile.email || "").trim();
  const phone = (profile.phone || "").trim();

  const initials =
    name
      .split(/\s+/)
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "P";

  const socials = [
    { label: "GitHub", href: normalizeUrl(profile.github) },
    { label: "LinkedIn", href: normalizeUrl(profile.linkedin) },
    { label: "Instagram", href: normalizeUrl(profile.instagram) },
  ].filter((social) => social.href);

  const intro = about
    ? about.length > 260
      ? `${about.slice(0, 257).trimEnd()}…`
      : about
    : "Add an About section in the builder to introduce yourself here.";

  const year = new Date().getFullYear();

  return (
    <div className={`tpl tpl-${id}`}>
      <div className="tpl-bg" aria-hidden="true" />

      {/* NAV */}
      <header className="tpl-nav">
        <span className="tpl-brand">
          <span className="tpl-brand-mark">{initials}</span>
          {name}
        </span>

        <nav className="tpl-links" aria-label="Sections">
          <a href="#tpl-about">About</a>
          <a href="#tpl-skills">Skills</a>
          <a href="#tpl-projects">Projects</a>
          <a href="#tpl-contact">Contact</a>
        </nav>
      </header>

      {/* HERO */}
      <section className="tpl-hero">
        <div className="tpl-hero-copy">
          <span className="tpl-eyebrow">✦ Hello, I'm</span>

          <h1 className="tpl-name">
            {name}
            <span className="tpl-dot">.</span>
          </h1>

          <h2 className="tpl-role">{title}</h2>

          {location && <p className="tpl-location">◎ {location}</p>}

          <p className="tpl-intro">{intro}</p>

          <div className="tpl-actions">
            {email ? (
              <a className="tpl-btn tpl-btn-primary" href={`mailto:${email}`}>
                Contact Me
              </a>
            ) : (
              <a className="tpl-btn tpl-btn-primary" href="#tpl-contact">
                Contact Me
              </a>
            )}

            <a className="tpl-btn" href="#tpl-projects">
              View Projects
            </a>
          </div>

          {socials.length > 0 && (
            <div className="tpl-socials">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {social.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="tpl-art" aria-hidden="true">
          <div className="tpl-art-shape">
            <span className="tpl-orbit o1" />
            <span className="tpl-orbit o2" />
            <span className="tpl-core">✦</span>
          </div>

          <div className="tpl-art-stats">
            <div>
              <strong>{String(projects.length).padStart(2, "0")}</strong>
              <span>Projects</span>
            </div>
            <div>
              <strong>{String(skills.length).padStart(2, "0")}</strong>
              <span>Skills</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="tpl-section" id="tpl-about">
        <span className="tpl-kicker">01 — ABOUT</span>
        <h2 className="tpl-h2">A little about me.</h2>
        <p className="tpl-about">
          {about || "Your About section will appear here."}
        </p>
      </section>

      {/* SKILLS */}
      <section className="tpl-section" id="tpl-skills">
        <span className="tpl-kicker">02 — SKILLS</span>
        <h2 className="tpl-h2">Tools &amp; technologies.</h2>

        {skills.length === 0 ? (
          <p className="tpl-empty">No skills added yet.</p>
        ) : (
          <div className="tpl-skills">
            {skills.map((skill) => (
              <span className="tpl-skill" key={skill}>
                <i className="tpl-skill-dot" />
                {skill}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* PROJECTS */}
      <section className="tpl-section" id="tpl-projects">
        <span className="tpl-kicker">03 — PROJECTS</span>
        <h2 className="tpl-h2">Selected work.</h2>

        {projects.length === 0 ? (
          <p className="tpl-empty">No projects added yet.</p>
        ) : (
          <div className="tpl-projects">
            {projects.map((project, index) => {
              const technologies = Array.isArray(project.technologies)
                ? project.technologies
                : [];
              const github = normalizeUrl(project.github);
              const live = normalizeUrl(project.live || project.demo);

              return (
                <article
                  className="tpl-project"
                  key={project.id || project._id || `${project.title}-${index}`}
                >
                  <span className="tpl-project-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3>{project.title || project.name || "Untitled project"}</h3>

                  {project.description && <p>{project.description}</p>}

                  {technologies.length > 0 && (
                    <div className="tpl-tags">
                      {technologies.map((technology, techIndex) => (
                        <span className="tpl-tag" key={`${technology}-${techIndex}`}>
                          {technology}
                        </span>
                      ))}
                    </div>
                  )}

                  {(github || live) && (
                    <div className="tpl-project-links">
                      {github && (
                        <a href={github} target="_blank" rel="noreferrer">
                          GitHub ↗
                        </a>
                      )}
                      {live && (
                        <a href={live} target="_blank" rel="noreferrer">
                          Live Demo ↗
                        </a>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CONTACT */}
      <section className="tpl-section tpl-contact" id="tpl-contact">
        <span className="tpl-kicker">04 — CONTACT</span>
        <h2 className="tpl-h2">Let's work together.</h2>

        <p>
          Have an opportunity or an idea in mind? I'd love to hear from you.
          {phone ? ` You can also call me at ${phone}.` : ""}
        </p>

        <div className="tpl-actions">
          {email && (
            <a className="tpl-btn tpl-btn-primary" href={`mailto:${email}`}>
              Get in touch
            </a>
          )}

          {socials.map((social) => (
            <a
              className="tpl-btn"
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
            >
              {social.label} ↗
            </a>
          ))}
        </div>
      </section>

      <footer className="tpl-footer">
        <span>
          © {year} {name}. All rights reserved.
        </span>
        <span>Built with PortGlow ✦</span>
      </footer>
    </div>
  );
}

export default PortfolioRenderer;

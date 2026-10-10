import { useEffect, useState } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import {

  UserRound,

  FileText,

  Code2,

  FolderKanban,

  Link2,

  Plus,

  Trash2,

  Pencil,

  X,

  ExternalLink,

} from "lucide-react";

const STORAGE_KEY = "portglowPortfolioContext";

const emptyProfile = {

  name: "",

  title: "",

  email: "",

  location: "",

  github: "",

  linkedin: "",

  phone: "",

  instagram: "",

};

const emptyProjectForm = {

  title: "",

  description: "",

  technologies: "",

  github: "",

  live: "",

};

function getSavedPortfolio() {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    const savedUser = localStorage.getItem("portglowPortfolioUser");

    const currentUser = localStorage.getItem("portglowUser");

    const userId = currentUser

      ? JSON.parse(currentUser)._id || JSON.parse(currentUser).id

      : null;

    if (!userId || savedUser !== String(userId)) {

      return {};

    }

    return saved ? JSON.parse(saved) : {};

  } catch {

    return {};

  }

}

function Builder() {

  const navigate = useNavigate();

  // Opens the floating Rosey chat (the rose button at the bottom right)
  const openRosey = () => {
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
  };

  const [activeSection, setActiveSection] = useState("profile");

  const [profile, setProfile] = useState(() => ({

    ...emptyProfile,

    ...(getSavedPortfolio().profile || {}),

  }));

  const [about, setAbout] = useState(

    () => getSavedPortfolio().about || ""

  );

  const [skills, setSkills] = useState(() => {

    const savedSkills = getSavedPortfolio().skills;

    return Array.isArray(savedSkills) ? savedSkills : [];

  });

  const [skillInput, setSkillInput] = useState("");

  const [projects, setProjects] = useState(() => {

    const savedProjects = getSavedPortfolio().projects;

    return Array.isArray(savedProjects) ? savedProjects : [];

  });

  const [projectForm, setProjectForm] = useState({

    ...emptyProjectForm,

  });

  const [editingProjectId, setEditingProjectId] = useState(null);

  const [isGeneratingAbout, setIsGeneratingAbout] = useState(false);

  const [aboutError, setAboutError] = useState("");

  const [projectError, setProjectError] = useState("");

  const [saveMessage, setSaveMessage] = useState("");

  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);

  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);

  const [isPublishing, setIsPublishing] = useState(false);

  const [isPublished, setIsPublished] = useState(false);

  const [publicUrl, setPublicUrl] = useState("");

  // =========================================

  // LOAD PORTFOLIO FROM MONGODB

  // =========================================

  useEffect(() => {

    let cancelled = false;

    const loadPortfolio = async () => {

      const token = localStorage.getItem("portglowToken");

      if (!token) {

        setIsLoadingPortfolio(false);

        return;

      }

      try {

        const response = await axios.get(

          "http://localhost:5000/api/portfolio",

          {

            headers: {

              Authorization: `Bearer ${token}`,

            },

          }

        );

        if (cancelled) return;

        const saved = response.data?.portfolio;

        const currentUser = JSON.parse(

  localStorage.getItem("portglowUser") || "{}"

);

const userId = currentUser._id || currentUser.id;

if (userId) {

  localStorage.setItem("portglowPortfolioUser", String(userId));

}

if (!saved) {

  setProfile({ ...emptyProfile });

  setAbout("");

  setSkills([]);

  setProjects([]);

  localStorage.setItem(

    STORAGE_KEY,

    JSON.stringify({

      profile: { ...emptyProfile },

      about: "",

      skills: [],

      projects: [],

    })

  );

  window.dispatchEvent(

    new Event("portglow-portfolio-updated")

  );

  setSaveMessage("Welcome! Create your new portfolio.");

  return;

}

        if (saved) {

          if (saved.isPublished && saved.slug) {
            setIsPublished(true);
            setPublicUrl(`${window.location.origin}/p/${saved.slug}`);
          }

          const loadedProfile = {

            ...emptyProfile,

            ...(saved.profile || {}),

          };

          const currentUser = JSON.parse(

  localStorage.getItem("portglowUser") || "{}"

);

const userId = currentUser._id || currentUser.id;

if (userId) {

  localStorage.setItem(

    "portglowPortfolioUser",

    String(userId)

  );

}

          const loadedProjects = (saved.projects || []).map(

            (project, index) => ({

              ...project,

              id:

                project.id ||

                project._id ||

                `saved-project-${index}-${Date.now()}`,

              title: project.title || project.name || "",

              live: project.live || project.demo || "",

              technologies: Array.isArray(project.technologies)

                ? project.technologies

                : [],

            })

          );

          const loadedSkills = Array.isArray(saved.skills)

            ? saved.skills

            : [];

          const loadedAbout = saved.about || "";

          setProfile(loadedProfile);

          setAbout(loadedAbout);

          setSkills(loadedSkills);

          setProjects(loadedProjects);

          localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify({

              profile: loadedProfile,

              about: loadedAbout,

              skills: loadedSkills,

              projects: loadedProjects,

            })

          );

          window.dispatchEvent(

            new Event("portglow-portfolio-updated")

          );

          setSaveMessage("Your saved portfolio has been loaded.");

        }

      } catch (error) {

        console.error("Portfolio loading error:", error);

        if (!cancelled) {

          if (error.response?.status === 401) {

            localStorage.removeItem("portglowToken");

            localStorage.removeItem("portglowUser");

            setSaveMessage(

              "Your session expired. Please log in again to load your portfolio."

            );

          } else {

            setSaveMessage(

              "Could not load your cloud portfolio. Your local draft is preserved."

            );

          }

        }

      } finally {

        if (!cancelled) {

          setIsLoadingPortfolio(false);

        }

      }

    };

    loadPortfolio();

    return () => {

      cancelled = true;

    };

  }, []);

  // =========================================

  // SAVE PORTFOLIO CONTEXT LOCALLY

  // =========================================

  useEffect(() => {

    try {

      localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify({

          profile,

          about,

          skills,

          projects,

        })

      );

      window.dispatchEvent(

        new Event("portglow-portfolio-updated")

      );

    } catch (error) {

      console.error("Could not save portfolio:", error);

    }

  }, [profile, about, skills, projects]);

  // =========================================

  // ROSEY → APPLY ABOUT

  // =========================================

  useEffect(() => {

    const handleRoseyApplyAbout = (event) => {

      if (

        typeof event.detail !== "string" ||

        !event.detail.trim()

      ) {

        return;

      }

      setAbout(event.detail);

      setActiveSection("about");

      setSaveMessage("Rosey applied your About section.");

    };

    window.addEventListener(

      "rosey-apply-about",

      handleRoseyApplyAbout

    );

    return () => {

      window.removeEventListener(

        "rosey-apply-about",

        handleRoseyApplyAbout

      );

    };

  }, []);

  // =========================================

  // ROSEY → APPLY SKILLS

  // =========================================

  useEffect(() => {

    const handleRoseyApplySkills = (event) => {

      if (!Array.isArray(event.detail)) {

        return;

      }

      setSkills((previousSkills) => {

        const mergedSkills = [...previousSkills];

        event.detail.forEach((skill) => {

          if (typeof skill !== "string") return;

          const trimmedSkill = skill.trim();

          if (!trimmedSkill) return;

          const exists = mergedSkills.some(

            (item) =>

              item.toLowerCase() === trimmedSkill.toLowerCase()

          );

          if (!exists) {

            mergedSkills.push(trimmedSkill);

          }

        });

        return mergedSkills;

      });

      setActiveSection("skills");

      setSaveMessage("Rosey applied your skills.");

    };

    window.addEventListener(

      "rosey-apply-skills",

      handleRoseyApplySkills

    );

    return () => {

      window.removeEventListener(

        "rosey-apply-skills",

        handleRoseyApplySkills

      );

    };

  }, []);

  // =========================================

  // ROSEY → APPLY PROJECT

  // =========================================

  useEffect(() => {

    const handleRoseyApplyProject = (event) => {

      const draft = event.detail;

      if (!draft || typeof draft !== "object") {

        setProjectError(

          "Rosey couldn't provide valid project details."

        );

        setActiveSection("projects");

        return;

      }

      const title = String(

        draft.title || draft.name || ""

      ).trim();

      if (!title) {

        setProjectError(

          "The generated project needs a project name."

        );

        setActiveSection("projects");

        return;

      }

      const technologies = Array.isArray(draft.technologies)

        ? draft.technologies

        : typeof draft.technologies === "string"

          ? draft.technologies.split(",")

          : [];

      const normalizedProject = {

        id: `${Date.now()}-${Math.random()}`,

        title,

        description:

          typeof draft.description === "string"

            ? draft.description.trim()

            : "",

        technologies: [

          ...new Set(

            technologies

              .filter(

                (technology) =>

                  typeof technology === "string"

              )

              .map((technology) => technology.trim())

              .filter(Boolean)

          ),

        ],

        github:

          typeof draft.github === "string"

            ? draft.github.trim()

            : "",

        live:

          typeof draft.live === "string"

            ? draft.live.trim()

            : typeof draft.demo === "string"

              ? draft.demo.trim()

              : "",

      };

      const alreadyExists = projects.some(

        (project) =>

          (project.title || project.name || "")

            .trim()

            .toLowerCase() === title.toLowerCase()

      );

      if (alreadyExists) {

        setProjectError(

          `A project named "${title}" already exists. You can edit it below.`

        );

        setActiveSection("projects");

        return;

      }

      setProjects((previousProjects) => [

        ...previousProjects,

        normalizedProject,

      ]);

      setProjectForm({ ...emptyProjectForm });

      setEditingProjectId(null);

      setProjectError("");

      setSaveMessage(`"${title}" was added to your projects.`);

      setActiveSection("projects");

    };

    window.addEventListener(

      "rosey-apply-project",

      handleRoseyApplyProject

    );

    return () => {

      window.removeEventListener(

        "rosey-apply-project",

        handleRoseyApplyProject

      );

    };

  }, [projects]);

  // =========================================

  // PROFILE

  // =========================================

  const handleChange = (event) => {

    const { name, value } = event.target;

    setProfile((previousProfile) => ({

      ...previousProfile,

      [name]: value,

    }));

    setSaveMessage("");

  };

  // =========================================

  // ABOUT GENERATION

  // =========================================

  const generateAbout = async () => {

    setIsGeneratingAbout(true);

    setAboutError("");

    try {

      const response = await axios.post(

        "http://localhost:5000/api/ai/generate-about",

        {

          profile,

          about,

        }

      );

      if (!response.data.about) {

        throw new Error("Rosey returned an empty response.");

      }

      setAbout(response.data.about);

      setSaveMessage("About section generated successfully.");

    } catch (error) {

      console.error("Rosey About error:", error);

      setAboutError(

        "Rosey couldn't generate your About section. Please check the backend and try again."

      );

    } finally {

      setIsGeneratingAbout(false);

    }

  };

  // =========================================

  // SKILLS

  // =========================================

  const addSkill = () => {

    const trimmedSkill = skillInput.trim();

    if (!trimmedSkill) return;

    const exists = skills.some(

      (skill) =>

        skill.toLowerCase() === trimmedSkill.toLowerCase()

    );

    if (exists) {

      setSkillInput("");

      return;

    }

    setSkills((previousSkills) => [

      ...previousSkills,

      trimmedSkill,

    ]);

    setSkillInput("");

    setSaveMessage("");

  };

  const removeSkill = (skillToRemove) => {

    setSkills((previousSkills) =>

      previousSkills.filter(

        (skill) => skill !== skillToRemove

      )

    );

    setSaveMessage("");

  };

  // =========================================

  // PROJECT FORM

  // =========================================

  const handleProjectChange = (event) => {

    const { name, value } = event.target;

    setProjectForm((previousForm) => ({

      ...previousForm,

      [name]: value,

    }));

    setProjectError("");

    setSaveMessage("");

  };

  const resetProjectForm = () => {

    setProjectForm({ ...emptyProjectForm });

    setEditingProjectId(null);

    setProjectError("");

  };

  const addOrUpdateProject = (event) => {

    event.preventDefault();

    setProjectError("");

    const title = projectForm.title.trim();

    if (!title) {

      setProjectError("Please enter a project name.");

      return;

    }

    const duplicate = projects.some(

      (project) =>

        (project.title || project.name || "")

          .trim()

          .toLowerCase() === title.toLowerCase() &&

        project.id !== editingProjectId

    );

    if (duplicate) {

      setProjectError(

        "A project with this name already exists."

      );

      return;

    }

    const projectData = {

      id: editingProjectId ?? `${Date.now()}-${Math.random()}`,

      title,

      description: projectForm.description.trim(),

      technologies: [

        ...new Set(

          projectForm.technologies

            .split(",")

            .map((technology) => technology.trim())

            .filter(Boolean)

        ),

      ],

      github: projectForm.github.trim(),

      live: projectForm.live.trim(),

    };

    if (editingProjectId !== null) {

      setProjects((previousProjects) =>

        previousProjects.map((project) =>

          project.id === editingProjectId

            ? projectData

            : project

        )

      );

      setSaveMessage("Project updated successfully.");

    } else {

      setProjects((previousProjects) => [

        ...previousProjects,

        projectData,

      ]);

      setSaveMessage("Project added successfully.");

    }

    resetProjectForm();

  };

  const editProject = (project) => {

    setProjectForm({

      title: project.title || project.name || "",

      description: project.description || "",

      technologies: Array.isArray(project.technologies)

        ? project.technologies.join(", ")

        : typeof project.technologies === "string"

          ? project.technologies

          : "",

      github: project.github || "",

      live: project.live || project.demo || "",

    });

    setEditingProjectId(project.id);

    setProjectError("");

    setSaveMessage("");

    setActiveSection("projects");

  };

  const removeProject = (projectId) => {

    setProjects((previousProjects) =>

      previousProjects.filter(

        (project) => project.id !== projectId

      )

    );

    if (editingProjectId === projectId) {

      resetProjectForm();

    }

    setSaveMessage("Project removed.");

  };

  // =========================================

  // SAVE PORTFOLIO TO MONGODB

  // =========================================

  const savePortfolio = async () => {

    const token = localStorage.getItem("portglowToken");

    if (!token) {

      setSaveMessage(

        "Please log in before saving your portfolio to MongoDB."

      );

      return;

    }

    setIsSavingPortfolio(true);

    setSaveMessage("");

    const portfolioData = {

      profile,

      about,

      skills,

      projects: projects.map((project) => ({

        title: project.title || project.name || "",

        description: project.description || "",

        technologies: Array.isArray(project.technologies)

          ? project.technologies

          : [],

        github: project.github || "",

        live: project.live || project.demo || "",

      })),

    };

    try {

      await axios.put(

        "http://localhost:5000/api/portfolio",

        portfolioData,

        {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );

      const currentUser = JSON.parse(

  localStorage.getItem("portglowUser") || "{}"

);

const userId = currentUser._id || currentUser.id;

if (userId) {

  localStorage.setItem(

    "portglowPortfolioUser",

    String(userId)

  );

}

      localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify({

          ...portfolioData,

          projects: projects.map((project) => ({

            ...project,

            title: project.title || project.name || "",

            live: project.live || project.demo || "",

          })),

        })

      );

      window.dispatchEvent(

        new Event("portglow-portfolio-updated")

      );

      setSaveMessage("Portfolio saved successfully to MongoDB! ✨");

    return true;

    } catch (error) {

      console.error("Portfolio save error:", error);

      if (error.response?.status === 401) {

        setSaveMessage(

          "Your session expired. Please log in again."

        );

      } else {

        setSaveMessage(

          error.response?.data?.message ||

            "Could not save your portfolio to MongoDB. Please check that the backend is running."

        );

      }

      return false;

    } finally {

      setIsSavingPortfolio(false);

    }

  };

  // =========================================

  // =========================================

  // PUBLISH / UNPUBLISH PORTFOLIO

  // =========================================

  const handlePublish = async () => {

    const token = localStorage.getItem("portglowToken");

    if (!token) {

      setSaveMessage("Please log in before publishing your portfolio.");

      return;

    }

    setIsPublishing(true);

    setSaveMessage("");

    try {

      const saved = await savePortfolio();

      if (!saved) return;

      const response = await axios.post(

        "http://localhost:5000/api/portfolio/publish",

        {},

        { headers: { Authorization: `Bearer ${token}` } }

      );

      const url =

        response.data?.publicUrl ||

        (response.data?.slug

          ? `${window.location.origin}/p/${response.data.slug}`

          : "");

      if (!url) throw new Error("The server did not return a public portfolio URL.");

      setPublicUrl(url);

      setIsPublished(true);

      setSaveMessage("Your portfolio is published! ✨");

    } catch (error) {

      console.error("Portfolio publish error:", error);

      setSaveMessage(

        error.response?.data?.message ||

          error.message ||

          "Could not publish. Check that the publishing routes exist in the backend."

      );

    } finally {

      setIsPublishing(false);

    }

  };

  const handleUnpublish = async () => {

    const token = localStorage.getItem("portglowToken");

    if (!token) {

      setSaveMessage("Please log in before unpublishing your portfolio.");

      return;

    }

    setIsPublishing(true);

    try {

      await axios.post(

        "http://localhost:5000/api/portfolio/unpublish",

        {},

        { headers: { Authorization: `Bearer ${token}` } }

      );

      setIsPublished(false);

      setPublicUrl("");

      setSaveMessage("Your portfolio is no longer public.");

    } catch (error) {

      console.error("Portfolio unpublish error:", error);

      setSaveMessage(

        error.response?.data?.message || "Could not unpublish your portfolio."

      );

    } finally {

      setIsPublishing(false);

    }

  };

  const copyPublicLink = async () => {

    if (!publicUrl) return;

    try {

      await navigator.clipboard.writeText(publicUrl);

      setSaveMessage("Public portfolio link copied! ✨");

    } catch {

      setSaveMessage(`Your public portfolio link: ${publicUrl}`);

    }

  };

// PREVIEW

  // =========================================

  const openPreview = () => {

    try {

      const portfolioData = {

        profile,

        about,

        skills,

        projects,

      };

      localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(portfolioData)

      );

      setSaveMessage("");

      window.dispatchEvent(

        new CustomEvent("portglow-preview", {

          detail: portfolioData,

        })

      );

    } catch (error) {

      console.error("Preview error:", error);

      setSaveMessage(

        "Could not prepare your preview. Please try again."

      );

    }

  };

  // =========================================

  // RENDER

  // =========================================

  return (

    <div className="builder-page">

      {/* HEADER */}

      <header className="builder-header">

        <div className="builder-logo">

          <span className="logo-icon">✦</span>

          <span>PortGlow</span>

        </div>

        <div className="builder-header-actions">

          <button

            type="button"

            className="builder-save-button"

            onClick={savePortfolio}

            disabled={isSavingPortfolio || isLoadingPortfolio}

          >

            {isLoadingPortfolio

              ? "Loading..."

              : isSavingPortfolio

                ? "Saving..."

                : "Save"}

          </button>

          <button

            type="button"

            className="builder-preview-button"

            onClick={openPreview}

          >

            Preview

          </button>

        <button

          type="button"

          className="builder-save-button"

          onClick={handlePublish}

          disabled={isPublishing || isSavingPortfolio || isLoadingPortfolio}

        >

          {isPublishing ? "Publishing..." : isPublished ? "Republish" : "Publish Portfolio"}

        </button>

        {isPublished && publicUrl && (

          <>

            <button

              type="button"

              className="builder-save-button"

              onClick={copyPublicLink}

            >

              Copy Link

            </button>

            <button

              type="button"

              className="builder-preview-button"

              onClick={() => window.open(publicUrl, "_blank", "noopener,noreferrer")}

            >

              View Live

            </button>

            <button

              type="button"

              className="builder-save-button"

              onClick={handleUnpublish}

              disabled={isPublishing}

            >

              Unpublish

            </button>

          </>

        )}

          <button
            type="button"
            className="builder-preview-button"
            onClick={() => {
              localStorage.removeItem("portglowToken");
              localStorage.removeItem("portglowUser");
              navigate("/login");
            }}
          >
            Logout
          </button>

        </div>

      </header>

      <div className="builder-layout">

        {/* SIDEBAR */}

        <aside className="builder-sidebar">

          <div className="sidebar-title">

            Build your portfolio

          </div>

          <div className="builder-menu">

            <button

              type="button"

              className={`builder-menu-item ${

                activeSection === "profile" ? "active" : ""

              }`}

              onClick={() => setActiveSection("profile")}

            >

              <span>

                <UserRound size={18} strokeWidth={1.8} />

              </span>

              Profile

            </button>

            <button

              type="button"

              className={`builder-menu-item ${

                activeSection === "about" ? "active" : ""

              }`}

              onClick={() => setActiveSection("about")}

            >

              <span>

                <FileText size={18} strokeWidth={1.8} />

              </span>

              About

            </button>

            <button

              type="button"

              className={`builder-menu-item ${

                activeSection === "skills" ? "active" : ""

              }`}

              onClick={() => setActiveSection("skills")}

            >

              <span>

                <Code2 size={18} strokeWidth={1.8} />

              </span>

              Skills

            </button>

            <button

              type="button"

              className={`builder-menu-item ${

                activeSection === "projects" ? "active" : ""

              }`}

              onClick={() => setActiveSection("projects")}

            >

              <span>

                <FolderKanban size={18} strokeWidth={1.8} />

              </span>

              Projects

            </button>

            <button

              type="button"

              className={`builder-menu-item ${

                activeSection === "links" ? "active" : ""

              }`}

              onClick={() => setActiveSection("links")}

            >

              <span>

                <Link2 size={18} strokeWidth={1.8} />

              </span>

              Links

            </button>

          </div>

          <div
            className="rosey-card"
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

            <div className="rosey-icon">🌹</div>

            <div>

              <h3>Meet Rosey</h3>

              <p>Your AI portfolio assistant.</p>

            </div>

          </div>

        </aside>

        {/* MAIN */}

        <main className="builder-main">

          <div className="builder-heading">

            <span className="builder-label">

              ✦ PORTFOLIO BUILDER

            </span>

            <h1>

              Tell us about

              <br />

              <span>yourself.</span>

            </h1>

            <p>

              Add your information and we'll help you turn it into a

              professional portfolio.

            </p>

          </div>

          {saveMessage && (

            <p role="status" className="builder-status-message">

              {saveMessage}

            </p>

          )}

          {/* PROFILE */}

          {activeSection === "profile" && (

            <section className="builder-card">

              <div className="builder-card-header">

                <div>

                  <h2>Personal information</h2>

                  <p>

                    This information will appear on your portfolio.

                  </p>

                </div>

              </div>

              <div className="builder-form">

                <div className="builder-form-group">

                  <label htmlFor="profile-name">Full Name</label>

                  <input

                    id="profile-name"

                    type="text"

                    name="name"

                    placeholder="e.g. Your Name"

                    value={profile.name}

                    onChange={handleChange}

                  />

                </div>

                <div className="builder-form-group">

                  <label htmlFor="profile-title">

                    Professional Title

                  </label>

                  <input

                    id="profile-title"

                    type="text"

                    name="title"

                    placeholder="e.g. Software Engineer"

                    value={profile.title}

                    onChange={handleChange}

                  />

                </div>

                <div className="builder-form-row">

                  <div className="builder-form-group">

                    <label htmlFor="profile-email">Email</label>

                    <input

                      id="profile-email"

                      type="email"

                      name="email"

                      placeholder="you@example.com"

                      value={profile.email}

                      onChange={handleChange}

                    />

                  </div>

                  <div className="builder-form-group">

                    <label htmlFor="profile-location">

                      Location

                    </label>

                    <input

                      id="profile-location"

                      type="text"

                      name="location"

                      placeholder="e.g. Hyderabad, India"

                      value={profile.location}

                      onChange={handleChange}

                    />

                  </div>

                </div>

                <div className="builder-form-row">

                  <div className="builder-form-group">

                    <label htmlFor="profile-github">GitHub</label>

                    <input

                      id="profile-github"

                      type="url"

                      name="github"

                      placeholder="https://github.com/username"

                      value={profile.github}

                      onChange={handleChange}

                    />

                  </div>

                  <div className="builder-form-group">

                    <label htmlFor="profile-linkedin">

                      LinkedIn

                    </label>

                    <input

                      id="profile-linkedin"

                      type="url"

                      name="linkedin"

                      placeholder="https://linkedin.com/in/username"

                      value={profile.linkedin}

                      onChange={handleChange}

                    />

                  </div>

                </div>

                <div className="builder-form-row">
                  <div className="builder-form-group">
                    <label htmlFor="profile-phone">Phone Number</label>
                    <input
                      id="profile-phone"
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={profile.phone || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="builder-form-group">
                    <label htmlFor="profile-instagram">Instagram URL</label>
                    <input
                      id="profile-instagram"
                      type="text"
                      name="instagram"
                      placeholder="https://instagram.com/username"
                      value={profile.instagram || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="builder-continue-button"
                  onClick={() => setActiveSection("about")}

                >

                  Continue <span>→</span>

                </button>

              </div>

            </section>

          )}

          {/* ABOUT */}

          {activeSection === "about" && (

            <section className="builder-card">

              <div className="builder-card-header">

                <div>

                  <h2>About Me</h2>

                  <p>

                    Tell visitors who you are, what you do, and what

                    you're passionate about.

                  </p>

                </div>

              </div>

              <div className="builder-form">

                <div className="builder-form-group">

                  <label htmlFor="builder-about">Your About</label>

                  <textarea

                    id="builder-about"

                    className="builder-textarea"

                    placeholder="Tell us about yourself, your interests, and career goals..."

                    value={about}

                    onChange={(event) => {

                      setAbout(event.target.value);

                      setAboutError("");

                    }}

                    rows={8}

                  />

                </div>

                {aboutError && (

                  <p role="alert" className="builder-error-message">

                    {aboutError}

                  </p>

                )}

                <div className="rosey-ai-box">

                  <div className="rosey-ai-icon">🌹</div>

                  <div className="rosey-ai-content">

                    <h3>Let Rosey write it for you</h3>

                    <p>

                      Rosey can help create a professional About

                      section from your information.

                    </p>

                  </div>

                  <button

                    type="button"

                    className="rosey-generate-button"

                    onClick={generateAbout}

                    disabled={isGeneratingAbout}

                  >

                    {isGeneratingAbout

                      ? "Rosey is thinking..."

                      : "Generate with Rosey"}

                    <span>✦</span>

                  </button>

                </div>

                <button

                  type="button"

                  className="builder-continue-button"

                  onClick={() => setActiveSection("skills")}

                >

                  Continue <span>→</span>

                </button>

              </div>

            </section>

          )}

          {/* SKILLS */}

          {activeSection === "skills" && (

            <section className="builder-card">

              <div className="builder-card-header">

                <div>

                  <h2>Skills</h2>

                  <p>

                    Add the technologies and skills you want to

                    showcase on your portfolio.

                  </p>

                </div>

              </div>

              <div className="builder-form">

                <div className="builder-form-group">

                  <label htmlFor="skill-input">Your Skills</label>

                  <div className="skills-input-row">

                    <input

                      id="skill-input"

                      type="text"

                      placeholder="e.g. Java, React, Node.js"

                      value={skillInput}

                      onChange={(event) =>

                        setSkillInput(event.target.value)

                      }

                      onKeyDown={(event) => {

                        if (event.key === "Enter") {

                          event.preventDefault();

                          addSkill();

                        }

                      }}

                    />

                    <button

                      type="button"

                      className="skills-add-button"

                      onClick={addSkill}

                    >

                      Add

                    </button>

                  </div>

                  <div className="skills-list">

                    {skills.length === 0 ? (

                      <p className="skills-empty">

                        No skills added yet.

                      </p>

                    ) : (

                      skills.map((skill) => (

                        <div className="skill-tag" key={skill}>

                          <span>{skill}</span>

                          <button

                            type="button"

                            onClick={() => removeSkill(skill)}

                            aria-label={`Remove ${skill}`}

                          >

                            ×

                          </button>

                        </div>

                      ))

                    )}

                  </div>

                </div>

                <button

                  type="button"

                  className="builder-continue-button"

                  onClick={() => setActiveSection("projects")}

                >

                  Continue <span>→</span>

                </button>

              </div>

            </section>

          )}

          {/* PROJECTS */}

          {activeSection === "projects" && (

            <section className="builder-card">

              <div className="builder-card-header">

                <div>

                  <h2>My Projects</h2>

                  <p>

                    Showcase your work, technologies, and project links.

                  </p>

                </div>

              </div>

              <form

                className="builder-form"

                onSubmit={addOrUpdateProject}

              >

                <div className="builder-form-group">

                  <label htmlFor="project-title">

                    Project Name *

                  </label>

                  <input

                    id="project-title"

                    type="text"

                    name="title"

                    placeholder="e.g. Wanderlust"

                    value={projectForm.title}

                    onChange={handleProjectChange}

                    required

                  />

                </div>

                <div className="builder-form-group">

                  <label htmlFor="project-description">

                    Description

                  </label>

                  <textarea

                    id="project-description"

                    className="builder-textarea"

                    name="description"

                    placeholder="What does your project do?"

                    value={projectForm.description}

                    onChange={handleProjectChange}

                    rows={4}

                  />

                </div>

                <div className="builder-form-group">

                  <label htmlFor="project-technologies">

                    Technologies

                  </label>

                  <input

                    id="project-technologies"

                    type="text"

                    name="technologies"

                    placeholder="React, Node.js, MongoDB"

                    value={projectForm.technologies}

                    onChange={handleProjectChange}

                  />

                  <p>Separate technologies with commas.</p>

                </div>

                <div className="builder-form-group">

                  <label htmlFor="project-github">

                    GitHub URL

                  </label>

                  <input

                    id="project-github"

                    type="url"

                    name="github"

                    placeholder="https://github.com/username/project"

                    value={projectForm.github}

                    onChange={handleProjectChange}

                  />

                </div>

                <div className="builder-form-group">

                  <label htmlFor="project-live">

                    Live Demo URL

                  </label>

                  <input

                    id="project-live"

                    type="url"

                    name="live"

                    placeholder="https://your-project.example.com"

                    value={projectForm.live}

                    onChange={handleProjectChange}

                  />

                </div>

                {projectError && (

                  <p role="alert" className="builder-error-message">

                    {projectError}

                  </p>

                )}

                <div className="project-form-actions">

                  <button

                    type="submit"

                    className="builder-continue-button"

                  >

                    {editingProjectId !== null ? (

                      <>

                        Save Changes <span>✓</span>

                      </>

                    ) : (

                      <>

                        <Plus size={17} /> Add Project

                      </>

                    )}

                  </button>

                  {editingProjectId !== null && (

                    <button

                      type="button"

                      className="project-cancel-button"

                      onClick={resetProjectForm}

                    >

                      <X size={16} /> Cancel

                    </button>

                  )}

                </div>

              </form>

              <div className="projects-list">

                <div className="projects-list-heading">

                  <h3>Your projects</h3>

                  <span>{projects.length} added</span>

                </div>

                {projects.length === 0 ? (

                  <p className="skills-empty">

                    No projects added yet. Add your first project

                    using the form above.

                  </p>

                ) : (

                  projects.map((project) => (

                    <article

                      className="project-item"

                      key={project.id}

                    >

                      <div className="project-item-header">

                        <h3>{project.title}</h3>

                        <div className="project-item-actions">

                          <button

                            type="button"

                            onClick={() => editProject(project)}

                            aria-label={`Edit ${project.title}`}

                            title="Edit project"

                          >

                            <Pencil size={16} />

                          </button>

                          <button

                            type="button"

                            onClick={() =>

                              removeProject(project.id)

                            }

                            aria-label={`Remove ${project.title}`}

                            title="Remove project"

                          >

                            <Trash2 size={16} />

                          </button>

                        </div>

                      </div>

                      {project.description && (

                        <p className="project-description">

                          {project.description}

                        </p>

                      )}

                      {Array.isArray(project.technologies) &&

                        project.technologies.length > 0 && (

                          <div className="skills-list">

                            {project.technologies.map(

                              (technology, index) => (

                                <span

                                  className="skill-tag"

                                  key={`${technology}-${index}`}

                                >

                                  {technology}

                                </span>

                              )

                            )}

                          </div>

                        )}

                      <div className="project-links">

                        {project.github && (

                          <a

                            href={project.github}

                            target="_blank"

                            rel="noreferrer"

                          >

                            GitHub <ExternalLink size={14} />

                          </a>

                        )}

                        {project.live && (

                          <a

                            href={project.live}

                            target="_blank"

                            rel="noreferrer"

                          >

                            Live Demo <ExternalLink size={14} />

                          </a>

                        )}

                      </div>

                    </article>

                  ))

                )}

              </div>

              <button

                type="button"

                className="builder-continue-button"

                onClick={() => setActiveSection("links")}

              >

                Continue to Links <span>→</span>

              </button>

            </section>

          )}

          {/* LINKS */}

          {activeSection === "links" && (

            <section className="builder-card">

              <div className="builder-card-header">

                <div>

                  <h2>Social Links</h2>

                  <p>

                    Manage your GitHub and LinkedIn links in the

                    Profile section.

                  </p>

                </div>

              </div>

              <div className="builder-form">

                <div className="builder-form-group">

                  <label htmlFor="links-github">GitHub</label>

                  <input

                    id="links-github"

                    type="url"

                    value={profile.github}

                    onChange={(event) =>

                      setProfile((previousProfile) => ({

                        ...previousProfile,

                        github: event.target.value,

                      }))

                    }

                    placeholder="https://github.com/username"

                  />

                </div>

                <div className="builder-form-group">

                  <label htmlFor="links-linkedin">LinkedIn</label>

                  <input

                    id="links-linkedin"

                    type="url"

                    value={profile.linkedin}

                    onChange={(event) =>

                      setProfile((previousProfile) => ({

                        ...previousProfile,

                        linkedin: event.target.value,

                      }))

                    }

                    placeholder="https://linkedin.com/in/username"

                  />

                </div>

                <button

                  type="button"

                  className="builder-save-button"

                  onClick={savePortfolio}

                  disabled={isSavingPortfolio || isLoadingPortfolio}

                >

                  {isLoadingPortfolio

                    ? "Loading..."

                    : isSavingPortfolio

                      ? "Saving..."

                      : "Save Portfolio"}

                </button>

              </div>

            </section>

          )}

        </main>

      </div>

    </div>

  );

}

export default Builder;


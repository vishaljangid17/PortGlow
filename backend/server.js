const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const User = require("./models/User");
const Portfolio = require("./models/Portfolio");

const app = express();
const PORT = process.env.PORT || 5000;

// =========================================
// GEMINI SETUP
// =========================================

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// =========================================
// MONGODB CONNECTION
// =========================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully âœ…"))
  .catch((error) =>
    console.error("MongoDB connection failed âŒ", error.message)
  );

// =========================================
// HELPERS
// =========================================

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createSlug(value) {
  return (
    String(value || "my-portfolio")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "my-portfolio"
  );
}

async function createUniqueSlug(name, portfolioId) {
  const baseSlug = createSlug(name);
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await Portfolio.findOne({ slug });

    if (
      !existing ||
      existing._id.toString() === portfolioId.toString()
    ) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

function signUserToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from backend/.env");
  }

  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authenticateToken(req, res, next) {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "Authentication is not configured on the server.",
    });
  }

  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      message: "Please log in to access your portfolio.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId || !mongoose.isValidObjectId(decoded.userId)) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({
      message: "Your session is invalid or expired. Please log in again.",
    });
  }
}

async function generateWithGemini(prompt) {
  if (!gemini) {
    throw new Error("GEMINI_API_KEY is missing from backend/.env");
  }

  try {
    return await gemini.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });
  } catch (primaryError) {
    console.error("Primary Gemini model failed:", primaryError.message);
    console.log("Trying fallback Gemini model...");

    return await gemini.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });
  }
}

function parseJsonResponse(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Gemini returned an empty response.");
  }

  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("Gemini returned invalid JSON.");
  }
}

function issueAuthResponse(res, user, statusCode, message) {
  const token = signUserToken(user._id);

  return res.status(statusCode).json({
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
}

function normalizeProfile(profile) {
  const fields = [
    "name",
    "title",
    "email",
    "location",
    "github",
    "linkedin",
    "phone",
    "instagram",
  ];

  const result = {};

  for (const field of fields) {
    if (profile[field] !== undefined) {
      if (typeof profile[field] !== "string") {
        throw new Error(`Profile field "${field}" must be a string.`);
      }

      result[field] = profile[field].trim();
    }
  }

  return result;
}

function normalizeProjects(projects) {
  if (!Array.isArray(projects)) {
    throw new Error("Projects must be an array.");
  }

  return projects.map((project) => {
    if (!project || typeof project !== "object" || Array.isArray(project)) {
      throw new Error("Each project must be an object.");
    }

    const title = normalizeString(project.title || project.name);

    if (!title) {
      throw new Error("Each project must have a title.");
    }

    const technologies = Array.isArray(project.technologies)
      ? project.technologies
      : typeof project.technologies === "string"
        ? project.technologies.split(",")
        : [];

    if (!technologies.every((item) => typeof item === "string")) {
      throw new Error("Project technologies must be strings.");
    }

    return {
      title,
      description: normalizeString(project.description),
      technologies: [
        ...new Set(technologies.map((item) => item.trim()).filter(Boolean)),
      ],
      github: normalizeString(project.github),
      live: normalizeString(project.live || project.demo),
    };
  });
}

// =========================================
// ROOT TEST ROUTE
// =========================================

app.get("/", (req, res) => {
  res.send("PortGlow Backend is running ðŸš€");
});

// =========================================
// REGISTER
// =========================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return issueAuthResponse(
      res,
      user,
      201,
      "Account created successfully."
    );
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      message: "Server error during registration.",
    });
  }
});

// =========================================
// LOGIN
// =========================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    return issueAuthResponse(res, user, 200, "Login successful.");
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Server error during login.",
    });
  }
});
// =========================================
// PORTFOLIO â€” LOAD CURRENT USER'S PORTFOLIO
// =========================================

app.get("/api/portfolio", authenticateToken, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      owner: req.userId,
    });

    return res.status(200).json({ portfolio });
  } catch (error) {
    console.error("Load portfolio error:", error.message);

    return res.status(500).json({
      message: "Could not load your portfolio.",
    });
  }
});

// =========================================
// PORTFOLIO â€” SAVE OR UPDATE
// =========================================

app.put("/api/portfolio", authenticateToken, async (req, res) => {
  try {
    const { profile, about, skills, projects, template } = req.body;
    const updates = {};

    if (profile !== undefined) {
      if (
        !profile ||
        typeof profile !== "object" ||
        Array.isArray(profile)
      ) {
        return res.status(400).json({
          message: "Profile must be an object.",
        });
      }

      updates.profile = normalizeProfile(profile);
    }

    if (about !== undefined) {
      if (typeof about !== "string") {
        return res.status(400).json({
          message: "About must be a string.",
        });
      }

      updates.about = about;
    }

    if (skills !== undefined) {
      if (
        !Array.isArray(skills) ||
        !skills.every((skill) => typeof skill === "string")
      ) {
        return res.status(400).json({
          message: "Skills must be an array of strings.",
        });
      }

      updates.skills = [
        ...new Set(skills.map((skill) => skill.trim()).filter(Boolean)),
      ];
    }

    if (projects !== undefined) {
      updates.projects = normalizeProjects(projects);
    }

    if (template !== undefined) {
      if (typeof template !== "string" || !template.trim()) {
        return res.status(400).json({
          message: "Template must be a non-empty string.",
        });
      }

      updates.template = template.trim();
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { owner: req.userId },
      {
        $set: updates,
        $setOnInsert: { owner: req.userId },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      message: "Portfolio saved successfully.",
      portfolio,
    });
  } catch (error) {
    console.error("Save portfolio error:", error.message);

    return res.status(400).json({
      message: error.message || "Could not save your portfolio.",
    });
  }
});

// =========================================
// PUBLISH PORTFOLIO
// =========================================

app.post(
  "/api/portfolio/publish",
  authenticateToken,
  async (req, res) => {
    try {
      const portfolio = await Portfolio.findOne({
        owner: req.userId,
      });

      if (!portfolio) {
        return res.status(404).json({
          message: "Save your portfolio before publishing it.",
        });
      }

      portfolio.slug = await createUniqueSlug(
        portfolio.profile?.name || "my-portfolio",
        portfolio._id
      );

      portfolio.isPublished = true;
      await portfolio.save();

      const frontendUrl = (
        process.env.FRONTEND_URL || "http://localhost:5173"
      ).replace(/\/+$/, "");

      return res.status(200).json({
        message: "Portfolio published successfully!",
        slug: portfolio.slug,
        publicUrl: `${frontendUrl}/p/${portfolio.slug}`,
        isPublished: true,
      });
    } catch (error) {
      console.error("Publish portfolio error:", error);

      return res.status(500).json({
        message: "Could not publish your portfolio.",
      });
    }
  }
);

// =========================================
// UNPUBLISH PORTFOLIO
// =========================================

app.post(
  "/api/portfolio/unpublish",
  authenticateToken,
  async (req, res) => {
    try {
      const portfolio = await Portfolio.findOne({
        owner: req.userId,
      });

      if (!portfolio) {
        return res.status(404).json({
          message: "Portfolio not found.",
        });
      }

      portfolio.isPublished = false;
      await portfolio.save();

      return res.status(200).json({
        message: "Portfolio unpublished successfully.",
        isPublished: false,
      });
    } catch (error) {
      console.error("Unpublish portfolio error:", error);

      return res.status(500).json({
        message: "Could not unpublish your portfolio.",
      });
    }
  }
);

// =========================================
// PUBLIC PORTFOLIO â€” FETCH BY SLUG
// =========================================

app.get("/api/public/portfolio/:slug", async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      slug: req.params.slug,
      isPublished: true,
    }).select("-owner -__v");

    if (!portfolio) {
      return res.status(404).json({
        message: "Published portfolio not found.",
      });
    }

    return res.status(200).json({ portfolio });
  } catch (error) {
    console.error("Public portfolio error:", error);

    return res.status(500).json({
      message: "Could not load the public portfolio.",
    });
  }
});
// =========================================
// ROSEY â€” ABOUT GENERATOR
// =========================================

app.post("/api/ai/generate-about", async (req, res) => {
  try {
    const { profile = {}, about = "" } = req.body;

    const prompt = `
You are Rosey, the AI portfolio assistant inside PortGlow.

Write a professional and natural About Me section for a developer portfolio.

Use ONLY the information provided below. Do not invent achievements,
experience, companies, skills, education, certifications, or projects.

PROFILE
Name: ${normalizeString(profile.name) || "Not provided"}
Professional title: ${normalizeString(profile.title) || "Not provided"}
Location: ${normalizeString(profile.location) || "Not provided"}
Email: ${normalizeString(profile.email) || "Not provided"}

Additional information provided by the user:
${normalizeString(about) || "No additional information provided."}

REQUIREMENTS
- Write in first person.
- Sound confident but natural.
- Keep it around 80-120 words.
- Make it suitable for a professional portfolio.
- Do not use headings or bullet points.
- Return only the About Me paragraph.
`;

    const response = await generateWithGemini(prompt);
    const generatedAbout = normalizeString(response.text);

    if (!generatedAbout) {
      throw new Error("Gemini returned an empty About section.");
    }

    return res.status(200).json({
      about: generatedAbout,
    });
  } catch (error) {
    console.error("Rosey About error:", error.message);

    return res.status(500).json({
      message:
        "Rosey could not generate your About section. Check the backend logs and Gemini API configuration.",
    });
  }
});
// =========================================
// ROSEY â€” CHAT ASSISTANT
// =========================================

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, portfolioContext = {} } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a message.",
      });
    }

    const profile = portfolioContext.profile || {};
    const about = normalizeString(portfolioContext.about);

    const skills = Array.isArray(portfolioContext.skills)
      ? portfolioContext.skills.filter(
          (skill) => typeof skill === "string"
        )
      : [];

    const projects = Array.isArray(portfolioContext.projects)
      ? portfolioContext.projects
      : [];

    const projectsText = projects
      .map((project, index) => {
        const technologies = Array.isArray(project.technologies)
          ? project.technologies.join(", ")
          : normalizeString(project.technologies);

        return `
${index + 1}. ${
          normalizeString(project.title) ||
          normalizeString(project.name) ||
          "Untitled project"
        }
Description: ${
          normalizeString(project.description) || "Not provided"
        }
Technologies: ${technologies || "Not provided"}
GitHub: ${normalizeString(project.github) || "Not provided"}
Live demo: ${
          normalizeString(project.live) ||
          normalizeString(project.liveDemo) ||
          "Not provided"
        }`;
      })
      .join("\n");

    const prompt = `
You are Rosey ðŸŒ¹, the friendly AI portfolio assistant inside PortGlow.

Help users create, improve, and manage professional portfolio content.
Be friendly, professional, encouraging, natural, and concise.

CURRENT PORTFOLIO

Profile:
Name: ${normalizeString(profile.name) || "Not provided"}
Professional title: ${normalizeString(profile.title) || "Not provided"}
Email: ${normalizeString(profile.email) || "Not provided"}
Location: ${normalizeString(profile.location) || "Not provided"}
GitHub: ${normalizeString(profile.github) || "Not provided"}
LinkedIn: ${normalizeString(profile.linkedin) || "Not provided"}

About:
${about || "Not provided"}

Current skills:
${skills.join(", ") || "Not provided"}

Current projects:
${projectsText || "No projects added yet."}

USER'S CURRENT MESSAGE:
${message.trim()}

IMPORTANT RULES

1. Use the user's portfolio information when relevant.
2. Never invent experience, achievements, employers, education,
   certifications, skills, technologies, URLs, metrics, or outcomes.
3. Improve wording only using details provided by the user.
4. For an About section explicitly requested by the user, use
   action type "apply_about" and put the complete paragraph in "reply".
5. Use "apply_skills" only when the user explicitly asks to add skills.
   Return only requested skills that are not already present.
6. When the user explicitly asks to create or add a project, use
   "apply_project" if a project title is available.
7. Project descriptions and technologies must be based on user-provided
   information. Do not invent URLs or project features.
8. Use empty strings for unknown project links.
9. If the project title is unclear, ask a follow-up question and use
   action type "none".
10. For advice or ordinary conversation, use action type "none".
11. Return ONLY valid JSON without Markdown fences.

NORMAL:
{"reply":"Your response to the user.","action":{"type":"none"}}

ABOUT:
{"reply":"The complete About paragraph.","action":{"type":"apply_about"}}

SKILLS:
{"reply":"Sure! Here are the requested skills to add.","action":{"type":"apply_skills","skills":["React","Node.js"]}}

PROJECT:
{"reply":"Here's a project draft. Review it before adding it.","action":{"type":"apply_project","project":{"title":"Project title","description":"A concise description based on provided details.","technologies":["Only provided technologies"],"github":"","live":""}}}
`;

    const response = await generateWithGemini(prompt);
    const aiResult = parseJsonResponse(response.text);

    const allowedActions = [
      "none",
      "apply_about",
      "apply_skills",
      "apply_project",
    ];

    let actionType = allowedActions.includes(aiResult?.action?.type)
      ? aiResult.action.type
      : "none";

    const actionSkills = Array.isArray(aiResult?.action?.skills)
      ? [
          ...new Set(
            aiResult.action.skills
              .filter((skill) => typeof skill === "string")
              .map((skill) => skill.trim())
              .filter(Boolean)
          ),
        ]
      : [];

    let actionProject = null;

    if (actionType === "apply_project") {
      const proposedProject = aiResult?.action?.project || {};

      const title = normalizeString(
        proposedProject.title || proposedProject.name
      );

      if (title) {
        const rawTechnologies = Array.isArray(
          proposedProject.technologies
        )
          ? proposedProject.technologies
          : typeof proposedProject.technologies === "string"
            ? proposedProject.technologies.split(",")
            : [];

        actionProject = {
          title,
          description: normalizeString(proposedProject.description),
          technologies: [
            ...new Set(
              rawTechnologies
                .filter((item) => typeof item === "string")
                .map((item) => item.trim())
                .filter(Boolean)
            ),
          ],
          github: normalizeString(proposedProject.github),
          live: normalizeString(
            proposedProject.live || proposedProject.demo
          ),
        };
      } else {
        actionType = "none";
      }
    }

    const reply =
      typeof aiResult?.reply === "string" && aiResult.reply.trim()
        ? aiResult.reply.trim()
        : "I'm here to help with your portfolio!";

    return res.status(200).json({
      reply,
      action: {
        type: actionType,
        skills: actionSkills,
        ...(actionProject ? { project: actionProject } : {}),
      },
    });
  } catch (error) {
    console.error("Rosey Chat error:", error.message);

    return res.status(500).json({
      message:
        "Rosey couldn't process your message. Check the backend terminal for details.",
    });
  }
});

// =========================================
// START SERVER
// =========================================

app.listen(PORT, () => {
  console.log(`PortGlow server running on http://localhost:${PORT}`);
});
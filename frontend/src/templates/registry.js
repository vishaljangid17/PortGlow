// =========================================
// PORTGLOW TEMPLATE REGISTRY
// Naya template add karna ho to bas yahan ek entry add karo
// (aur templates.css me uska theme block).
// Paid template ke liye: premium: true  -> Builder me ðŸ”’ lock ho jayega.
// =========================================

export const DEFAULT_TEMPLATE_ID = "aurora";

export const TEMPLATES = [
  {
    id: "aurora",
    name: "Aurora",
    tagline: "Soft lavender, elegant serif",
    premium: false,
    swatch: {
      bg: "#f8f7fc",
      thumbBg: "radial-gradient(circle at 80% 0%, #efe6ff 0, #f8f7fc 60%)",
      ink: "#211d2c",
      accent: "#8d78ff",
      accent2: "#d6ccff",
    },
  },
  {
    id: "minimal-dev",
    name: "Minimal Dev",
    tagline: "Clean, elegant, recruiter-friendly",
    premium: false,
    swatch: {
      bg: "#ffffff",
      thumbBg: "radial-gradient(circle at 78% 60%, #ececef 0, #ffffff 55%)",
      ink: "#0b0b0f",
      accent: "#0b0b0f",
      accent2: "#d9d9de",
    },
  },
  {
    id: "dark-pro",
    name: "Dark Pro",
    tagline: "Black, violet glow, bold visuals",
    premium: false,
    swatch: {
      bg: "#07060c",
      thumbBg:
        "radial-gradient(circle at 85% 15%, rgba(139,92,246,.55), #07060c 65%)",
      ink: "#ffffff",
      accent: "#8b5cf6",
      accent2: "#6366f1",
    },
  },
  {
    id: "noir-luxe",
    name: "Noir Luxe",
    tagline: "Luxury dark aesthetic",
    premium: false,
    swatch: {
      bg: "#0a0907",
      thumbBg:
        "radial-gradient(circle at 80% 25%, rgba(201,162,75,.3), #0a0907 65%)",
      ink: "#f4ead2",
      accent: "#c9a24b",
      accent2: "#8a6d2b",
    },
  },
  {
    id: "neon-studio",
    name: "Neon Studio",
    tagline: "Futuristic and expressive",
    premium: false,
    swatch: {
      bg: "#060818",
      thumbBg:
        "radial-gradient(circle at 85% 10%, rgba(232,121,249,.5), transparent 55%), radial-gradient(circle at 10% 90%, rgba(34,211,238,.4), #060818 65%)",
      ink: "#e6f7ff",
      accent: "#22d3ee",
      accent2: "#e879f9",
    },
  },
  {
    id: "executive-pro",
    name: "Executive Pro",
    tagline: "Leadership and experience",
    premium: false,
    swatch: {
      bg: "#140b24",
      thumbBg:
        "radial-gradient(circle at 80% 10%, rgba(167,139,250,.45), #140b24 65%)",
      ink: "#f5f1ff",
      accent: "#a78bfa",
      accent2: "#7c3aed",
    },
  },
  {
    id: "glass-elite",
    name: "Glass Elite",
    tagline: "Frosted-glass surfaces",
    premium: false,
    swatch: {
      bg: "#6d4de0",
      thumbBg:
        "radial-gradient(circle at 85% 10%, rgba(255,122,200,.7), transparent 55%), linear-gradient(135deg, #5b3cc4, #7c4dff 50%, #4f8cff)",
      ink: "#ffffff",
      accent: "#ffffff",
      accent2: "#bfd2ff",
    },
  },
  {
    id: "cinematic",
    name: "Cinematic",
    tagline: "Large visual hero, bold type",
    premium: false,
    swatch: {
      bg: "#e9e9e6",
      thumbBg: "linear-gradient(135deg, #f1f1ee, #dcdcd8)",
      ink: "#0a0a0a",
      accent: "#0a0a0a",
      accent2: "#7a7a78",
    },
  },
];

export function resolveTemplateId(id) {
  return TEMPLATES.some((template) => template.id === id)
    ? id
    : DEFAULT_TEMPLATE_ID;
}

export function getTemplate(id) {
  return TEMPLATES.find((template) => template.id === id) || TEMPLATES[0];
}
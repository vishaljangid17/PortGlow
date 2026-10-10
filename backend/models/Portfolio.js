
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    technologies: {
      type: [String],
      default: [],
    },
    github: {
      type: String,
      trim: true,
      default: "",
    },
    live: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const portfolioSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    profile: {
      name: {
        type: String,
        trim: true,
        default: "",
      },
      title: {
        type: String,
        trim: true,
        default: "",
      },
      email: {
        type: String,
        trim: true,
        default: "",
      },
      phone: {
        type: String,
        trim: true,
        default: "",
      },
      location: {
        type: String,
        trim: true,
        default: "",
      },
      github: {
        type: String,
        trim: true,
        default: "",
      },
      linkedin: {
        type: String,
        trim: true,
        default: "",
      },
      instagram: {
        type: String,
        trim: true,
        default: "",
      },
    },

    about: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    projects: {
      type: [projectSchema],
      default: [],
    },

    template: {
      type: String,
      default: "soft-editorial",
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Portfolio", portfolioSchema);

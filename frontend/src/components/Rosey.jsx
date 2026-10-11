import { useState } from "react";
import axios from "axios";
import { X, Send, ExternalLink, Sparkles } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function Rosey() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "rosey",
      text: "Hi! I'm Rosey 👋",
      type: null,
      skills: [],
      project: null,
    },
    {
      sender: "rosey",
      text: "I'm here to help you build a portfolio that makes your skills glow.",
      type: null,
      skills: [],
      project: null,
    },
    {
      sender: "rosey",
      text: "What would you like to work on?",
      type: null,
      skills: [],
      project: null,
    },
  ]);

  // Apply generated About text in the Builder.
  const applyAboutToBuilder = (aboutText) => {
    if (typeof aboutText !== "string" || !aboutText.trim()) return;

    window.dispatchEvent(
      new CustomEvent("rosey-apply-about", {
        detail: aboutText,
      })
    );
  };

  // Apply generated skills in the Builder.
  const applySkillsToBuilder = (skills) => {
    if (!Array.isArray(skills) || skills.length === 0) return;

    window.dispatchEvent(
      new CustomEvent("rosey-apply-skills", {
        detail: skills,
      })
    );
  };

  // Apply generated project details in the Builder.
  const applyProjectToBuilder = (project) => {
    if (!project || !project.title) return;

    window.dispatchEvent(
      new CustomEvent("rosey-apply-project", {
        detail: project,
      })
    );
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) return;

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        sender: "user",
        text: trimmedMessage,
        type: null,
        skills: [],
        project: null,
      },
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      let portfolioContext = {
        profile: {},
        about: "",
        skills: [],
        projects: [],
      };

      const savedContext = localStorage.getItem(
        "portglowPortfolioContext"
      );

      if (savedContext) {
        try {
          portfolioContext = {
            ...portfolioContext,
            ...JSON.parse(savedContext),
          };
        } catch (storageError) {
          console.warn(
            "Could not read saved portfolio context:",
            storageError
          );
        }
      }

      const response = await axios.post(
        `${API_URL}/api/ai/chat`,
        {
          message: trimmedMessage,
          portfolioContext,
        }
      );

      const actionType = response.data?.action?.type || "none";

      const actionSkills = Array.isArray(
        response.data?.action?.skills
      )
        ? response.data.action.skills
        : [];

      const actionProject =
        actionType === "apply_project" &&
        response.data?.action?.project &&
        typeof response.data.action.project === "object"
          ? response.data.action.project
          : null;

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "rosey",
          text: response.data?.reply || "I'm here to help!",
          type: actionType,
          skills: actionSkills,
          project: actionProject,
        },
      ]);
    } catch (error) {
      console.error("Rosey chat error:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "rosey",
          text:
            error.response?.data?.message ||
            "I couldn't connect just now. Please check that the PortGlow backend is running and try again.",
          type: null,
          skills: [],
          project: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        className="rosey-floating-button"
        onClick={() => setIsOpen(true)}
        aria-label="Open Rosey"
        type="button"
      >
        🌹
      </button>

      {isOpen && (
        <div className="rosey-chat">
          <div className="rosey-chat-header">
            <div className="rosey-chat-title">
              <div className="rosey-chat-avatar">🌹</div>

              <div>
                <h3>Rosey</h3>
                <span>Your AI portfolio assistant</span>
              </div>
            </div>

            <button
              className="rosey-close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Rosey"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <div className="rosey-chat-body">
            {messages.map((msg, index) => (
              <div
                key={`${msg.sender}-${index}`}
                className={
                  msg.sender === "user"
                    ? "rosey-user-message-row"
                    : "rosey-welcome-message"
                }
              >
                {msg.sender === "rosey" && (
                  <div className="rosey-message-avatar">🌹</div>
                )}

                <div
                  className={
                    msg.sender === "user"
                      ? "rosey-user-message"
                      : "rosey-message"
                  }
                >
                  <p>{msg.text}</p>

                  {msg.sender === "rosey" &&
                    msg.type === "apply_about" && (
                      <button
                        className="rosey-apply-button"
                        type="button"
                        onClick={() => applyAboutToBuilder(msg.text)}
                      >
                        Apply to About ✨
                      </button>
                    )}

                  {msg.sender === "rosey" &&
                    msg.type === "apply_skills" &&
                    msg.skills.length > 0 && (
                      <button
                        className="rosey-apply-button"
                        type="button"
                        onClick={() => applySkillsToBuilder(msg.skills)}
                      >
                        Apply to Skills ✨
                      </button>
                    )}

                  {msg.sender === "rosey" &&
                    msg.type === "apply_project" &&
                    msg.project && (
                      <div className="rosey-project-preview">
                        <div className="rosey-project-preview-heading">
                          <Sparkles size={17} />
                          <strong>{msg.project.title}</strong>
                        </div>

                        {msg.project.description && (
                          <p className="rosey-project-description">
                            {msg.project.description}
                          </p>
                        )}

                        {Array.isArray(msg.project.technologies) &&
                          msg.project.technologies.length > 0 && (
                            <div className="rosey-project-technologies">
                              {msg.project.technologies.map(
                                (technology, technologyIndex) => (
                                  <span
                                    key={`${technology}-${technologyIndex}`}
                                  >
                                    {technology}
                                  </span>
                                )
                              )}
                            </div>
                          )}

                        <div className="rosey-project-links">
                          {msg.project.github && (
                            <span>GitHub link provided</span>
                          )}

                          {msg.project.live && (
                            <span>
                              <ExternalLink size={14} />
                              Live demo provided
                            </span>
                          )}
                        </div>

                        <button
                          className="rosey-apply-button"
                          type="button"
                          onClick={() =>
                            applyProjectToBuilder(msg.project)
                          }
                        >
                          Apply to Project ✨
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="rosey-welcome-message">
                <div className="rosey-message-avatar">🌹</div>

                <div className="rosey-message rosey-loading-message">
                  <p>Rosey is thinking...</p>
                </div>
              </div>
            )}
          </div>

          <form
            className="rosey-chat-input-area"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              placeholder="Ask Rosey anything..."
              value={message}
              disabled={isLoading}
              onChange={(event) => setMessage(event.target.value)}
              aria-label="Message Rosey"
            />

            <button
              className="rosey-send-button"
              type="submit"
              disabled={isLoading || !message.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Rosey;


import { X, Mail, Phone, Instagram, Linkedin } from "lucide-react";

export default function ContactModal({ open, onClose, profile = {} }) {
  if (!open) return null;

  const email = profile.email || "YOUR_EMAIL@example.com";
  const phone = profile.phone || "YOUR_PHONE_NUMBER";
  const instagram = profile.instagram || "https://instagram.com/YOUR_USERNAME";
  const linkedin = profile.linkedin || "https://linkedin.com/in/YOUR_USERNAME";

  const contacts = [
    {
      label: "Email Me",
      detail: email,
      icon: Mail,
      href: `mailto:${email}`,
    },
    {
      label: "Call Me",
      detail: phone,
      icon: Phone,
      href: `tel:${phone}`,
    },
    {
      label: "Instagram",
      detail: "Connect on Instagram",
      icon: Instagram,
      href: instagram,
    },
    {
      label: "LinkedIn",
      detail: "Connect professionally",
      icon: Linkedin,
      href: linkedin,
    },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(28, 23, 42, 0.45)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          border: "1px solid #eee8ff",
          borderRadius: 24,
          padding: 28,
          color: "#211d2d",
          boxShadow: "0 24px 80px rgba(35, 25, 65, 0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <span style={{ color: "#8970ff", fontSize: 12, fontWeight: 800 }}>
              LET'S CONNECT
            </span>
            <h2 id="contact-title" style={{ margin: "8px 0" }}>
              Get in touch ✨
            </h2>
            <p style={{ color: "#777184", fontSize: 14 }}>
              Choose your preferred way to contact me.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close contact popup"
            style={{
              height: 38,
              width: 38,
              border: "1px solid #eee8ff",
              background: "#faf8ff",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "grid", gap: 12, marginTop: 24 }}>
          {contacts.map(({ label, detail, icon: Icon, href }) => {
            const placeholder =
              href.includes("YOUR_") ||
              href.includes("YOUR_EMAIL") ||
              href.includes("YOUR_PHONE");

            return (
              <a
                key={label}
                href={placeholder ? undefined : href}
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
                onClick={placeholder ? (event) => event.preventDefault() : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: 15,
                  border: "1px solid #eee8ff",
                  borderRadius: 16,
                  background: "#fff",
                  color: "#292437",
                  textDecoration: "none",
                  cursor: placeholder ? "default" : "pointer",
                }}
              >
                <span
                  style={{
                    width: 44,
                    height: 44,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 13,
                    background: "#f0ebff",
                    color: "#8065ff",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={21} />
                </span>

                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", fontSize: 14 }}>
                    {label}
                  </strong>
                  <span
                    style={{
                      display: "block",
                      marginTop: 4,
                      color: "#81798f",
                      fontSize: 12,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {detail}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}

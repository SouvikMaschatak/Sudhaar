// =============================================================
// InputField.jsx
// A reusable, accessible input component used by LoginForm.
//
// Props:
//   type         — "text" | "password" | "tel" etc.
//   placeholder  — placeholder string
//   value        — controlled value
//   onChange     — change handler
//   icon         — SVG/emoji rendered on the left side
//   rightAction  — optional node rendered on the right (e.g. Send OTP btn)
//   showToggle   — if true, adds an eye icon to toggle visibility
//   error        — optional error string shown below the input
// =============================================================

import { useState } from "react";

/* ---- Eye icons (no extra icon library needed) ---- */
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function InputField({
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  rightAction,
  showToggle = false,
  error,
}) {
  // Local state to toggle password/OTP visibility
  const [visible, setVisible] = useState(false);

  // Derive the actual <input> type based on toggle state
  const inputType = showToggle ? (visible ? "text" : "password") : type;

  // CSS classes for input — extra right padding when there's an action or toggle
  const inputClass = [
    "input-field",
    rightAction ? "has-action" : "",
    showToggle   ? "has-toggle" : "",
  ].filter(Boolean).join(" ");

  return (
    <div style={{ width: "100%" }}>
      {/* Wrapper positions the icons absolutely inside the field */}
      <div className="input-wrapper">

        {/* Left icon (user, lock, phone, etc.) */}
        {icon && <span className="input-icon">{icon}</span>}

        {/* The text/tel/password input */}
        <input
          className={inputClass}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Right-side slot: e.g. the "Send OTP" button */}
        {rightAction && rightAction}

        {/* Show / hide toggle for OTP / password fields */}
        {showToggle && (
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setVisible(v => !v)}
            aria-label={visible ? "Hide code" : "Show code"}
          >
            {visible ? <EyeOpen /> : <EyeClosed />}
          </button>
        )}
      </div>

      {/* Inline validation error message */}
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "./InputField";
import { municipalityLogin } from "../services/authService";
const PersonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const isValidCode     = (v) => v.trim().length >= 4;
const isValidPassword = (v) => v.trim().length >= 6;
const isEmpty = (v) => v.trim().length === 0;

export default function MunicipalityLogin() {
  const navigate = useNavigate();
  const [code,     setCode]     = useState("");
  const [password, setPassword] = useState("");
  const [errors,   setErrors]   = useState({});
  
  const handleLogin = async () => {
    const newErrors = {};
    if (isEmpty(code))
      newErrors.code = "Municipality ID is required.";
    if (!isValidPassword(password))
      newErrors.password = "Password must be at least 6 characters.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await municipalityLogin(code, password);
      navigate("/municipality/dashboard"); // create this page later
    } catch (err) {
      setErrors({ password: err.message });
    }
  };

  return (
    <div className="login-page">

      {/* ── Glass card — identical structure to LoginForm ── */}
      <div className="login-card">

        {/* Page title — clearly identifies this as the municipality portal */}
        <div className="profile-section">
          <h1 className="profile-name">Municipality</h1>
          <p style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "0.82rem",
            marginTop: "-0.5rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase"
          }}>
            Account Login
          </p>
        </div>

        <div className="login-form">

          {/* Field 1 — Municipality Code */}
          <InputField
            type="text"
            placeholder="Municipality Code"
            value={code}
            onChange={e => { setCode(e.target.value); setErrors(p => ({...p, code: ""})); }}
            icon={<PersonIcon />}
            error={errors.code}
          />

          {/* Field 2 — Password with show/hide toggle */}
          <InputField
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ""})); }}
            icon={<LockIcon />}
            showToggle={true}
            error={errors.password}
          />

          {/* Login button */}
          <button type="button" className="login-btn" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
      
      {/* Clicking this goes to /register — the new corporation registration page */}
      <button
        type="button"
        className="register-corp-btn"
        onClick={() => navigate("/register")}
      >
        Register New Municipal Corporation
      </button>

      <button className="municipality-link" onClick={() => navigate("/")} >
        ← Back to SUDHAAR
      </button>

    </div>
  );
}

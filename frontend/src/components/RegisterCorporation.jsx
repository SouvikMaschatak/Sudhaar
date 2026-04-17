import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "./InputField";
import { municipalitySignup } from "../services/authService";
const BuildingIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const HashIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9"  x2="20" y2="9"/>
    <line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8"  y2="21"/>
    <line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const FlagIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);
const MailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const isEmpty    = (v) => v.trim().length === 0;
const isEmail    = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isPhone    = (v) => /^\d{10}$/.test(v.trim());
const isPassword = (v) => v.trim().length >= 6;
export default function RegisterCorporation() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    corporationName: "",
    corporationCode: "",
    address:         "",
    state:           "",
    email:           "",
    phone:           "",
    password:        "",
  });
  const [errors,      setErrors]      = useState({});
  const [generatedId, setGeneratedId] = useState(null);
  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };
  const validate = () => {
    const e = {};
    if (isEmpty(form.corporationName)) e.corporationName = "Corporation name is required.";
    if (isEmpty(form.corporationCode)) e.corporationCode = "Corporation code is required.";
    if (isEmpty(form.address))         e.address         = "Address is required.";
    if (isEmpty(form.state))           e.state           = "State is required.";
    if (!isEmail(form.email))          e.email           = "Enter a valid email address.";
    if (!isPhone(form.phone))          e.phone           = "Enter a valid 10-digit phone number.";
    if (!isPassword(form.password))    e.password        = "Password must be at least 6 characters.";
    return e;
  };
  const handleRegister = async () => {
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      const result = await municipalitySignup(form);
      setGeneratedId(result.municipalityId); // show success card
    } catch (err) {
      setErrors({ name: err.message });
    }
  };
  return (
    <div className="login-page reg-page">
      {generatedId && (
        <div className="success-card">
          <p className="success-title">Registration Successful!</p>
          <p className="success-label">Your Municipality ID</p>
          <p className="success-id">{generatedId}</p>
          <p className="success-note">
            Save this ID — you need it to login.
          </p>
          <button
            type="button"
            className="login-btn"
            onClick={() => navigate("/municipality")}
          >
            Go to Login
          </button>
        </div>
      )}
      {!generatedId && (
        <div className="login-card reg-card">
          <div className="profile-section">
            <h1 className="profile-name">Register</h1>
            <p className="reg-subtitle">New Municipal Corporation</p>
          </div>
          <div className="login-form">

            <InputField type="text" placeholder="Corporation Name" value={form.corporationName} onChange={handleChange("corporationName")} icon={<BuildingIcon />} error={errors.corporationName} />

            <InputField type="text" placeholder="Corporation Code" value={form.corporationCode} onChange={handleChange("corporationCode")} icon={<HashIcon />} error={errors.corporationCode} />

            <InputField type="text" placeholder="Address" value={form.address} onChange={handleChange("address")} icon={<MapPinIcon />} error={errors.address}/>

            <InputField type="text" placeholder="State" value={form.state} onChange={handleChange("state")} icon={<FlagIcon />} error={errors.state}/>

            <InputField type="email" placeholder="Email Address" value={form.email} onChange={handleChange("email")} icon={<MailIcon />} error={errors.email}/>

            <InputField type="tel" placeholder="Phone Number" value={form.phone} onChange={handleChange("phone")} icon={<PhoneIcon />} error={errors.phone}/>

            <InputField type="password" placeholder="Password" value={form.password} onChange={handleChange("password")} icon={<LockIcon />} showToggle={true} error={errors.password}/>

            <button type="button" className="login-btn" onClick={handleRegister}>
              Register Corporation
            </button>
          </div>
        </div>
      )}
      {!generatedId && (
        <button className="municipality-link" onClick={() => navigate("/")}>
          ← Back to SUDHAAR
        </button>
      )}
    </div>
  );
}
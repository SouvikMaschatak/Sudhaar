import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "./InputField";
import { residentSignup } from "../services/authService";

/* ── Icons ── */
const PersonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

/* ── Validation ── */
const isEmpty  = (v) => v.trim().length === 0;
const isPhone  = (v) => /^\d{10}$/.test(v.trim());
const isPin    = (v) => /^\d{6}$/.test(v.trim());

export default function RegisterResident() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:    "",
    phone:   "",
    address: "",
    pin:     "",
  });

  const [errors,    setErrors]    = useState({});
  const [success,   setSuccess]   = useState(false);

  const handleChange = (field) => (e) => {
    let val = e.target.value;
    // Only allow digits for phone and pin
    if (field === "phone") val = val.replace(/\D/g, "").slice(0, 10);
    if (field === "pin")   val = val.replace(/\D/g, "").slice(0, 6);
    setForm(prev => ({ ...prev, [field]: val }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (isEmpty(form.name))    e.name    = "Name is required.";
    if (!isPhone(form.phone))  e.phone   = "Enter a valid 10-digit phone number.";
    if (isEmpty(form.address)) e.address = "Address is required.";
    if (!isPin(form.pin))      e.pin     = "PIN must be exactly 6 digits.";
    return e;
  };

  const handleRegister = async () => {
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await residentSignup(form.phone, form.pin, form.name, form.address);
      setSuccess(true);
    } catch (err) {
      setErrors({ phone: err.message });
    }
  };

  return (
    <div className="login-page">

      {/* ── Success card ── */}
      {success && (
        <div className="login-card">
          <div className="profile-section">
            <h1 className="profile-name">Welcome!</h1>
            <p className="reg-subtitle">Registration Successful</p>
          </div>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", textAlign: "center" }}>
            Your account has been created. You can now login with your phone number and PIN.
          </p>
          <button
            type="button"
            className="login-btn"
            style={{ marginTop: "0.5rem" }}
            onClick={() => navigate("/")}
          >
            Go to Login
          </button>
        </div>
      )}

      {/* ── Registration card ── */}
      {!success && (
        <div className="login-card">

          <div className="profile-section">
            <h1 className="profile-name">Register</h1>
            <p className="reg-subtitle">Resident Account</p>
          </div>

          <div className="login-form">

            {/* Name */}
            <InputField
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange("name")}
              icon={<PersonIcon />}
              error={errors.name}
            />

            {/* Phone */}
            <InputField
              type="tel"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange("phone")}
              icon={<PhoneIcon />}
              error={errors.phone}
            />

            {/* Address */}
            <InputField
              type="text"
              placeholder="Address"
              value={form.address}
              onChange={handleChange("address")}
              icon={<MapPinIcon />}
              error={errors.address}
            />

            {/* 6-digit PIN */}
            <InputField
              type="password"
              placeholder="6-digit PIN"
              value={form.pin}
              onChange={handleChange("pin")}
              icon={<LockIcon />}
              showToggle={true}
              error={errors.pin}
            />

            <button
              type="button"
              className="login-btn"
              onClick={handleRegister}
            >
              Create Account
            </button>

          </div>
        </div>
      )}

      {/* Back to login */}
      {!success && (
        <button
          className="municipality-link"
          onClick={() => navigate("/")}
        >
          ← Back to Login
        </button>
      )}

    </div>
  );
}
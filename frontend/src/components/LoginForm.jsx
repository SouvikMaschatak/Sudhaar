import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "./InputField";
import { residentLogin } from "../services/authService";
const PhoneIcon = () => (
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
const isValidPhone = (v) => /^\d{10}$/.test(v.trim());      // Validation — phone must be 10 digits
const isValidPin = (v) => /^\d{6}$/.test(v.trim());     // Validation — PIN must be exactly 6 digits
export default function LoginForm() {
  const navigate = useNavigate();
  const [phone,  setPhone]  = useState("");
  const [pin,    setPin]    = useState("");
  const [errors, setErrors] = useState({});
  const handleLogin = async () => {
    const newErrors = {};
    if (!isValidPhone(phone))
      newErrors.phone = "Enter a valid 10-digit mobile number.";
    if (!isValidPin(pin))
      newErrors.pin = "PIN must be exactly 6 digits.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      await residentLogin(phone, pin);
      localStorage.setItem("residentPhone", phone);
      navigate("/dashboard");
    } catch (err) {
      setErrors({ pin: err.message });
    }
  };
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="profile-section">
          <h1 className="profile-name">SUDHAAR</h1>
        </div>
        <div className="login-form">
          <InputField type="tel" placeholder="Phone Number" value={phone}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              setPhone(val);
              setErrors(prev => ({ ...prev, phone: "" }));
            }}
            icon={<PhoneIcon />}
            error={errors.phone}
          />
          <InputField type="password" placeholder="6-digit PIN" value={pin}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setPin(val);
              setErrors(prev => ({ ...prev, pin: "" }));
            }}
            icon={<LockIcon />}
            showToggle={true}
            error={errors.pin}
          />
          <button type="button" className="login-btn" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
      <button type="button" className="register-corp-btn" onClick={() => navigate("/register-resident")}>
        New Resident? Register Here
      </button>
      <button className="municipality-link" onClick={() => navigate("/municipality")}>
        Municipality account →
      </button>
    </div>
  );
}
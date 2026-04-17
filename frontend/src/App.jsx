import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/login.css";
import LoginForm from "./components/LoginForm";
import ResidentDashboard from "./components/ResidentDashboard";
import MunicipalityLogin from "./components/MunicipalityLogin";
import RegisterCorporation  from "./components/RegisterCorporation";
import RegisterResident from "./components/RegisterResident";
import MunicipalityDashboard from "./components/MunicipalityDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<LoginForm />} />
        <Route path="/municipality" element={<MunicipalityLogin />} />
        <Route path="/register"     element={<RegisterCorporation />} />
        <Route path="/register-resident" element={<RegisterResident />} />
        <Route path="/dashboard" element={<ResidentDashboard />} />
        <Route path="/municipality/dashboard" element={<MunicipalityDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
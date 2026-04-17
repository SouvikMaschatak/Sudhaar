// =============================================================
// MunicipalityDashboard.jsx
//
// Municipality dashboard — shows all complaints assigned to
// this municipality with ability to update status, department
// and add notes via a popup.
//
// Data flow:
//   Login → municipalityId saved to localStorage
//   Dashboard loads → fetches profile + complaints from MongoDB
//   Card click → opens detail popup
//   Save Changes → PUT /api/complaints/{id}/details
//                → auto-creates resident notification if status changed
// =============================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import MunicipalityComplaintCard from "./MunicipalityComplaintCard";
import { logout, getAccessToken, authFetch } from "../services/authService";

const FILTERS     = ["All", "Open", "Assigned", "In Progress", "Closed"];
const STATUSES    = ["Open", "Assigned", "In Progress", "Closed"];
const DEPARTMENTS = ["Water", "Sanitation", "Roads", "Electricity", "Parks"];

// ── Icons ─────────────────────────────────────────────────────
const PersonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────

export default function MunicipalityDashboard() {
  const navigate = useNavigate();

  // ── Redirect if not logged in ─────────────────────────────
  useEffect(() => {
    if (!getAccessToken()) navigate("/municipality");
  }, [navigate]);

  // ── Dark mode ─────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // ── Real data state ───────────────────────────────────────
  const [municipality, setMunicipality] = useState(null);
  const [complaints,   setComplaints]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  // ── Fetch profile + complaints on mount ───────────────────
  useEffect(() => {
    const municipalityId = localStorage.getItem("municipalityId");
    if (!municipalityId) { navigate("/municipality"); return; }

    const fetchAll = async () => {
      try {
        setLoading(true);
        const [profileData, complaintsData] = await Promise.all([
          authFetch(`/municipality/profile/${municipalityId}`),
          authFetch(`/complaints/municipality/${municipalityId}`),
        ]);
        setMunicipality(profileData);
        setComplaints(complaintsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [navigate]);

  // ── Profile popup ─────────────────────────────────────────
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Filter ────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredComplaints = activeFilter === "All"
    ? complaints
    : complaints.filter(c => c.status === activeFilter);

  // ── Stats ─────────────────────────────────────────────────
  const stats = {
    total:      complaints.length,
    open:       complaints.filter(c => c.status === "Open").length,
    inProgress: complaints.filter(c =>
                  c.status === "In Progress" || c.status === "Assigned").length,
    closed:     complaints.filter(c => c.status === "Closed").length,
  };

  // ── Detail popup state ────────────────────────────────────
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [popupStatus,       setPopupStatus]       = useState("");
  const [popupDept,         setPopupDept]         = useState("");
  const [popupNote,         setPopupNote]         = useState("");
  const [saving,            setSaving]            = useState(false);
  const [saveMsg,           setSaveMsg]           = useState("");

  // Open detail popup with selected complaint data
  const handleCardClick = (complaint) => {
    setSelectedComplaint(complaint);
    setPopupStatus(complaint.status     || "Open");
    setPopupDept(complaint.department   || "");
    setPopupNote(complaint.note         || "");
    setSaveMsg("");
  };

  const handleClosePopup = () => {
    setSelectedComplaint(null);
    setSaveMsg("");
  };

  // ── Save complaint changes ────────────────────────────────
  const handleSaveChanges = async () => {
    if (!selectedComplaint) return;
    setSaving(true);
    setSaveMsg("");

    try {
      await authFetch(`/complaints/${selectedComplaint.id}/details`, {
        method: "PUT",
        body: JSON.stringify({
          status:     popupStatus,
          department: popupDept,
          note:       popupNote,
        }),
      });

      // Update the complaint in local state so card refreshes immediately
      setComplaints(prev => prev.map(c =>
        c.id === selectedComplaint.id
          ? { ...c, status: popupStatus, department: popupDept, note: popupNote }
          : c
      ));

      setSaveMsg("✅ Changes saved successfully.");
      // Auto-close popup after 1.5 seconds
      setTimeout(() => handleClosePopup(), 1500);
    } catch (err) {
      setSaveMsg("❌ Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate("/municipality");
  };

  // ── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg-page)",
        color: "var(--text-secondary)", fontFamily: "var(--font)", fontSize: "1rem"
      }}>
        Loading dashboard...
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "var(--bg-page)", color: "var(--text-secondary)",
        fontFamily: "var(--font)", gap: "1rem"
      }}>
        <p>Failed to load: {error}</p>
        <button onClick={() => { logout(); navigate("/municipality"); }}
          style={{ padding: "0.5rem 1.5rem", borderRadius: "50px",
                   background: "#ef4444", color: "#fff", border: "none",
                   cursor: "pointer", fontFamily: "var(--font)" }}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ════════════════════════════════════════════════════
          NAVBAR — shows corporation name + municipality ID
          ════════════════════════════════════════════════════ */}
      <nav className="dash-navbar">
        {/* Left: logo + corporation info */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className="dash-navbar-logo">SUDHAAR</span>
          <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "1rem" }}>
            <div style={{
              fontSize: "0.88rem", fontWeight: "600",
              color: "var(--text-primary)", lineHeight: 1.2
            }}>
              {municipality?.corporationName}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              {municipality?.municipalityId}
            </div>
          </div>
        </div>

        {/* Right: dark mode + profile */}
        <div className="dash-navbar-actions">
          <button className="dash-theme-btn"
            onClick={() => setDarkMode(d => !d)} aria-label="Toggle dark mode">
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Profile popup */}
          <div className="dash-popup-wrapper" ref={profileRef}>
            <button
              className={`dash-icon-btn ${profileOpen ? "active" : ""}`}
              onClick={() => setProfileOpen(o => !o)}
              aria-label="Profile"
            >
              <PersonIcon />
            </button>

            <div className={`dash-popup ${profileOpen ? "open" : ""}`}>
              <div className="profile-popup-avatar">
                {municipality?.corporationName?.[0]?.toUpperCase() || "M"}
              </div>
              <div className="profile-popup-name">{municipality?.corporationName}</div>
              <div className="profile-popup-phone">{municipality?.municipalityId}</div>
              <hr className="profile-popup-divider" />
              <div className="profile-info-row">
                <span className="profile-info-label">Address</span>
                <span className="profile-info-value">{municipality?.address || "—"}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">State</span>
                <span className="profile-info-value">{municipality?.state || "—"}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{municipality?.email || "—"}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Phone</span>
                <span className="profile-info-value">{municipality?.phone || "—"}</span>
              </div>
              <button className="profile-popup-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

        </div>
      </nav>

      {/* ════════════════════════════════════════════════════
          MAIN CONTENT
          ════════════════════════════════════════════════════ */}
      <main className="dash-main">

        {/* Welcome */}
        <div className="dash-welcome">
          <h1>Complaints Dashboard 🏛️</h1>
          <p>Manage and resolve complaints assigned to your municipality.</p>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="stat-label">Total</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="dash-stat-card">
            <div className="stat-label">Open</div>
            <div className="stat-value" style={{ color: "var(--status-open)" }}>
              {stats.open}
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="stat-label">In Progress</div>
            <div className="stat-value" style={{ color: "var(--status-inprogress)" }}>
              {stats.inProgress}
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="stat-label">Closed</div>
            <div className="stat-value" style={{ color: "var(--status-closed)" }}>
              {stats.closed}
            </div>
          </div>
        </div>

        {/* Section header + filters */}
        <div className="dash-section-header">
          <span className="dash-section-title">All Complaints</span>
          <div className="dash-filter-tabs">
            {FILTERS.map(f => (
              <button key={f}
                className={`dash-filter-tab ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Complaint cards grid */}
        <div className="dash-complaints-grid">
          {filteredComplaints.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">📋</div>
              <p>{complaints.length === 0
                ? "No complaints assigned to your municipality yet."
                : "No complaints found for this filter."}</p>
            </div>
          ) : (
            // MunicipalityComplaintCard is the reusable function —
            // called once per complaint, same component every time
            filteredComplaints.map(complaint => (
              <MunicipalityComplaintCard
                key={complaint.id}
                complaint={complaint}
                onCardClick={handleCardClick}
              />
            ))
          )}
        </div>

      </main>

      {/* ════════════════════════════════════════════════════
          COMPLAINT DETAIL POPUP
          Opens when a card is clicked.
          Allows updating status, department, and note.
          ════════════════════════════════════════════════════ */}
      {selectedComplaint && (
        <>
          {/* Dark overlay */}
          <div onClick={handleClosePopup} style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 300,
          }} />

          {/* Popup card */}
          <div style={{
            position: "fixed",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(500px, 90vw)",
            maxHeight: "90vh",
            overflowY: "auto",
            background: "var(--bg-popup)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 301,
            padding: "1.5rem",
            fontFamily: "var(--font)",
          }}>

            {/* Popup header */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "1.25rem"
            }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                  #{selectedComplaint.complaintId}
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  {selectedComplaint.category}
                </div>
              </div>
              <button onClick={handleClosePopup} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-secondary)", display: "flex",
                padding: "0.25rem", borderRadius: "6px"
              }}>
                <CloseIcon />
              </button>
            </div>

            {/* Complaint details */}
            <div style={{
              background: "var(--bg-stat)", borderRadius: "var(--radius-sm)",
              padding: "1rem", marginBottom: "1.25rem",
              display: "flex", flexDirection: "column", gap: "0.5rem"
            }}>
              {[
                ["📍 Location",    selectedComplaint.location],
                ["📞 Resident",    selectedComplaint.residentPhone],
                ["📅 Raised on",   new Date(selectedComplaint.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })],
                ["📝 Description", selectedComplaint.description || "—"],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: "flex", gap: "0.5rem",
                  fontSize: "0.82rem", color: "var(--text-secondary)"
                }}>
                  <span style={{ minWidth: "100px", color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem",
              display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* Status dropdown */}
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)",
                  display: "block", marginBottom: "0.4rem" }}>
                  Status
                </label>
                <select value={popupStatus} onChange={e => setPopupStatus(e.target.value)}
                  style={{
                    width: "100%", padding: "0.6rem 1rem",
                    borderRadius: "50px", border: "1.5px solid var(--border)",
                    background: "var(--bg-card)", color: "var(--text-primary)",
                    fontFamily: "var(--font)", fontSize: "0.88rem", outline: "none",
                    cursor: "pointer"
                  }}>
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Department dropdown */}
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)",
                  display: "block", marginBottom: "0.4rem" }}>
                  Assign to Department
                </label>
                <select value={popupDept} onChange={e => setPopupDept(e.target.value)}
                  style={{
                    width: "100%", padding: "0.6rem 1rem",
                    borderRadius: "50px", border: "1.5px solid var(--border)",
                    background: "var(--bg-card)", color: "var(--text-primary)",
                    fontFamily: "var(--font)", fontSize: "0.88rem", outline: "none",
                    cursor: "pointer"
                  }}>
                  <option value="">— Select Department —</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Note textarea */}
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)",
                  display: "block", marginBottom: "0.4rem" }}>
                  Add Note
                </label>
                <textarea
                  value={popupNote}
                  onChange={e => setPopupNote(e.target.value)}
                  placeholder="Add an internal note or comment..."
                  rows={3}
                  style={{
                    width: "100%", padding: "0.75rem 1rem",
                    borderRadius: "12px", border: "1.5px solid var(--border)",
                    background: "var(--bg-card)", color: "var(--text-primary)",
                    fontFamily: "var(--font)", fontSize: "0.88rem",
                    outline: "none", resize: "vertical",
                  }}
                />
              </div>

              {/* Save message */}
              {saveMsg && (
                <p style={{ fontSize: "0.82rem", color: saveMsg.startsWith("✅")
                  ? "var(--status-closed)" : "#ef4444", textAlign: "center" }}>
                  {saveMsg}
                </p>
              )}

              {/* Save button */}
              <button onClick={handleSaveChanges} disabled={saving}
                style={{
                  width: "100%", padding: "0.8rem",
                  borderRadius: "50px", border: "none",
                  background: saving ? "var(--border)" : "var(--brand-blue)",
                  color: "#fff", fontFamily: "var(--font)",
                  fontSize: "0.95rem", fontWeight: "600",
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: "background 0.2s, transform 0.15s",
                }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>

            </div>
          </div>
        </>
      )}
    </>
  );
}

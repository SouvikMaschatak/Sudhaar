import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import ComplaintCard from "./ComplaintCard";
import { logout, getAccessToken, authFetch } from "../services/authService";
 
const FILTERS = ["All", "Open", "Assigned", "In Progress", "Closed"];
 
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
 
const PersonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
 
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
 
export default function ResidentDashboard() {
  const navigate = useNavigate();
   
  useEffect(() => {                                       //  Redirect if not logged in 
    if (!getAccessToken()) navigate("/");
  }, [navigate]);
 
  
  const [darkMode, setDarkMode] = useState(               // Dark mode 
    () => localStorage.getItem("darkMode") === "true"
  );
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);
 
  // ── Real data state (replaces all mock data) ──────────────
  const [resident,      setResident]      = useState(null);
  const [complaints,    setComplaints]    = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
 
  // ── Fetch all data on mount ───────────────────────────────
  useEffect(() => {
    const phone = localStorage.getItem("residentPhone");
    if (!phone) { navigate("/"); return; }
    const fetchAll = async () => {
      try {
        setLoading(true);
         // All three calls run in parallel for speed
        const [profileData, complaintsData, notificationsData] = await Promise.all([
          authFetch(`/api/resident/profile/${phone}`),
          authFetch(`/api/complaints/resident/${phone}`),
          authFetch(`/api/notifications/resident/${phone}`),
        ]);
         setResident(profileData);
        setComplaints(complaintsData);
        setNotifications(notificationsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [navigate]);
 
  // ── Popup state ───────────────────────────────────────────
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  // ── Click outside to close popups ────────────────────────
  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // ── Mark notification as read ─────────────────────────────
  const handleMarkRead = async (id) => {
    try {
      await authFetch(`/api/notifications/read/${id}`, { method: "PUT" });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };
  // ── Filter state ──────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState("All");
  const filteredComplaints = activeFilter === "All"
    ? complaints
    : complaints.filter(c => c.status === activeFilter);
   // ── Stats computed from real data ─────────────────────────
  const stats = {
    total:      complaints.length,
    open:       complaints.filter(c => c.status === "Open").length,
    inProgress: complaints.filter(c =>
                  c.status === "In Progress" || c.status === "Assigned").length,
    closed:     complaints.filter(c => c.status === "Closed").length,
  };
  const unreadCount = notifications.filter(n => !n.read).length;
  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  // ── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-page)",
        color: "var(--text-secondary)",
        fontFamily: "var(--font)",
        fontSize: "1rem"
      }}>
        Loading your dashboard...
      </div>
    );
  } 
  // ── Error state ───────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-page)",
        color: "var(--text-secondary)",
        fontFamily: "var(--font)",
        gap: "1rem"
      }}>
        <p>Failed to load dashboard: {error}</p>
        <button onClick={() => { logout(); navigate("/"); }}
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
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="dash-navbar">
        <span className="dash-navbar-logo">SUDHAAR</span>
        <div className="dash-navbar-actions">
          <button className="dash-theme-btn" onClick={() => setDarkMode(d => !d)} aria-label="Toggle dark mode">
            {darkMode ? "☀️" : "🌙"}
          </button>
          {/* Notification popup */}
          <div className="dash-popup-wrapper" ref={notifRef}>
            <button className={`dash-icon-btn ${notifOpen ? "active" : ""}`} onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }} aria-label="Notifications">
              <BellIcon />
              {unreadCount > 0 && <span className="dash-badge">{unreadCount}</span>}
            </button>
            <div className={`dash-popup ${notifOpen ? "open" : ""}`}>
              <div className="dash-popup-header">
                <span className="dash-popup-title">Notifications</span>
                <button onClick={() => setNotifOpen(false)}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-secondary)", display:"flex" }}>
                  <CloseIcon/>
                </button>
              </div>
              <div className="dash-popup-body">
                {notifications.length === 0 ? (
                  <div className="notif-empty">🔔 No notifications yet.</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="notif-item"
                      onClick={() => !notif.read && handleMarkRead(notif.id)}>
                      <div className={`notif-dot ${notif.read ? "read" : ""}`} />
                      <div className="notif-content">
                        <div className="notif-message">{notif.message}</div>
                        <div className="notif-time">
                          {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
 
          {/* Profile popup */}
          <div className="dash-popup-wrapper" ref={profileRef}>
            <button
              className={`dash-icon-btn ${profileOpen ? "active" : ""}`}
              onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
              aria-label="Profile"
            >
              <PersonIcon />
            </button>
 
            <div className={`dash-popup ${profileOpen ? "open" : ""}`}>
              <div className="profile-popup-avatar">
                {resident?.name?.[0]?.toUpperCase() || "R"}
              </div>
              <div className="profile-popup-name">{resident?.name}</div>
              <div className="profile-popup-phone">{resident?.phone}</div>
              <hr className="profile-popup-divider" />
              <div className="profile-info-row">
                <span className="profile-info-label">Phone</span>
                <span className="profile-info-value">{resident?.phone}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Address</span>
                <span className="profile-info-value">{resident?.address}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">Account</span>
                <span className="profile-info-value">Resident</span>
              </div>
              <button className="profile-popup-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
 
        </div>
      </nav>
 
      {/* ── Main content ───────────────────────────────────── */}
      <main className="dash-main">
 
        <div className="dash-welcome">
          <h1>Welcome, {resident?.name?.split(" ")[0] || "Resident"} 👋</h1>
          <p>Here's an overview of your complaints and updates.</p>
        </div>
 
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
 
        <div className="dash-section-header">
          <span className="dash-section-title">My Complaints</span>
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
 
        <div className="dash-complaints-grid">
          {filteredComplaints.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">📋</div>
              <p>{complaints.length === 0
                ? "You haven't raised any complaints yet."
                : "No complaints found for this filter."}</p>
            </div>
          ) : (
            filteredComplaints.map(complaint => (
              <ComplaintCard
                key={complaint.complaintId || complaint.id}
                complaint={complaint}
              />
            ))
          )}
        </div>
 
      </main>
    </>
  );
}
// =============================================================
// MunicipalityComplaintCard.jsx
// Reusable complaint card for the municipality dashboard.
//
// Props:
//   complaint  — complaint object from MongoDB
//   onCardClick — function called when card is clicked
//                 opens the detail popup with this complaint
//
// This single component is called for every complaint in the
// grid — same function, same card, different data each time.
// =============================================================

// Category icons
const CATEGORY_ICONS = {
  "Pothole":            "🕳️",
  "Broken Streetlight": "💡",
  "Garbage":            "🗑️",
  "Water Supply":       "💧",
  "Sewage":             "🚰",
  "Road Damage":        "🛣️",
};

// Status → CSS class + progress %
const STATUS_CONFIG = {
  "Open":        { cls: "open",        progress: 10 },
  "Assigned":    { cls: "assigned",    progress: 35 },
  "In Progress": { cls: "in-progress", progress: 65 },
  "Closed":      { cls: "closed",      progress: 100 },
};

export default function MunicipalityComplaintCard({ complaint, onCardClick }) {
  const {
    complaintId,
    category,
    location,
    residentPhone,
    description,
    status,
    createdAt,
    photoUrl,
    department,
  } = complaint;

  const icon   = CATEGORY_ICONS[category] || "📋";
  const config = STATUS_CONFIG[status]    || STATUS_CONFIG["Open"];

  const formattedDate = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="complaint-card" onClick={() => onCardClick(complaint)}>

      {/* Photo / emoji thumbnail */}
      <div className="complaint-card-photo">
        {photoUrl
          ? <img src={photoUrl} alt={category} />
          : <span style={{ fontSize: "3rem" }}>{icon}</span>
        }
      </div>

      <div className="complaint-card-body">

        {/* ID + status badge */}
        <div className="complaint-card-top">
          <span className="complaint-id">#{complaintId}</span>
          <span className={`status-badge ${config.cls}`}>{status}</span>
        </div>

        {/* Category */}
        <div className="complaint-category">{category}</div>

        {/* Meta info */}
        <div className="complaint-meta">
          <div className="complaint-meta-row">
            <span>📍</span><span>{location}</span>
          </div>
          <div className="complaint-meta-row">
            <span>📞</span><span>{residentPhone}</span>
          </div>
          <div className="complaint-meta-row">
            <span>📅</span><span>{formattedDate}</span>
          </div>
          {department && (
            <div className="complaint-meta-row">
              <span>🏢</span><span>{department}</span>
            </div>
          )}
        </div>

        {/* Description preview — truncated to 2 lines */}
        {description && (
          <p style={{
            fontSize: "0.78rem",
            color: "var(--text-secondary)",
            marginBottom: "0.75rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {description}
          </p>
        )}

        {/* Progress bar */}
        <div className="complaint-progress">
          <div className="complaint-progress-fill"
            style={{ width: `${config.progress}%` }} />
        </div>

      </div>
    </div>
  );
}

// =============================================================
// ComplaintCard.jsx
// Reusable card component for displaying a single complaint.
//
// Props:
//   complaint — object with all complaint fields
//
// This component is called once per complaint in the grid.
// All styling uses dashboard.css variables so dark mode works.
// =============================================================

// Maps each category to an emoji icon
const CATEGORY_ICONS = {
  "Pothole":           "🕳️",
  "Broken Streetlight":"💡",
  "Garbage":           "🗑️",
  "Water Supply":      "💧",
  "Sewage":            "🚰",
  "Road Damage":       "🛣️",
};

// Maps status to CSS class and progress bar width
const STATUS_CONFIG = {
  "Open":        { cls: "open",        progress: 10 },
  "Assigned":    { cls: "assigned",    progress: 35 },
  "In Progress": { cls: "in-progress", progress: 65 },
  "Closed":      { cls: "closed",      progress: 100 },
};

export default function ComplaintCard({ complaint }) {
  const {
    complaintId,
    category,
    location,
    municipalityId,
    status,
    createdAt,
    photoUrl,
  } = complaint;

  const icon   = CATEGORY_ICONS[category] || "📋";
  const config = STATUS_CONFIG[status]    || STATUS_CONFIG["Open"];

  // Format date nicely e.g. "15 Mar 2026"
  const formattedDate = new Date(createdAt).toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });

  return (
    <div className="complaint-card">

      {/* Photo thumbnail — shows emoji placeholder if no photo */}
      <div className="complaint-card-photo">
        {photoUrl
          ? <img src={photoUrl} alt={category} />
          : <span style={{ fontSize: "3rem" }}>{icon}</span>
        }
      </div>

      <div className="complaint-card-body">

        {/* Top row: complaint ID + status badge */}
        <div className="complaint-card-top">
          <span className="complaint-id">#{complaintId}</span>
          <span className={`status-badge ${config.cls}`}>{status}</span>
        </div>

        {/* Category name */}
        <div className="complaint-category">{category}</div>

        {/* Meta: location, municipality, date */}
        <div className="complaint-meta">
          <div className="complaint-meta-row">
            <span>📍</span>
            <span>{location}</span>
          </div>
          <div className="complaint-meta-row">
            <span>🏛️</span>
            <span>{municipalityId}</span>
          </div>
          <div className="complaint-meta-row">
            <span>📅</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="complaint-progress">
          <div
            className="complaint-progress-fill"
            style={{ width: `${config.progress}%` }}
          />
        </div>

      </div>
    </div>
  );
}

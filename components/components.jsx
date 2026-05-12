// Shared components — Icons, Photo placeholder, Stepper

// ── Icons (inline SVG, currentColor) ─────────────────────────────
const Icon = ({ name, size = 18, strokeWidth = 1.75 }) => {
  const paths = {
    search:    <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    chev_r:    <path d="m9 6 6 6-6 6" />,
    chev_l:    <path d="m15 6-6 6 6 6" />,
    chev_d:    <path d="m6 9 6 6 6-6" />,
    star:      <path d="M12 3l2.6 5.7 6.4.6-4.8 4.4 1.4 6.3L12 17l-5.6 3 1.4-6.3L3 9.3l6.4-.6z" />,
    pin:       <><path d="M12 22s7-7.3 7-13a7 7 0 1 0-14 0c0 5.7 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></>,
    video:     <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m22 8-5 4 5 4z" /></>,
    building:  <><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /><path d="M20 21V11a2 2 0 0 0-2-2h-2" /><path d="M9 9h2M9 13h2M9 17h2M4 21h16" /></>,
    calendar:  <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
    clock:     <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    user:      <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    bell:      <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
    check:     <path d="m5 12 5 5L20 7" />,
    check_b:   <path d="m5 12 5 5L20 7" />,
    info:      <><circle cx="12" cy="12" r="9" /><path d="M12 8v.01M11 12h1v5h1" /></>,
    arrow_l:   <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
    arrow_r:   <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    plus:      <><path d="M12 5v14M5 12h14" /></>,
    grid:      <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    rows:      <><path d="M3 6h18M3 12h18M3 18h18" /></>,
    card:      <><rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /></>,
    filter:    <path d="M4 5h16l-6 8v6l-4-2v-4z" />,
    language:  <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    shield:    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />,
    download:  <><path d="M12 4v12" /><path d="m7 11 5 5 5-5" /><path d="M4 20h16" /></>,
    add_cal:   <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

// ── Striped photo placeholder (or image when `image` is provided) ─
function PhotoPlaceholder({ label = "physician", style, className, image }) {
  if (image) {
    return (
      <div className={["photo", "photo--img", className].filter(Boolean).join(" ")} style={style}>
        <img src={image} alt="" loading="lazy" />
      </div>
    );
  }
  return (
    <div className={["photo", className].filter(Boolean).join(" ")} style={style}>
      <div className="ph-label">{label}</div>
    </div>
  );
}

// ── Stepper ─────────────────────────────────────────────────────
function Stepper({ steps, current }) {
  return (
    <div className="stepper" aria-label="Booking progress">
      {steps.map((label, i) => {
        const state = i < current ? "is-done" : i === current ? "is-active" : "";
        return (
          <React.Fragment key={i}>
            <div className={"step " + state}>
              <span className="num">{i < current ? "✓" : i + 1}</span>
              <span>{label}</span>
            </div>
            {i < steps.length - 1 && <div className="step-sep" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Rating display (stars + number) ─────────────────────────────
function Rating({ rating, reviews }) {
  return (
    <span className="row gap-2" style={{ color: "var(--ink-1)", fontSize: 13 }}>
      <span style={{ color: "#E0A800", display: "inline-flex", alignItems: "center" }}>
        <Icon name="star" size={14} strokeWidth={1.5} />
      </span>
      <b style={{ fontWeight: 600, color: "var(--ink-0)" }}>{rating.toFixed(1)}</b>
      <span style={{ color: "var(--ink-3)" }}>({reviews})</span>
    </span>
  );
}

// ── Date helpers ────────────────────────────────────────────────
function toISO(d) {
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function formatDayLong(d) {
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
function formatDateMonth(d) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function physicianAvatar(p) {
  const id = encodeURIComponent(p.id);
  const topOverride = p.id === "reiss" ? "&top=bob,straight01,straight02,curly,bigHair" : "";
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${id}&clothing=blazerAndShirt&clothesColor=ffffff&accessories=prescription02,prescription01,round&accessoriesProbability=70&mouth=smile&eyes=default&eyebrows=default${topOverride}&backgroundColor=eaf2ff,e0ecff,dbeafe`;
}
const BILL_AVATAR = `https://api.dicebear.com/9.x/avataaars/svg?seed=bill-sato-7&skinColor=brown&top=shortWaved&mouth=smile&eyes=default&eyebrows=default&clothing=shirtCrewNeck&clothesColor=2a6fdb&backgroundColor=eaf2ff,e0ecff,dbeafe`;

Object.assign(window, {
  Icon, PhotoPlaceholder, Stepper, Rating, physicianAvatar, BILL_AVATAR,
  toISO, addDays, formatDayLong, formatDateMonth,
});

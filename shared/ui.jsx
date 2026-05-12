// vero — shared UI primitives: Icon + date helpers used by both surfaces.

const Icon = ({ name, size = 18, strokeWidth = 1.75 }) => {
  const paths = {
    search:    <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    chev_r:    <path d="m9 6 6 6-6 6" />,
    chev_l:    <path d="m15 6-6 6 6 6" />,
    chev_d:    <path d="m6 9 6 6 6-6" />,
    star:      <path d="M12 3l2.6 5.7 6.4.6-4.8 4.4 1.4 6.3L12 17l-5.6 3 1.4-6.3L3 9.3l6.4-.6z" />,
    pin:       <><path d="M12 22s7-7.3 7-13a7 7 0 1 0-14 0c0 5.7 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></>,
    building:  <><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /><path d="M20 21V11a2 2 0 0 0-2-2h-2" /><path d="M9 9h2M9 13h2M9 17h2M4 21h16" /></>,
    calendar:  <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
    clock:     <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    bell:      <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
    check:     <path d="m5 12 5 5L20 7" />,
    info:      <><circle cx="12" cy="12" r="9" /><path d="M12 8v.01M11 12h1v5h1" /></>,
    arrow_l:   <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
    arrow_r:   <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    plus:      <><path d="M12 5v14M5 12h14" /></>,
    filter:    <path d="M4 5h16l-6 8v6l-4-2v-4z" />,
    language:  <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    shield:    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />,
    download:  <><path d="M12 4v12" /><path d="m7 11 5 5 5-5" /><path d="M4 20h16" /></>,
    add_cal:   <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" /></>,
    x:         <><path d="M6 6l12 12M18 6L6 18" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

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
function relativeTime(iso) {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return "just now";
  const m = Math.floor(diffSec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

Object.assign(window, { Icon, toISO, addDays, formatDayLong, relativeTime });

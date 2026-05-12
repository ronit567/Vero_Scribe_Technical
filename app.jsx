// vero — main App: routing + state + AppBar

const ACCENT = "#1F6FEB";

// Derived: a darker variant for hover from accent
function hexToHsl(hex) {
  const h = hex.replace("#", "");
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  const r = parseInt(x.slice(0, 2), 16) / 255;
  const g = parseInt(x.slice(2, 4), 16) / 255;
  const b = parseInt(x.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hh = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hh = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hh = (b - r) / d + 2; break;
      case b: hh = (r - g) / d + 4; break;
    }
    hh *= 60;
  }
  return [hh, s, l];
}
function darken(hex, amount = 0.08) {
  const [h, s, l] = hexToHsl(hex);
  const nl = Math.max(0, l - amount);
  // back to hex
  const c = (1 - Math.abs(2 * nl - 1)) * s;
  const hp = h / 60;
  const xv = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if      (0 <= hp && hp < 1) { r = c; g = xv; }
  else if (1 <= hp && hp < 2) { r = xv; g = c; }
  else if (2 <= hp && hp < 3) { g = c; b = xv; }
  else if (3 <= hp && hp < 4) { g = xv; b = c; }
  else if (4 <= hp && hp < 5) { r = xv; b = c; }
  else                         { r = c;  b = xv; }
  const m = nl - c / 2;
  const to = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return "#" + to(r) + to(g) + to(b);
}

// ────────────────────────────────────────────────────────────────
function AppBar({ go, currentRoute }) {
  return (
    <div className="appbar">
      <div className="appbar-inner">
        <div className="logo" style={{ cursor: "pointer" }} onClick={() => go({ name: "browse" })}>
          <div className="logo-dot" />
          vero
        </div>
        <div className="nav">
          <button
            className={currentRoute === "browse" || currentRoute === "detail" ? "is-active" : ""}
            onClick={() => go({ name: "browse" })}>
            Find care
          </button>
          <button
            className={currentRoute === "visits" ? "is-active" : ""}
            onClick={() => go({ name: "visits" })}>
            Visits
          </button>
          <button
            className={currentRoute === "profile" ? "is-active" : ""}
            onClick={() => go({ name: "profile" })}>
            Profile
          </button>
        </div>
        <div className="spacer" />
        <div className="appbar-right">
          <button className="icon-btn" aria-label="Notifications">
            <Icon name="bell" size={16} />
            <span className="dot" />
          </button>
          <button className="me">
            <span className="avatar">BS</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Bill</span>
            <Icon name="chev_d" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
function App() {
  const [layout, setLayout] = React.useState("cards");
  const [route, setRoute] = React.useState({ name: "browse" });
  const [filters, setFilters] = React.useState({
    q: "",
    specialty: "All specialties",
    visit: "any",
    insurance: "BlueCross PPO",
    acceptingOnly: false,
    thisWeek: false,
  });
  const [draft, setDraft] = React.useState({
    physicianId: null,
    visitType: null,
    dateISO: null,
    time: null,
    reason: null,
    notes: "",
    duration: null,
    severity: null,
    trend: null,
    priorTreatment: "",
    medications: "",
    allergies: "",
    contact: "Text",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [requestId, setRequestId] = React.useState(null);

  // Apply accent color CSS variables
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", ACCENT);
    root.style.setProperty("--accent-dark", darken(ACCENT, 0.08));
  }, []);

  const physician = draft.physicianId ? physicianById(draft.physicianId) : null;

  const go = (r) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const onSelectPhysician = (id) => {
    const p = physicianById(id);
    const defaultDate = toISO(addDays(new Date(), p.nextAvail));
    setDraft({
      ...draft,
      physicianId: id,
      // reset slot selection if changing physician
      dateISO: defaultDate,
      time: null,
      visitType: p.visitTypes.includes("in-person") ? "in-person" : "virtual",
    });
    go({ name: "detail" });
  };

  const onSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const id = "VR-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      setRequestId(id);
      setSubmitting(false);
      go({ name: "confirmed" });
    }, 900);
  };

  const onStartOver = () => {
    setDraft({
      physicianId: null, visitType: null, dateISO: null, time: null,
      reason: null, notes: "",
      duration: null, severity: null, trend: null, priorTreatment: "",
      medications: "", allergies: "",
      contact: "Text",
    });
    setRequestId(null);
    go({ name: "browse" });
  };

  return (
    <>
      <AppBar go={go} currentRoute={route.name} />

      {route.name === "visits" && (
        <VisitsScreen
          requestId={requestId}
          draft={draft}
          onBookNew={() => go({ name: "browse" })}
          onOpenConfirmation={() => go({ name: "confirmed" })}
        />
      )}

      {route.name === "profile" && <ProfileScreen />}

      {route.name === "browse" && (
        <BrowseScreen
          filters={filters}
          setFilters={setFilters}
          layout={layout}
          setLayout={setLayout}
          onSelect={onSelectPhysician}
        />
      )}

      {route.name === "detail" && physician && (
        <DetailScreen
          physician={physician}
          draft={draft}
          setDraft={setDraft}
          onBack={() => go({ name: "browse" })}
          onContinue={() => go({ name: "reason" })}
        />
      )}

      {route.name === "reason" && physician && (
        <ReasonScreen
          physician={physician}
          draft={draft}
          setDraft={setDraft}
          onBack={() => go({ name: "detail" })}
          onContinue={() => go({ name: "review" })}
        />
      )}

      {route.name === "review" && physician && (
        <ReviewScreen
          physician={physician}
          draft={draft}
          submitting={submitting}
          onBack={() => go({ name: "reason" })}
          onJumpTo={(n) => go({ name: n })}
          onSubmit={onSubmit}
        />
      )}

      {route.name === "confirmed" && physician && (
        <ConfirmationScreen
          physician={physician}
          draft={draft}
          requestId={requestId}
          onStartOver={onStartOver}
        />
      )}

    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// vero — main App: routing + state + AppBar

const DEFAULT_FILTERS = {
  q: "", specialty: "All specialties", visit: "any",
  insurance: "BlueCross PPO", language: "Any language", thisWeek: false,
};

const DEFAULT_DRAFT = {
  physicianId: null, visitType: null, dateISO: null, time: null,
  reason: null, notes: "",
  duration: null, severity: null, trend: null, priorTreatment: "",
  medications: "", allergies: "", contact: "Text",
};

const NAV = [
  { id: "browse",  label: "Find care", aliases: ["detail"] },
  { id: "visits",  label: "Visits" },
  { id: "profile", label: "Profile" },
];

function AppBar({ go, currentRoute }) {
  return (
    <div className="appbar">
      <div className="appbar-inner">
        <div className="logo" style={{ cursor: "pointer" }} onClick={() => go({ name: "browse" })}>
          <div className="logo-dot" />
          vero
        </div>
        <div className="nav">
          {NAV.map(({ id, label, aliases = [] }) => (
            <button key={id}
              className={[id, ...aliases].includes(currentRoute) ? "is-active" : ""}
              onClick={() => go({ name: id })}>
              {label}
            </button>
          ))}
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

function App() {
  const [route, setRoute]         = React.useState({ name: "browse" });
  const [filters, setFilters]     = React.useState(DEFAULT_FILTERS);
  const [draft, setDraft]         = React.useState(DEFAULT_DRAFT);
  const [submitting, setSubmitting] = React.useState(false);
  const [requestId, setRequestId] = React.useState(null);
  const [bookings, setBookings]   = React.useState(() => Store.list());

  React.useEffect(() => Store.subscribe(setBookings), []);

  const physician = draft.physicianId ? physicianById(draft.physicianId) : null;

  const go = (r) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const onSelectPhysician = (id) => {
    const p = physicianById(id);
    setDraft({
      ...draft,
      physicianId: id,
      dateISO: toISO(addDays(new Date(), p.nextAvail)),
      time: null,
      visitType: p.visitTypes.includes("in-person") ? "in-person" : "virtual",
    });
    go({ name: "detail" });
  };

  const onSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const id = "VR-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const p = physicianById(draft.physicianId);
      const date = new Date(draft.dateISO + "T00:00:00")
        .toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      const reasonTitle = (REASONS.find((r) => r.id === draft.reason) || {}).title || "Visit";
      Store.add({
        id,
        createdAt: new Date().toISOString(),
        status: "pending",
        physicianId: draft.physicianId,
        reason: reasonTitle,
        date,
        dateISO: draft.dateISO,
        time: draft.time,
        patient: { ...DEMO_PATIENT },
        appointment: {
          dateISO: draft.dateISO, date, time: draft.time,
          visitType: draft.visitType, location: p ? p.location : null,
        },
        intake: {
          reason: draft.reason, reasonTitle, notes: draft.notes,
          duration: draft.duration, severity: draft.severity, trend: draft.trend,
          priorTreatment: draft.priorTreatment,
          medications: draft.medications, allergies: draft.allergies,
          contact: draft.contact,
        },
        adminEvents: [],
      });
      setRequestId(id);
      setSubmitting(false);
      go({ name: "confirmed" });
    }, 900);
  };

  const onStartOver = () => {
    setDraft(DEFAULT_DRAFT);
    setRequestId(null);
    go({ name: "browse" });
  };

  return (
    <>
      <AppBar go={go} currentRoute={route.name} />

      {route.name === "visits" && (
        <VisitsScreen
          bookings={bookings}
          requestId={requestId}
          onBookNew={() => go({ name: "browse" })}
          onOpenConfirmation={(id) => { setRequestId(id); go({ name: "confirmed" }); }}
        />
      )}

      {route.name === "profile" && <ProfileScreen />}

      {route.name === "browse" && (
        <BrowseScreen
          filters={filters} setFilters={setFilters}
          onSelect={onSelectPhysician}
        />
      )}

      {route.name === "detail" && physician && (
        <DetailScreen
          physician={physician} draft={draft} setDraft={setDraft}
          onBack={() => go({ name: "browse" })}
          onContinue={() => go({ name: "reason" })}
        />
      )}

      {route.name === "reason" && physician && (
        <ReasonScreen
          physician={physician} draft={draft} setDraft={setDraft}
          onBack={() => go({ name: "detail" })}
          onContinue={() => go({ name: "review" })}
        />
      )}

      {route.name === "review" && physician && (
        <ReviewScreen
          physician={physician} draft={draft} submitting={submitting}
          onBack={() => go({ name: "reason" })}
          onJumpTo={(n) => go({ name: n })}
          onSubmit={onSubmit}
        />
      )}

      {route.name === "confirmed" && physician && (
        <ConfirmationScreen
          physician={physician} draft={draft}
          requestId={requestId} onStartOver={onStartOver}
        />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// Physician console — admin shell. Stats, filters, split-pane queue + detail.

function AdminBar() {
  return (
    <div className="appbar">
      <div className="appbar-inner">
        <div className="logo">
          <div className="logo-dot" />
          vero
          <span style={{
            marginLeft: 10, padding: "2px 8px",
            fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
            textTransform: "uppercase",
            background: "var(--surface-2)", color: "var(--ink-2)",
            borderRadius: 6,
          }}>
            Admin Console
          </span>
        </div>
        <div className="spacer" />
        <div className="appbar-right">
          <button className="icon-btn" aria-label="Notifications">
            <Icon name="bell" size={16} />
          </button>
          <button className="me">
            <span className="avatar">AD</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Admin</span>
            <Icon name="chev_d" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, deltaTone, active, onClick }) {
  return (
    <div className={
      "admin-stat " + (active ? "is-active " : "") + (onClick ? "clickable" : "")
    } onClick={onClick}>
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      {delta && <span className={"delta " + (deltaTone || "")}>{delta}</span>}
    </div>
  );
}

// ── Date helpers scoped to admin queue ─────────────────────────
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
}
function daysUntil(iso) {
  if (!iso) return Infinity;
  const target = new Date(iso + "T00:00:00");
  if (isNaN(target)) return Infinity;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}
function isToday(iso) {
  if (!iso) return false;
  return daysUntil(iso) === 0;
}
function isThisWeek(iso) {
  const n = daysUntil(iso);
  return n >= 0 && n <= 7;
}

function AdminApp() {
  const [bookings, setBookings] = React.useState(() => Store.list());
  const [status, setStatus] = React.useState("all");
  const [physicianId, setPhysicianId] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [quickFilter, setQuickFilter] = React.useState("all"); // all | today | week | urgent
  const [sortBy, setSortBy] = React.useState("submitted");     // submitted | appointment | severity
  const [selectedId, setSelectedId] = React.useState(null);

  React.useEffect(() => Store.subscribe(setBookings), []);

  // Counts for sidebar + stats
  const counts = React.useMemo(() => {
    const c = { all: bookings.length, pending: 0, confirmed: 0, declined: 0, today: 0, week: 0, urgent: 0 };
    for (const b of bookings) {
      c[b.status] = (c[b.status] || 0) + 1;
      const iso = (b.appointment && b.appointment.dateISO) || b.dateISO;
      if (isToday(iso)) c.today++;
      if (isThisWeek(iso)) c.week++;
      if (b.intake && b.intake.severity === "severe" && b.status === "pending") c.urgent++;
    }
    return c;
  }, [bookings]);

  // Filter pipeline
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = bookings.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (physicianId !== "all" && b.physicianId !== physicianId) return false;
      const iso = (b.appointment && b.appointment.dateISO) || b.dateISO;
      if (quickFilter === "today" && !isToday(iso)) return false;
      if (quickFilter === "week" && !isThisWeek(iso)) return false;
      if (quickFilter === "urgent" && !(b.intake && b.intake.severity === "severe")) return false;
      if (!q) return true;
      const p = physicianById(b.physicianId);
      const haystack = [
        b.patient && b.patient.name,
        p && p.name,
        p && p.specialty,
        b.intake && b.intake.reasonTitle,
        b.id,
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
    // Sort
    const sevRank = { severe: 0, moderate: 1, mild: 2, undefined: 3 };
    out = [...out].sort((a, b) => {
      if (sortBy === "appointment") {
        const ai = (a.appointment && a.appointment.dateISO) || a.dateISO || "";
        const bi = (b.appointment && b.appointment.dateISO) || b.dateISO || "";
        return ai.localeCompare(bi);
      }
      if (sortBy === "severity") {
        const ar = sevRank[(a.intake || {}).severity] ?? 3;
        const br = sevRank[(b.intake || {}).severity] ?? 3;
        if (ar !== br) return ar - br;
      }
      // default: newest submission first
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
    return out;
  }, [bookings, status, physicianId, query, quickFilter, sortBy]);

  const selected = bookings.find((b) => b.id === selectedId) || null;

  const pushEvent = (id, action) => {
    const b = bookings.find((x) => x.id === id);
    const prev = (b && b.adminEvents) || [];
    Store.update(id, {
      status: action,
      adminEvents: [...prev, { at: new Date().toISOString(), action }],
    });
  };
  const onConfirm = (id) => pushEvent(id, "confirmed");
  const onDecline = (id) => pushEvent(id, "declined");

  const physiciansWithBookings = React.useMemo(() => {
    const ids = new Set(bookings.map((b) => b.physicianId));
    return PHYSICIANS.filter((p) => ids.has(p.id));
  }, [bookings]);

  const NavItem = ({ id, label, count }) => (
    <button
      className={"admin-nav-item " + (status === id ? "is-active" : "")}
      onClick={() => { setStatus(id); setSelectedId(null); }}>
      {label}
      <span className="count">{count}</span>
    </button>
  );

  const QF = ({ id, label, count }) => (
    <button
      className={"qf " + (quickFilter === id ? "is-active" : "")}
      onClick={() => setQuickFilter(quickFilter === id ? "all" : id)}>
      {label}
      {count !== undefined && <span className="count">· {count}</span>}
    </button>
  );

  return (
    <>
      <AdminBar />
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-side-section">
            <div className="admin-side-label">Queue</div>
            <NavItem id="all"       label="All requests" count={counts.all} />
            <NavItem id="pending"   label="Pending"       count={counts.pending || 0} />
            <NavItem id="confirmed" label="Confirmed"     count={counts.confirmed || 0} />
            <NavItem id="declined"  label="Declined"      count={counts.declined || 0} />
          </div>

          <div className="admin-side-section">
            <div className="admin-side-label">Physician</div>
            <select
              className="select"
              value={physicianId}
              onChange={(e) => { setPhysicianId(e.target.value); setSelectedId(null); }}
              style={{ width: "100%" }}>
              <option value="all">All physicians</option>
              {physiciansWithBookings.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-side-section">
            <div className="admin-side-label">Sort by</div>
            <select
              className="select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: "100%" }}>
              <option value="submitted">Newest submission</option>
              <option value="appointment">Appointment date</option>
              <option value="severity">Severity</option>
            </select>
          </div>
        </aside>

        <main className="admin-main">
          {/* Stat cards */}
          <div className="admin-stats">
            <StatCard
              label="Pending review"
              value={counts.pending || 0}
              delta={counts.urgent ? `${counts.urgent} severe` : "All triaged"}
              deltaTone={counts.urgent ? "warn" : "pos"}
              active={status === "pending"}
              onClick={() => { setStatus("pending"); setQuickFilter("all"); setSelectedId(null); }}
            />
            <StatCard
              label="Today"
              value={counts.today}
              delta="Scheduled appointments"
              active={quickFilter === "today"}
              onClick={() => { setQuickFilter(quickFilter === "today" ? "all" : "today"); setSelectedId(null); }}
            />
            <StatCard
              label="This week"
              value={counts.week}
              delta="Next 7 days"
              active={quickFilter === "week"}
              onClick={() => { setQuickFilter(quickFilter === "week" ? "all" : "week"); setSelectedId(null); }}
            />
            <StatCard
              label="Confirmed"
              value={counts.confirmed || 0}
              delta={`${counts.all} total this period`}
              active={status === "confirmed"}
              onClick={() => { setStatus("confirmed"); setQuickFilter("all"); setSelectedId(null); }}
            />
          </div>

          {/* Toolbar */}
          <div className="admin-toolbar">
            <div className="search">
              <span className="ico"><Icon name="search" size={15} /></span>
              <input
                placeholder="Search patient, physician, reason, or ID…"
                value={query}
                onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              Showing {filtered.length} of {bookings.length}
            </div>
          </div>

          {/* Quick filter chips */}
          <div className="admin-quickfilter">
            <QF id="all"    label="All time" />
            <QF id="today"  label="Today"        count={counts.today} />
            <QF id="week"   label="This week"    count={counts.week} />
            <QF id="urgent" label="Severe only"  count={counts.urgent} />
          </div>

          {/* Split: queue + detail */}
          <div className={"admin-split " + (selected ? "" : "is-full")}>
            <Queue bookings={filtered} selectedId={selectedId} onSelect={setSelectedId} />
            {selected ? (
              <AppointmentDetail
                booking={selected}
                onClose={() => setSelectedId(null)}
                onConfirm={onConfirm}
                onDecline={onDecline}
              />
            ) : (
              filtered.length > 0 && (
                <div className="admin-pane-empty" style={{ display: "none" }} />
              )
            )}
          </div>
        </main>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AdminApp />);

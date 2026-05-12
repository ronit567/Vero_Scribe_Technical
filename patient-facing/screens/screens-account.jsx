// Screens: Visits + Profile

const PAST_VISITS = [
  { id: "v-2104", physicianId: "okonkwo", reason: "Annual physical",
    date: "Mar 12, 2026", time: "9:30 AM",
    summary: "Routine annual exam. Labs ordered: CBC, lipid panel. No concerns identified." },
  { id: "v-2089", physicianId: "iyengar", reason: "Skin check",
    date: "Dec 4, 2025", time: "2:00 PM",
    summary: "Annual full-body skin screening. Two benign nevi noted. Return in 12 months." },
  { id: "v-2061", physicianId: "vega", reason: "Cardiology consult",
    date: "Jun 18, 2025", time: "11:00 AM",
    summary: "Baseline cardiovascular assessment. EKG normal. Lipid-lowering therapy continued." },
  { id: "v-2034", physicianId: "okonkwo", reason: "Follow-up — bronchitis",
    date: "Feb 2, 2025", time: "4:30 PM",
    summary: "Symptom resolution after 10-day course. No further action needed." },
];

// ─── Visits ─────────────────────────────────────────────────────

function VisitsScreen({ bookings = [], requestId, onBookNew, onOpenConfirmation }) {
  const onCancel = (visit) => {
    const p = physicianById(visit.physicianId);
    const ok = window.confirm(
      `Cancel your ${visit.time} appointment with ${p.name} on ${visit.date}?`
    );
    if (!ok) return;
    Store.update(visit.id, {
      status: "cancelled",
      adminEvents: [
        ...(visit.adminEvents || []),
        { at: new Date().toISOString(), action: "cancelled", by: "patient" },
      ],
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Visits</h1>
          <p className="page-sub">Your upcoming appointments and visit history</p>
        </div>
        <button className="btn btn-primary" onClick={onBookNew}>
          <Icon name="plus" size={16} /> Book a visit
        </button>
      </div>

      <SectionHeader label="Upcoming" count={bookings.length} />

      {bookings.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: "center", color: "var(--ink-2)", padding: "40px 20px" }}>
          <div style={{ fontSize: 14, marginBottom: 10 }}>You don't have any upcoming visits.</div>
          <button className="btn btn-primary" onClick={onBookNew}>
            <Icon name="plus" size={14} /> Book a visit
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bookings.map((v) => (
            <VisitCardUpcoming key={v.id}
              visit={v}
              onView={v.id === requestId ? () => onOpenConfirmation(v.id) : null}
              onCancel={onCancel}
              onBookAgain={onBookNew} />
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "36px 0 12px" }}>
        <SectionHeader label="Past visits" count={PAST_VISITS.length} bare />
        <button className="btn btn-ghost" style={{ height: 30, padding: "0 10px", fontSize: 13 }}>
          Download history <Icon name="download" size={13} />
        </button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {PAST_VISITS.map((v, i) => (
          <VisitRowPast key={v.id} visit={v} divider={i > 0} />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ label, count, bare }) {
  const h2 = (
    <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "var(--ink-2)",
                 textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {label} <span style={{ color: "var(--ink-3)", marginLeft: 4 }}>{count}</span>
    </h2>
  );
  return bare ? h2 : <div style={{ margin: "8px 0 12px" }}>{h2}</div>;
}

function DateBlock({ dateStr, accent }) {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 10,
      background: accent ? "var(--accent-tint)" : "var(--surface-2)",
      border: "1px solid var(--line)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                    color: accent ? "var(--accent-dark)" : "var(--ink-2)" }}>
        {d.toLocaleDateString(undefined, { month: "short" }).toUpperCase()}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1, color: "var(--ink-0)", marginTop: 2 }}>
        {d.getDate()}
      </div>
    </div>
  );
}

const MUTED_TAG = { background: "var(--surface-2)", color: "var(--ink-2)" };

function StatusTag({ status }) {
  if (status === "confirmed") return <span className="tag tag-pos"><span className="dot" /> Confirmed</span>;
  if (status === "declined")  return <span className="tag" style={MUTED_TAG}>Declined by office</span>;
  if (status === "cancelled") return <span className="tag" style={MUTED_TAG}>Cancelled</span>;
  return <span className="tag tag-warn"><span className="dot" /> Awaiting confirmation</span>;
}

function VisitCardUpcoming({ visit, onView, onCancel, onBookAgain }) {
  const p = physicianById(visit.physicianId);
  const status = visit.status || "pending";
  const isInactive = status === "declined" || status === "cancelled";
  return (
    <div className="card" style={{
      padding: 16, display: "grid", gridTemplateColumns: "64px 1fr auto",
      gap: 16, alignItems: "center",
      opacity: isInactive ? 0.7 : 1,
    }}>
      <DateBlock dateStr={visit.date} accent={status === "confirmed"} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--ink-0)" }}>{p.name}</div>
          <StatusTag status={status} />
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>
          {p.specialty} · {visit.reason}
        </div>
        <div className="doc-meta-row" style={{ marginTop: 8 }}>
          <span className="it mono" style={{ color: "var(--ink-1)", fontWeight: 500 }}>
            <Icon name="clock" size={13} /> {visit.time}
          </span>
          <span className="it"><Icon name="pin" size={13} /> {p.location.split(" — ")[0]}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "end" }}>
        {status === "pending" && onView && (
          <button className="btn btn-primary" onClick={onView}>View request</button>
        )}
        {status === "confirmed" && (
          <>
            <button className="btn btn-secondary">Reschedule</button>
            <button className="btn btn-ghost"
              style={{ height: 28, padding: "0 8px", color: "var(--ink-2)", fontSize: 13 }}
              onClick={() => onCancel && onCancel(visit)}>
              Cancel
            </button>
          </>
        )}
        {isInactive && (
          <button className="btn btn-secondary" onClick={() => onBookAgain && onBookAgain()}>
            Book another
          </button>
        )}
      </div>
    </div>
  );
}

function VisitRowPast({ visit, divider }) {
  const p = physicianById(visit.physicianId);
  return (
    <div style={{
      padding: "14px 18px",
      display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center",
      borderTop: divider ? "1px solid var(--line)" : "0",
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)", minWidth: 84 }}>
            {visit.date}
          </span>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-0)" }}>{p.name}</div>
          <span className="muted" style={{ fontSize: 13 }}>· {p.specialty} · {visit.reason}</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 3, paddingLeft: 92 }}>
          {visit.summary}
        </div>
      </div>
      <button className="btn btn-ghost" style={{ height: 30, padding: "0 10px", fontSize: 13 }}>
        View summary <Icon name="arrow_r" size={12} />
      </button>
    </div>
  );
}

// ─── Profile ────────────────────────────────────────────────────

function ProfileScreen() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-sub">Personal details and account settings</p>
        </div>
        <button className="btn btn-secondary">Edit profile</button>
      </div>

      <div className="card" style={{
        padding: 24, display: "grid", gridTemplateColumns: "120px 1fr auto",
        gap: 24, alignItems: "center",
      }}>
        <div style={{
          width: 120, height: 120, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 42, fontWeight: 600, letterSpacing: "-0.02em",
          flexShrink: 0,
        }}>BS</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
              Bill Sato
            </h2>
            <span className="tag tag-accent">
              <Icon name="shield" size={11} /> Verified patient
            </span>
          </div>
          <div style={{ color: "var(--ink-2)", marginTop: 4, fontSize: 14 }}>
            Cofounder · <b style={{ color: "var(--ink-0)", fontWeight: 600 }}>Vero Scribe</b>
          </div>
          <div className="detail-stats" style={{ marginTop: 14 }}>
            <div className="stat">
              <div className="l">Member since</div>
              <div className="v" style={{ fontSize: 15, fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                Mar 2022
              </div>
            </div>
            <div className="stat">
              <div className="l">Member ID</div>
              <div className="v" style={{ fontSize: 15 }}>BC-4837-2210</div>
            </div>
          </div>
        </div>
        <div />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div className="card">
          <div style={{
            padding: "18px 20px 8px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <h3 className="section-h" style={{ margin: 0 }}>Personal information</h3>
            <button className="edit">Edit</button>
          </div>
          <dl className="kv" style={{ padding: "8px 20px 20px", gridTemplateColumns: "150px 1fr", rowGap: 10 }}>
            <dt>Legal name</dt><dd>Bill Sato</dd>
            <dt>Preferred name</dt><dd>Bill</dd>
            <dt>Pronouns</dt><dd>he / him</dd>
            <dt>Date of birth</dt><dd className="mono">Aug 04, 1989</dd>
            <dt>Email</dt><dd>bill@veroscribe.com</dd>
            <dt>Phone</dt><dd className="mono">(415) 555-4421</dd>
            <dt>Address</dt><dd>1488 Marina Blvd, San Francisco, CA 94123</dd>
          </dl>
        </div>
      </div>

      <div style={{
        marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div className="muted" style={{ fontSize: 12 }}>
          Signed in as <b style={{ color: "var(--ink-1)" }}>bill@veroscribe.com</b>
        </div>
        <button className="btn btn-ghost" style={{ color: "var(--ink-2)" }}>Sign out</button>
      </div>
    </div>
  );
}

Object.assign(window, { VisitsScreen, ProfileScreen });

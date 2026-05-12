// Screens: Visits + Profile
// Globals: Icon, PhotoPlaceholder, Rating, PHYSICIANS, physicianById,
//          formatDayLong, formatDateMonth

// ════════════════════════════════════════════════════════════════
//  Visit-card helpers
// ════════════════════════════════════════════════════════════════

const PAST_VISITS = [
  {
    id: "v-2104",
    physicianId: "okonkwo",
    reason: "Annual physical",
    date: "Mar 12, 2026",
    time: "9:30 AM",
    summary: "Routine annual exam. Labs ordered: CBC, lipid panel. No concerns identified.",
  },
  {
    id: "v-2089",
    physicianId: "iyengar",
    reason: "Skin check",
    date: "Dec 4, 2025",
    time: "2:00 PM",
    summary: "Annual full-body skin screening. Two benign nevi noted. Return in 12 months.",
  },
  {
    id: "v-2061",
    physicianId: "vega",
    reason: "Cardiology consult",
    date: "Jun 18, 2025",
    time: "11:00 AM",
    summary: "Baseline cardiovascular assessment. EKG normal. Lipid-lowering therapy continued.",
  },
  {
    id: "v-2034",
    physicianId: "okonkwo",
    reason: "Follow-up — bronchitis",
    date: "Feb 2, 2025",
    time: "4:30 PM",
    summary: "Symptom resolution after 10-day course. No further action needed.",
  },
];

const SCHEDULED_VISITS = [];

// ════════════════════════════════════════════════════════════════
//  VISITS
// ════════════════════════════════════════════════════════════════

function VisitsScreen({ requestId, draft, onBookNew, onOpenConfirmation }) {
  // The just-submitted request (if any) becomes a "pending" upcoming visit
  const pendingRequest = requestId && draft.physicianId ? {
    id: requestId,
    physicianId: draft.physicianId,
    reason: (REASONS.find((r) => r.id === draft.reason) || {}).title || "Visit",
    date: draft.dateISO
      ? new Date(draft.dateISO + "T00:00:00").toLocaleDateString(undefined,
          { month: "short", day: "numeric", year: "numeric" })
      : "",
    time: draft.time,
    status: "pending",
  } : null;

  const upcoming = pendingRequest ? [pendingRequest, ...SCHEDULED_VISITS] : SCHEDULED_VISITS;

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

      {/* Upcoming */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "8px 0 12px" }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
          Upcoming <span className="muted" style={{ fontWeight: 400 }}>· {upcoming.length}</span>
        </h2>
      </div>

      {upcoming.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: "center", color: "var(--ink-2)" }}>
          You don't have any upcoming visits.{" "}
          <button className="btn btn-ghost" onClick={onBookNew} style={{ height: 28, padding: "0 8px" }}>
            Book one →
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {upcoming.map((v) => (
            <VisitCardUpcoming key={v.id}
              visit={v}
              onView={v.id === requestId ? onOpenConfirmation : null} />
          ))}
        </div>
      )}

      {/* Past */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "32px 0 12px" }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
          Past visits <span className="muted" style={{ fontWeight: 400 }}>· {PAST_VISITS.length}</span>
        </h2>
        <button className="btn btn-ghost" style={{ height: 32, padding: "0 10px" }}>
          Download history <Icon name="download" size={14} />
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

function VisitCardUpcoming({ visit, onView }) {
  const p = physicianById(visit.physicianId);
  const pending = visit.status === "pending";
  return (
    <div className="card" style={{ padding: 18, display: "grid", gridTemplateColumns: "72px 1fr auto", gap: 18, alignItems: "center" }}>
      <PhotoPlaceholder label="MD" style={{ width: 72, height: 72, borderRadius: "50%" }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink-0)" }}>{p.name}</div>
          {pending
            ? <span className="tag tag-warn"><span className="dot" /> Awaiting confirmation</span>
            : <span className="tag tag-pos"><span className="dot" /> Confirmed</span>}
        </div>
        <div style={{ fontSize: 13.5, color: "var(--ink-1)", marginTop: 2 }}>
          {p.specialty} · {visit.reason}
        </div>
        <div className="doc-meta-row" style={{ marginTop: 8 }}>
          <span className="it mono" style={{ color: "var(--ink-0)", fontWeight: 500 }}>
            <Icon name="calendar" size={13} /> {visit.date}
          </span>
          <span className="it mono" style={{ color: "var(--ink-0)", fontWeight: 500 }}>
            <Icon name="clock" size={13} /> {visit.time}
          </span>
          <span className="it"><Icon name="pin" size={13} /> {p.location.split(" — ")[0]}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "end" }}>
        {pending && onView && (
          <button className="btn btn-primary" onClick={onView}>
            View request
          </button>
        )}
        {!pending && (
          <>
            <button className="btn btn-secondary">Reschedule</button>
            <button className="btn btn-ghost" style={{ height: 28, padding: "0 8px", color: "var(--ink-2)", fontSize: 13 }}>
              Cancel visit
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function VisitRowPast({ visit, divider }) {
  const p = physicianById(visit.physicianId);
  return (
    <div style={{
      padding: "16px 20px",
      display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 16, alignItems: "center",
      borderTop: divider ? "1px solid var(--line)" : "0",
    }}>
      <PhotoPlaceholder label="MD" style={{ width: 44, height: 44, borderRadius: "50%" }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink-0)" }}>{p.name}</div>
          <span className="muted" style={{ fontSize: 13 }}>{p.specialty} · {visit.reason}</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>
          <span className="mono" style={{ color: "var(--ink-1)" }}>{visit.date} · {visit.time}</span>
          {" — "}
          {visit.summary}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn btn-secondary">View summary</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  PROFILE — Bill, cofounder of Vero Scribe
// ════════════════════════════════════════════════════════════════

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

      {/* Hero */}
      <div className="card" style={{ padding: 24, display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 24, alignItems: "center" }}>
        <PhotoPlaceholder image={`https://api.dicebear.com/9.x/avataaars/svg?seed=billsato&skinColor=brown&mouth=smile`} style={{ width: 120, height: 120, borderRadius: "50%" }} />
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

      {/* Two-column body */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        {/* Personal info */}
        <div className="card">
          <div style={{ padding: "18px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 className="section-h" style={{ margin: 0 }}>Personal information</h3>
            <button className="edit">Edit</button>
          </div>
          <dl className="kv" style={{ padding: "8px 20px 20px", gridTemplateColumns: "150px 1fr", rowGap: 10 }}>
            <dt>Legal name</dt>
            <dd>Bill Sato</dd>
            <dt>Preferred name</dt>
            <dd>Bill</dd>
            <dt>Pronouns</dt>
            <dd>he / him</dd>
            <dt>Date of birth</dt>
            <dd className="mono">Aug 04, 1989</dd>
            <dt>Email</dt>
            <dd>bill@veroscribe.com</dd>
            <dt>Phone</dt>
            <dd className="mono">(415) 555-4421</dd>
            <dt>Address</dt>
            <dd>1488 Marina Blvd, San Francisco, CA 94123</dd>
          </dl>
        </div>

        {/* Medical */}
        <div className="card" style={{ gridColumn: "span 2", display: "none" }}>
          <div style={{ padding: "18px 20px 8px" }}>
            <h3 className="section-h" style={{ margin: 0 }}>Medical summary</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "8px 20px 20px", gap: 24 }}>
            <div>
              <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Allergies
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 14 }}>Penicillin <span className="tag tag-warn" style={{ marginLeft: 4 }}>Severe</span></div>
                <div style={{ fontSize: 14 }}>Tree pollen <span className="muted">Mild · seasonal</span></div>
              </div>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Medications
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 14 }}>Atorvastatin <span className="muted mono">20 mg · daily</span></div>
                <div style={{ fontSize: 14 }}>Cetirizine <span className="muted mono">10 mg · as needed</span></div>
              </div>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Conditions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 14 }}>Hyperlipidemia</div>
                <div style={{ fontSize: 14 }}>Seasonal allergic rhinitis</div>
              </div>
            </div>
          </div>
        </div>

        {/* Account & preferences */}
        <div className="card" style={{ gridColumn: "span 2", display: "none" }}>
          <div style={{ padding: "18px 20px 8px" }}>
            <h3 className="section-h" style={{ margin: 0 }}>Account & preferences</h3>
          </div>
          <div>
            {[
              { label: "Communication preferences", value: "Text for confirmations, email for summaries" },
              { label: "Two-factor authentication", value: "Enabled · authenticator app", tag: "Secure" },
              { label: "Connected pharmacy", value: "Marina Pharmacy — 1450 Chestnut St" },
              { label: "Emergency contact", value: "Mira Sato · spouse · (415) 555-4422" },
              { label: "Privacy & data", value: "Manage who can access your records" },
            ].map((row, i) => (
              <div key={i} style={{
                padding: "14px 20px",
                display: "grid", gridTemplateColumns: "240px 1fr auto", gap: 16, alignItems: "center",
                borderTop: "1px solid var(--line)",
              }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{row.label}</div>
                <div style={{ fontSize: 13.5, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 8 }}>
                  {row.value}
                  {row.tag && <span className="tag tag-pos">{row.tag}</span>}
                </div>
                <button className="edit">Manage</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="muted" style={{ fontSize: 12 }}>
          Signed in as <b style={{ color: "var(--ink-1)" }}>bill@veroscribe.com</b>
        </div>
        <button className="btn btn-ghost" style={{ color: "var(--ink-2)" }}>Sign out</button>
      </div>
    </div>
  );
}

Object.assign(window, { VisitsScreen, ProfileScreen });

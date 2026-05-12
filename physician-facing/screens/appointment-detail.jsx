// Physician console — appointment detail (full intake view + actions)

function KV({ label, value, mono }) {
  const isEmpty = value === null || value === undefined || value === "";
  return (
    <>
      <dt>{label}</dt>
      <dd className={isEmpty ? "empty" : (mono ? "mono" : "")}>
        {isEmpty ? "—" : value}
      </dd>
    </>
  );
}

function severityLabel(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function trendLabel(s) {
  return ({ improving: "Improving", same: "About the same", worsening: "Getting worse" })[s] || "";
}
function formatDOB(dob) {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d)) return dob;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function ageFrom(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d)) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function AppointmentDetail({ booking, onClose, onConfirm, onDecline }) {
  if (!booking) return null;
  const p = physicianById(booking.physicianId);
  const intake = booking.intake || {};
  const appt = booking.appointment || {};
  const patient = booking.patient || {};
  const dateObj = appt.dateISO ? new Date(appt.dateISO + "T00:00:00") : null;
  const longDate = dateObj ? formatDayLong(dateObj) : booking.date;
  const age = ageFrom(patient.dob);
  const urgent = intake.severity === "severe";
  const events = booking.adminEvents || [];

  return (
    <div className="admin-detail">
      <div className="admin-detail-header">
        <div className="avatar-lg">{initialsOf(patient.name)}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="id">{booking.id}</div>
          <div className="ttl">{patient.name || "—"}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <StatusPill status={booking.status} />
            <SeverityBadge severity={intake.severity} />
            <TrendIndicator trend={intake.trend} />
            <span className="muted" style={{ fontSize: 12.5 }}>
              · Submitted {booking.createdAt ? relativeTime(booking.createdAt) : "—"}
            </span>
          </div>
        </div>
        <button className="close" onClick={onClose} aria-label="Close">
          <Icon name="x" size={16} />
        </button>
      </div>

      {urgent && booking.status === "pending" && (
        <div style={{
          padding: "10px 24px",
          background: "#FBE6E7",
          color: "#7A1F23",
          fontSize: 13,
          display: "flex", alignItems: "center", gap: 8,
          borderBottom: "1px solid var(--line)",
        }}>
          <Icon name="info" size={14} />
          <span><b>Severe symptoms reported.</b> Consider prioritizing this request.</span>
        </div>
      )}

      <div className="admin-section">
        <div className="admin-section-label">Patient</div>
        <dl className="admin-kv">
          <KV label="Name" value={patient.name} />
          <KV label="Age / DOB" value={age != null ? `${age} years · ${formatDOB(patient.dob)}` : formatDOB(patient.dob)} />
          <KV label="Member ID" value={patient.memberId} mono />
          <KV label="Phone" value={patient.phone} />
          <KV label="Email" value={patient.email} />
          <KV label="Preferred contact" value={intake.contact} />
        </dl>
      </div>

      <div className="admin-section">
        <div className="admin-section-label">Appointment</div>
        <dl className="admin-kv">
          <KV label="Physician" value={p ? `${p.name}, ${p.credentials}` : "—"} />
          <KV label="Specialty" value={p ? p.specialty : ""} />
          <KV label="When" value={longDate ? `${longDate} · ${appt.time || booking.time} (${timeUntil(appt.dateISO || booking.dateISO)})` : ""} />
          <KV label="Visit type"
            value={appt.visitType ? (appt.visitType === "virtual" ? "Virtual" : "In-person") : ""} />
          <KV label="Location" value={appt.location || (p && p.location)} />
        </dl>
      </div>

      <div className="admin-section">
        <div className="admin-section-label">Chief complaint</div>
        <dl className="admin-kv">
          <KV label="Visit reason" value={intake.reasonTitle || booking.reason} />
          <KV label="Patient's notes" value={intake.notes} />
        </dl>
      </div>

      <div className="admin-section">
        <div className="admin-section-label">Clinical context</div>
        <dl className="admin-kv">
          <KV label="Duration" value={intake.duration} />
          <KV label="Severity" value={severityLabel(intake.severity)} />
          <KV label="Trend" value={trendLabel(intake.trend)} />
          <KV label="Tried so far" value={intake.priorTreatment} />
        </dl>
      </div>

      <div className="admin-section">
        <div className="admin-section-label">Medical background</div>
        <dl className="admin-kv">
          <KV label="Medications"
            value={intake.medications === "None" ? "None reported" : intake.medications} />
          <KV label="Allergies"
            value={intake.allergies === "NKDA" ? "No known drug allergies" : intake.allergies} />
        </dl>
      </div>

      {events.length > 0 && (
        <div className="admin-section">
          <div className="admin-section-label">Activity</div>
          <div className="admin-timeline">
            <div className="ev">
              <span className="ico" />
              <span className="lbl">Request submitted by patient</span>
              <span className="time">{booking.createdAt ? relativeTime(booking.createdAt) : ""}</span>
            </div>
            {events.map((e, i) => (
              <div key={i} className={"ev " + (e.action === "confirmed" ? "ev-pos" : "ev-neg")}>
                <span className="ico" />
                <span className="lbl">
                  {e.action === "confirmed" ? "Confirmed by admin" : "Declined by admin"}
                </span>
                <span className="time">{relativeTime(e.at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-actions">
        {booking.status === "pending" ? (
          <>
            <button className="btn btn-primary" onClick={() => onConfirm(booking.id)}>
              <Icon name="check" size={14} /> Confirm appointment
            </button>
            <button className="btn btn-secondary" onClick={() => onDecline(booking.id)}>
              Decline request
            </button>
            <span className="spacer" />
            <span className="admin-history">Patient will be notified via {intake.contact || "Text"}.</span>
          </>
        ) : booking.status === "confirmed" ? (
          <>
            <span className="admin-history">
              <b style={{ color: "var(--pos)" }}>Confirmed</b> — patient notified.
            </span>
            <span className="spacer" />
            <button className="btn btn-ghost" onClick={() => onDecline(booking.id)} style={{ color: "var(--ink-2)" }}>
              Decline instead
            </button>
          </>
        ) : (
          <>
            <span className="admin-history">
              <b style={{ color: "var(--ink-1)" }}>Declined.</b> Patient saw the decision in their Visits list.
            </span>
            <span className="spacer" />
            <button className="btn btn-secondary" onClick={() => onConfirm(booking.id)}>
              Reopen as confirmed
            </button>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AppointmentDetail });

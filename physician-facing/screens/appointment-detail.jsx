// Physician console — appointment detail (full intake view + actions)

const TREND_LABELS = { improving: "Improving", same: "About the same", worsening: "Getting worse" };

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }

function formatDOB(dob) {
  if (!dob) return "";
  const d = new Date(dob);
  return isNaN(d) ? dob : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
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

function KV({ label, value, mono }) {
  const isEmpty = value === null || value === undefined || value === "";
  return (
    <>
      <dt>{label}</dt>
      <dd className={isEmpty ? "empty" : (mono ? "mono" : "")}>{isEmpty ? "—" : value}</dd>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className="admin-section">
      <div className="admin-section-label">{title}</div>
      <dl className="admin-kv">{children}</dl>
    </div>
  );
}

function ActionFooter({ booking, intake, onConfirm, onDecline }) {
  if (booking.status === "pending") return (
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
  );
  if (booking.status === "confirmed") return (
    <>
      <span className="admin-history">
        <b style={{ color: "var(--pos)" }}>Confirmed</b> — patient notified.
      </span>
      <span className="spacer" />
      <button className="btn btn-ghost" style={{ color: "var(--ink-2)" }}
              onClick={() => onDecline(booking.id)}>
        Decline instead
      </button>
    </>
  );
  if (booking.status === "cancelled") return (
    <span className="admin-history">
      <b style={{ color: "var(--ink-1)" }}>Cancelled by patient.</b> No further action needed.
    </span>
  );
  return (
    <>
      <span className="admin-history">
        <b style={{ color: "var(--ink-1)" }}>Declined.</b> Patient saw the decision in their Visits list.
      </span>
      <span className="spacer" />
      <button className="btn btn-secondary" onClick={() => onConfirm(booking.id)}>
        Reopen as confirmed
      </button>
    </>
  );
}

function AppointmentDetail({ booking, onClose, onConfirm, onDecline }) {
  if (!booking) return null;
  const p = physicianById(booking.physicianId);
  const intake = booking.intake || {};
  const appt = booking.appointment || {};
  const patient = booking.patient || {};
  const iso = appt.dateISO || booking.dateISO;
  const longDate = iso ? formatDayLong(new Date(iso + "T00:00:00")) : booking.date;
  const age = ageFrom(patient.dob);
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

      {intake.severity === "severe" && booking.status === "pending" && (
        <div className="admin-urgent-banner">
          <Icon name="info" size={14} />
          <span><b>Severe symptoms reported.</b> Consider prioritizing this request.</span>
        </div>
      )}

      <Section title="Patient">
        <KV label="Name" value={patient.name} />
        <KV label="Age / DOB" value={age != null ? `${age} years · ${formatDOB(patient.dob)}` : formatDOB(patient.dob)} />
        <KV label="Member ID" value={patient.memberId} mono />
        <KV label="Phone" value={patient.phone} />
        <KV label="Email" value={patient.email} />
        <KV label="Preferred contact" value={intake.contact} />
      </Section>

      <Section title="Appointment">
        <KV label="Physician" value={p ? `${p.name}, ${p.credentials}` : "—"} />
        <KV label="Specialty" value={p ? p.specialty : ""} />
        <KV label="When"
            value={longDate ? `${longDate} · ${appt.time || booking.time} (${timeUntil(iso)})` : ""} />
        <KV label="Visit type"
            value={appt.visitType ? (appt.visitType === "virtual" ? "Virtual" : "In-person") : ""} />
        <KV label="Location" value={appt.location || (p && p.location)} />
      </Section>

      <Section title="Chief complaint">
        <KV label="Visit reason" value={intake.reasonTitle || booking.reason} />
        <KV label="Patient's notes" value={intake.notes} />
      </Section>

      <Section title="Clinical context">
        <KV label="Duration" value={intake.duration} />
        <KV label="Severity" value={capitalize(intake.severity)} />
        <KV label="Trend"    value={TREND_LABELS[intake.trend] || ""} />
        <KV label="Tried so far" value={intake.priorTreatment} />
      </Section>

      <Section title="Medical background">
        <KV label="Medications" value={intake.medications === "None" ? "None reported" : intake.medications} />
        <KV label="Allergies"   value={intake.allergies === "NKDA" ? "No known drug allergies" : intake.allergies} />
      </Section>

      {events.length > 0 && (
        <div className="admin-section">
          <div className="admin-section-label">Activity</div>
          <div className="admin-timeline">
            <div className="ev">
              <span className="ico" />
              <span className="lbl">Request submitted by patient</span>
              <span className="time">{booking.createdAt ? relativeTime(booking.createdAt) : ""}</span>
            </div>
            {events.map((e, i) => {
              const label = e.action === "confirmed" ? "Confirmed by admin"
                          : e.action === "cancelled" ? "Cancelled by patient"
                          : "Declined by admin";
              return (
                <div key={i} className={"ev " + (e.action === "confirmed" ? "ev-pos" : "ev-neg")}>
                  <span className="ico" />
                  <span className="lbl">{label}</span>
                  <span className="time">{relativeTime(e.at)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="admin-actions">
        <ActionFooter booking={booking} intake={intake}
                      onConfirm={onConfirm} onDecline={onDecline} />
      </div>
    </div>
  );
}

Object.assign(window, { AppointmentDetail });

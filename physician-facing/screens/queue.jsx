// Physician console — queue (list of incoming bookings)

function StatusPill({ status }) {
  if (status === "confirmed") return <span className="tag tag-pos"><span className="dot" /> Confirmed</span>;
  if (status === "declined")  return <span className="tag tag-muted">Declined</span>;
  if (status === "cancelled") return <span className="tag tag-muted">Cancelled by patient</span>;
  return <span className="tag tag-warn"><span className="dot" /> Pending</span>;
}

function SeverityBadge({ severity }) {
  if (!severity) return null;
  const label = severity[0].toUpperCase() + severity.slice(1);
  return (
    <span className={"sev sev-" + severity}>
      <span className="dot" />
      {label}
    </span>
  );
}

function TrendIndicator({ trend }) {
  if (!trend) return null;
  if (trend === "worsening") return <span className="trend up">↑ Worsening</span>;
  if (trend === "improving") return <span className="trend down">↓ Improving</span>;
  return <span className="trend flat">→ Stable</span>;
}

function timeUntil(dateISO) {
  if (!dateISO) return "";
  const target = new Date(dateISO + "T00:00:00");
  if (isNaN(target)) return "";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((target - today) / 86400000);
  if (days < 0)  return `${Math.abs(days)}d ago`;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 7)  return `in ${days}d`;
  if (days < 14) return "next week";
  return `in ${Math.round(days / 7)}w`;
}

function initialsOf(name) {
  if (!name) return "?";
  return name.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function QueueRow({ booking, selected, onSelect }) {
  const p = physicianById(booking.physicianId);
  const intake = booking.intake ?? {};
  const appt = booking.appointment ?? {};
  const iso = appt.dateISO ?? booking.dateISO;
  const dateObj = iso ? new Date(iso + "T00:00:00") : null;
  const dayLabel = dateObj
    ? dateObj.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
    : (booking.date ?? "");
  const urgent = intake.severity === "severe";
  const patientName = booking.patient?.name ?? "—";

  return (
    <button
      type="button"
      className={
        "admin-row " +
        (selected ? "is-selected " : "") +
        (urgent && booking.status === "pending" ? "is-urgent" : "")
      }
      onClick={() => onSelect(booking.id)}>
      <div className="avatar-sm">{initialsOf(patientName)}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="pname">{patientName}</span>
          <StatusPill status={booking.status} />
          <SeverityBadge severity={intake.severity} />
        </div>
        <div className="meta-row">
          <span style={{ color: "var(--ink-1)" }}>
            {intake.reasonTitle ?? booking.reason ?? "Visit"}
          </span>
          <span className="sep">·</span>
          <span>{p?.name ?? "Unknown"}</span>
          <span className="sep">·</span>
          <span style={{ color: "var(--ink-3)" }}>{p?.specialty ?? ""}</span>
          {intake.duration && <><span className="sep">·</span><span>{intake.duration}</span></>}
        </div>
      </div>
      <div className="right-col">
        <div className="when-line">
          {dayLabel} · {appt.time ?? booking.time}
          <div className="rel">{timeUntil(iso)}</div>
        </div>
        <span className="submitted">
          {booking.createdAt ? "submitted " + relativeTime(booking.createdAt) : ""}
        </span>
      </div>
    </button>
  );
}

function Queue({ bookings, selectedId, onSelect }) {
  if (!bookings.length) {
    return (
      <div className="admin-list">
        <div className="admin-empty">
          <div style={{ fontSize: 14, marginBottom: 6 }}>No requests match these filters.</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
            New patient bookings will appear here automatically.
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="admin-list">
      {bookings.map((b) => (
        <QueueRow key={b.id} booking={b} selected={b.id === selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}

Object.assign(window, { Queue, StatusPill, SeverityBadge, TrendIndicator, timeUntil, initialsOf });

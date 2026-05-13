// Screens: Visit details (reason) + Review + Confirmation

const FLOW_STEPS = ["Choose physician", "Pick a time", "Visit details", "Review & submit"];

const SEVERITY_OPTS = [
  { id: "mild",     label: "Mild",     desc: "Noticeable, not limiting" },
  { id: "moderate", label: "Moderate", desc: "Interferes with daily activities" },
  { id: "severe",   label: "Severe",   desc: "Hard to function" },
];
const TREND_OPTS = [
  { id: "improving", label: "Improving" },
  { id: "same",      label: "About the same" },
  { id: "worsening", label: "Getting worse" },
];
const DURATION_OPTS = ["< 24 hours", "1–3 days", "4–7 days", "1–4 weeks", "1–3 months", "> 3 months"];

const fromISO = (iso) => new Date(iso + "T00:00:00");
const shortDate = (iso) =>
  fromISO(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

function ApptPill({ physician, draft }) {
  return (
    <div className="appt-pill">
      <b>{physician.name}</b>
      <span className="sep">•</span>
      <span className="mono">{shortDate(draft.dateISO)}</span>
      <span className="sep">•</span>
      <span className="mono">{draft.time}</span>
    </div>
  );
}

function ReasonScreen({ physician, draft, setDraft, onBack, onContinue }) {
  const set = (patch) => setDraft({ ...draft, ...patch });

  return (
    <div className="page">
      <button className="crumb" onClick={onBack}>
        <Icon name="arrow_l" size={14} /> Back
      </button>

      <Stepper steps={FLOW_STEPS} current={2} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Tell us about your visit</h1>
          <p className="page-sub">
            A few quick details so {physician.name.split(" ")[1]} can prepare ahead of time.
          </p>
        </div>
      </div>

      <ApptPill physician={physician} draft={draft} />

      <div className="card">
        <FormBlock label="Reason for visit" required>
          <div className="radio-cards">
            {REASONS.map((r) => (
              <button key={r.id} type="button"
                className={"radio-card " + (draft.reason === r.id ? "is-active" : "")}
                onClick={() => set({ reason: r.id })}>
                <span className="rc-radio" />
                <span className="rc-title">{r.title}</span>
                <span className="rc-desc">{r.desc}</span>
              </button>
            ))}
          </div>
        </FormBlock>

        <FormBlock label="Anything we should know?" optional>
          <textarea className="textarea"
            placeholder="e.g. Persistent cough for the past 10 days, worse at night. No fever."
            value={draft.notes ?? ""}
            onChange={(e) => set({ notes: e.target.value })}
            maxLength={500} />
          <div className="field-help" style={{ textAlign: "right", marginTop: 4 }}>
            {(draft.notes ?? "").length} / 500
          </div>
        </FormBlock>

        <FormBlock label="How long have you had this?">
          <ChipGroup options={DURATION_OPTS} value={draft.duration} onChange={(v) => set({ duration: v })} />
        </FormBlock>

        <FormBlock label="How severe is it right now?">
          <ChipGroup options={SEVERITY_OPTS} value={draft.severity} onChange={(v) => set({ severity: v })} />
        </FormBlock>

        <FormBlock label="Is it changing?">
          <ChipGroup options={TREND_OPTS} value={draft.trend} onChange={(v) => set({ trend: v })} />
        </FormBlock>

        <FormBlock label="What have you tried so far?" optional>
          <textarea className="textarea"
            placeholder="e.g. OTC ibuprofen 400 mg twice daily, rest. Some short-term relief."
            value={draft.priorTreatment ?? ""}
            onChange={(e) => set({ priorTreatment: e.target.value })}
            maxLength={300} />
        </FormBlock>

        <NoneField label="Current medications"
          noneValue="None" noneLabel="I don't take any"
          placeholder="List medication, dose, and frequency. e.g. Lisinopril 10 mg daily; Atorvastatin 20 mg nightly."
          value={draft.medications} onChange={(v) => set({ medications: v })} maxLength={500} />

        <NoneField label="Allergies" last
          noneValue="NKDA" noneLabel="No known allergies"
          placeholder="Include drug, food, or environmental allergies and reaction type. e.g. Penicillin — hives."
          value={draft.allergies} onChange={(v) => set({ allergies: v })} maxLength={300} />
      </div>

      <div className="footbar">
        <div className="summary-text">
          With <b>{physician.name}</b> · <b>{shortDate(draft.dateISO)} · {draft.time}</b>
        </div>
        <div className="row gap-2">
          <button className="btn btn-secondary" onClick={onBack}>Back</button>
          <button className="btn btn-primary" disabled={!draft.reason} onClick={onContinue}>
            Continue <Icon name="arrow_r" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FormBlock({ label, optional, required, trailing, last, children }) {
  return (
    <div style={{ padding: "20px 24px", borderBottom: last ? "0" : "1px solid var(--line)" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, marginBottom: 10,
      }}>
        <label style={{
          fontSize: 13, fontWeight: 600, color: "var(--ink-1)",
          letterSpacing: "0.01em", margin: 0,
        }}>
          {label}
          {optional && <span className="muted" style={{ fontWeight: 400, marginLeft: 8, fontSize: 12 }}>Optional</span>}
          {required && <span style={{ color: "var(--accent-dark)", fontWeight: 500, marginLeft: 6 }}>*</span>}
        </label>
        {trailing}
      </div>
      {children}
    </div>
  );
}

function ChipGroup({ options, value, onChange }) {
  const items = options.map((o) => typeof o === "string" ? { id: o, label: o } : o);
  return (
    <div className="row gap-2" style={{ flexWrap: "wrap" }}>
      {items.map((o) => (
        <button key={o.id} type="button"
          className={"chip " + (value === o.id ? "is-active" : "")}
          onClick={() => onChange(o.id)}
          title={o.desc || undefined}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ToggleNone({ active, label, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      height: 26, padding: "0 10px",
      border: "1px solid " + (active ? "var(--accent)" : "var(--line)"),
      background: active ? "var(--accent-tint)" : "transparent",
      color: active ? "var(--accent-dark)" : "var(--ink-2)",
      borderRadius: 999, fontSize: 12.5, fontWeight: 500,
      display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
    }}>
      {active && <Icon name="check" size={12} />}
      {label}
    </button>
  );
}

function NoneField({ label, last, noneValue, noneLabel, placeholder, value, onChange, maxLength }) {
  const isNone = value === noneValue;
  return (
    <FormBlock label={label} last={last}
      trailing={<ToggleNone active={isNone} label={noneLabel}
        onClick={() => onChange(isNone ? "" : noneValue)} />}>
      <textarea className="textarea"
        placeholder={placeholder}
        value={isNone ? "" : (value ?? "")}
        disabled={isNone}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength} />
    </FormBlock>
  );
}

// ─── Review ─────────────────────────────────────────────────────

function SumRow({ label, onChange, children }) {
  return (
    <div className="sum-row">
      <div className="l">{label}</div>
      <div className="v">{children}</div>
      {onChange ? <button className="edit" onClick={onChange}>Change</button> : <div />}
    </div>
  );
}

function Field({ label, value, bold, capitalize }) {
  if (!value) return null;
  const v = bold ? <b style={capitalize ? { textTransform: "capitalize" } : null}>{value}</b> : value;
  return <div><span className="muted">{label}:</span> {v}</div>;
}

function ReviewScreen({ physician, draft, onBack, onJumpTo, onSubmit, submitting }) {
  const reasonObj = REASONS.find((r) => r.id === draft.reason);
  const hasClinical = draft.duration || draft.severity || draft.trend || draft.priorTreatment;
  const hasMedical  = draft.medications || draft.allergies;

  return (
    <div className="page">
      <button className="crumb" onClick={onBack}>
        <Icon name="arrow_l" size={14} /> Back
      </button>

      <Stepper steps={FLOW_STEPS} current={3} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Review your request</h1>
          <p className="page-sub">Confirm the details below. You can edit anything before submitting.</p>
        </div>
      </div>

      <div className="card">
        <SumRow label="Provider" onChange={() => onJumpTo("detail")}>
          <div><b>{physician.name}</b></div>
          <div className="muted" style={{ fontSize: 13 }}>
            {physician.credentials} · {physician.specialty}
          </div>
        </SumRow>

        <SumRow label="When" onChange={() => onJumpTo("detail")}>
          <span className="mono"><b>{formatDayLong(fromISO(draft.dateISO))}</b> · {draft.time}</span>
        </SumRow>

        <SumRow label="Visit type" onChange={() => onJumpTo("detail")}>
          <Icon name="building" size={13} /> In-person · {physician.location}
        </SumRow>

        <SumRow label="Reason" onChange={() => onJumpTo("reason")}>
          <b>{reasonObj ? reasonObj.title : "—"}</b>
          {draft.notes && (
            <div className="muted" style={{ fontSize: 13, marginTop: 4, maxWidth: 560 }}>
              "{draft.notes}"
            </div>
          )}
        </SumRow>

        {hasClinical && (
          <SumRow label="Clinical context" onChange={() => onJumpTo("reason")}>
            <div style={{ fontSize: 13 }}>
              <Field label="Duration" value={draft.duration} bold />
              <Field label="Severity" value={draft.severity} bold capitalize />
              <Field label="Trend"    value={draft.trend} bold capitalize />
              <Field label="Tried so far" value={draft.priorTreatment} />
            </div>
          </SumRow>
        )}

        {hasMedical && (
          <SumRow label="Medical background" onChange={() => onJumpTo("reason")}>
            <div style={{ fontSize: 13 }}>
              <Field label="Medications" value={draft.medications} />
              <Field label="Allergies"
                value={draft.allergies === "NKDA" ? "No known drug allergies" : draft.allergies} />
            </div>
          </SumRow>
        )}

        <SumRow label="Patient">
          <b>Bill Sato</b>
          <div className="muted" style={{ fontSize: 13 }}>
            DOB Aug 04, 1989 · Member ID <span className="mono">BC-4837-2210</span>
          </div>
        </SumRow>

        <SumRow label="Confirm via" onChange={() => onJumpTo("reason")}>
          {draft.contact || "Text"} · ending in 4421
        </SumRow>
      </div>

      <div className="notice">
        <div className="ico-circle"><Icon name="info" size={13} /></div>
        <div>
          <b>This is a request, not a confirmed appointment.</b>{" "}
          {physician.name.split(" ").slice(0, 2).join(" ")}'s office will confirm your slot within 24 hours.
          We'll notify you by {(draft.contact || "Text").toLowerCase()} as soon as it's confirmed.
          You may cancel for free up to 24 hours before your visit.
        </div>
      </div>

      <div className="footbar">
        <div className="summary-text">
          By submitting, you agree to vero's{" "}
          <a href="#" style={{ color: "var(--accent-dark)" }}>terms of service</a> and{" "}
          <a href="#" style={{ color: "var(--accent-dark)" }}>privacy policy</a>.
        </div>
        <div className="row gap-2">
          <button className="btn btn-secondary" onClick={onBack} disabled={submitting}>Back</button>
          <button className="btn btn-primary btn-lg" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit request"}
            {!submitting && <Icon name="check" size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirmation ───────────────────────────────────────────────

function TimelineStep({ state, num, title, desc }) {
  return (
    <div className={"tl-item " + (state || "")}>
      <span className="tl-dot">{state === "is-done" ? <Icon name="check" size={12} /> : num}</span>
      <div>
        <div className="tl-title">{title}</div>
        <div className="tl-desc">{desc}</div>
      </div>
    </div>
  );
}

function ConfirmationScreen({ physician, draft, requestId, onStartOver }) {
  const contact = (draft.contact || "Text").toLowerCase();
  return (
    <div className="page">
      <div className="confirm-wrap">
        <div className="card confirm-hero">
          <div className="confirm-icon">
            <Icon name="check" size={32} strokeWidth={2.2} />
          </div>
          <h1 className="confirm-title">Request submitted</h1>
          <p className="confirm-sub">
            We've sent your request to {physician.name}. You'll hear back within 24 hours.
          </p>
          <div className="confirm-id">
            <span className="muted">Request ID</span>
            <b>{requestId}</b>
          </div>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-pad" style={{ paddingBottom: 8 }}>
            <h3 className="section-h">Requested appointment</h3>
          </div>
          <SumRow label="Provider"><b>{physician.name}</b> · {physician.specialty}</SumRow>
          <SumRow label="When">
            <span className="mono"><b>{formatDayLong(fromISO(draft.dateISO))}</b> · {draft.time}</span>
          </SumRow>
          <SumRow label="Where">{physician.location}</SumRow>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-pad" style={{ paddingBottom: 0 }}>
            <h3 className="section-h">What happens next</h3>
          </div>
          <div className="timeline">
            <TimelineStep state="is-done" num="1"
              title="Request submitted"
              desc="Just now — we've forwarded your request to the office." />
            <TimelineStep state="is-active" num="2"
              title="Provider reviews & confirms"
              desc={`Within 24 hours · we'll ${contact} you ending in 4421.`} />
            <TimelineStep num="3"
              title="Intake forms (5 min)"
              desc="Quick health history, sent the day before your visit." />
            <TimelineStep num="4"
              title="Your visit"
              desc={`Arrive 10 minutes early at ${physician.location.split(" — ")[0]}.`} />
          </div>
        </div>

        <div className="row gap-2" style={{ marginTop: 20, flexWrap: "wrap" }}>
          <button className="btn btn-secondary">
            <Icon name="add_cal" size={16} /> Add tentative to calendar
          </button>
          <button className="btn btn-secondary">
            <Icon name="download" size={16} /> Download summary
          </button>
          <div className="flex-1" />
          <button className="btn btn-ghost" onClick={onStartOver}>
            Find another visit
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReasonScreen, ReviewScreen, ConfirmationScreen });

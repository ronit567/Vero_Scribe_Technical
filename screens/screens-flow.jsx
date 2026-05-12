// Screens: Visit details (reason) + Review + Confirmation
// Globals: Icon, PhotoPlaceholder, Stepper, REASONS, formatDayLong

// ════════════════════════════════════════════════════════════════
//  REASON / VISIT DETAILS
// ════════════════════════════════════════════════════════════════

function ReasonScreen({ physician, draft, setDraft, onBack, onContinue }) {
  const canContinue = !!draft.reason;
  const apptDate = draft.dateISO
    ? new Date(draft.dateISO + "T00:00:00").toLocaleDateString(undefined,
        { weekday: "short", month: "short", day: "numeric" })
    : "";

  return (
    <div className="page">
      <button className="crumb" onClick={onBack}>
        <Icon name="arrow_l" size={14} /> Back
      </button>

      <Stepper steps={["Choose physician", "Pick a time", "Visit details", "Review & submit"]} current={2} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Tell us about your visit</h1>
          <p className="page-sub">
            A few quick details so {physician.name.split(" ")[1]} can prepare ahead of time.
          </p>
        </div>
      </div>

      {/* Appointment context strip */}
      <div className="card" style={{
        padding: "12px 16px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
        background: "var(--surface-2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
          <Icon name="user" size={14} />
          <b>{physician.name}</b>
          <span className="muted">· {physician.specialty}</span>
        </div>
        <div style={{ width: 1, height: 16, background: "var(--line)" }} />
        <div className="mono" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--ink-1)" }}>
          <Icon name="calendar" size={13} /> {apptDate}
          <span style={{ color: "var(--ink-3)" }}>·</span>
          <Icon name="clock" size={13} /> {draft.time}
        </div>
      </div>

      <FormSection
        step={1}
        title="Reason for visit"
        hint="Pick the option that best describes why you're coming in.">
        <div className="radio-cards">
          {REASONS.map((r) => (
            <button key={r.id}
              type="button"
              className={"radio-card " + (draft.reason === r.id ? "is-active" : "")}
              onClick={() => setDraft({ ...draft, reason: r.id })}>
              <span className="rc-radio" />
              <span className="rc-title">{r.title}</span>
              <span className="rc-desc">{r.desc}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 20 }} className="field">
          <label className="field-label">
            Anything we should know? <span className="muted" style={{ fontWeight: 400 }}>Optional</span>
          </label>
          <textarea className="textarea"
            placeholder="e.g. Persistent cough for the past 10 days, worse at night. No fever."
            value={draft.notes || ""}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            maxLength={500} />
          <div className="field-help" style={{ textAlign: "right" }}>
            {(draft.notes || "").length} / 500
          </div>
        </div>
      </FormSection>

      <FormSection
        step={2}
        title="Clinical context"
        hint="Helps your provider triage and prepare. All required.">
        <FormField label="How long have you had this concern?">
          <ChipGroup
            options={["< 24 hours", "1–3 days", "4–7 days", "1–4 weeks", "1–3 months", "> 3 months"]}
            value={draft.duration}
            onChange={(v) => setDraft({ ...draft, duration: v })}
          />
        </FormField>

        <FormField label="How severe is it right now?">
          <ChipGroup
            options={[
              { id: "mild", label: "Mild", desc: "Noticeable, not limiting" },
              { id: "moderate", label: "Moderate", desc: "Interferes with daily activities" },
              { id: "severe", label: "Severe", desc: "Hard to function" },
            ]}
            value={draft.severity}
            onChange={(v) => setDraft({ ...draft, severity: v })}
          />
        </FormField>

        <FormField label="Is it changing?">
          <ChipGroup
            options={[
              { id: "improving", label: "Improving" },
              { id: "same", label: "About the same" },
              { id: "worsening", label: "Getting worse" },
            ]}
            value={draft.trend}
            onChange={(v) => setDraft({ ...draft, trend: v })}
          />
        </FormField>

        <FormField label="What have you tried so far?" optional>
          <textarea className="textarea"
            placeholder="e.g. OTC ibuprofen 400 mg twice daily, rest. Some short-term relief."
            value={draft.priorTreatment || ""}
            onChange={(e) => setDraft({ ...draft, priorTreatment: e.target.value })}
            maxLength={300} />
        </FormField>
      </FormSection>

      <FormSection
        step={3}
        title="Medical background"
        hint="We'll save this to your profile so you don't have to enter it again.">
        <NoneTextarea
          label="Current medications"
          noneValue="None"
          noneLabel="I don't take any"
          placeholder="List medication, dose, and frequency. e.g. Lisinopril 10 mg daily; Atorvastatin 20 mg nightly."
          value={draft.medications}
          onChange={(v) => setDraft({ ...draft, medications: v })}
          maxLength={500}
        />

        <NoneTextarea
          label="Allergies"
          noneValue="NKDA"
          noneLabel="No known allergies"
          placeholder="Include drug, food, or environmental allergies and reaction type. e.g. Penicillin — hives."
          value={draft.allergies}
          onChange={(v) => setDraft({ ...draft, allergies: v })}
          maxLength={300}
        />
      </FormSection>

      <div className="footbar">
        <div className="summary-text">
          With <b>{physician.name}</b> · <b>{
            new Date((draft.dateISO) + "T00:00:00").toLocaleDateString(undefined,
              { weekday: "short", month: "short", day: "numeric" })} · {draft.time}</b>
        </div>
        <div className="row gap-2">
          <button className="btn btn-secondary" onClick={onBack}>Back</button>
          <button className="btn btn-primary" disabled={!canContinue} onClick={onContinue}>
            Continue <Icon name="arrow_r" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSection({ step, title, hint, children }) {
  return (
    <div className="card card-pad" style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: hint ? 4 : 14 }}>
        <span style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "var(--accent-tint)", color: "var(--accent-dark)",
          fontSize: 12, fontWeight: 600,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>{step}</span>
        <h3 className="section-h" style={{ margin: 0 }}>{title}</h3>
      </div>
      {hint && (
        <p className="muted" style={{ margin: "0 0 16px 32px", fontSize: 13 }}>{hint}</p>
      )}
      {children}
    </div>
  );
}

function FormField({ label, optional, children }) {
  return (
    <div className="field" style={{ marginBottom: 18 }}>
      <label className="field-label">
        {label}
        {optional && <span className="muted" style={{ fontWeight: 400, marginLeft: 6 }}>Optional</span>}
      </label>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

function ChipGroup({ options, value, onChange }) {
  const items = options.map((o) => typeof o === "string" ? { id: o, label: o } : o);
  return (
    <div className="row gap-2" style={{ flexWrap: "wrap" }}>
      {items.map((o) => (
        <button key={o.id}
          type="button"
          className={"chip " + (value === o.id ? "is-active" : "")}
          onClick={() => onChange(o.id)}
          title={o.desc || undefined}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function NoneTextarea({ label, noneValue, noneLabel, placeholder, value, onChange, maxLength }) {
  const isNone = value === noneValue;
  return (
    <div className="field" style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <label className="field-label" style={{ margin: 0 }}>{label}</label>
        <button
          type="button"
          className={"chip " + (isNone ? "is-active" : "")}
          style={{ height: 26, fontSize: 12.5 }}
          onClick={() => onChange(isNone ? "" : noneValue)}>
          {isNone ? <><Icon name="check" size={12} /> {noneLabel}</> : noneLabel}
        </button>
      </div>
      <textarea className="textarea"
        placeholder={placeholder}
        value={isNone ? "" : (value || "")}
        disabled={isNone}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  REVIEW & SUBMIT
// ════════════════════════════════════════════════════════════════

function ReviewScreen({ physician, draft, onBack, onJumpTo, onSubmit, submitting }) {
  const dateObj = new Date(draft.dateISO + "T00:00:00");
  const reasonObj = REASONS.find((r) => r.id === draft.reason);

  return (
    <div className="page">
      <button className="crumb" onClick={onBack}>
        <Icon name="arrow_l" size={14} /> Back
      </button>

      <Stepper steps={["Choose physician", "Pick a time", "Visit details", "Review & submit"]} current={3} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Review your request</h1>
          <p className="page-sub">Confirm the details below. You can edit anything before submitting.</p>
        </div>
      </div>

      <div className="card">
        <div className="sum-row" style={{ gridTemplateColumns: "160px 1fr auto" }}>
          <div className="l">Provider</div>
          <div className="v">
            <div><b>{physician.name}</b></div>
            <div className="muted" style={{ fontSize: 13 }}>
              {physician.credentials} · {physician.specialty}
            </div>
          </div>
          <button className="edit" onClick={() => onJumpTo("detail")}>Change</button>
        </div>

        <div className="sum-row">
          <div className="l">When</div>
          <div className="v mono">
            <b>{formatDayLong(dateObj)}</b> · {draft.time}
          </div>
          <button className="edit" onClick={() => onJumpTo("detail")}>Change</button>
        </div>

        <div className="sum-row">
          <div className="l">Visit type</div>
          <div className="v">
            <Icon name="building" size={13} /> In-person · {physician.location}
          </div>
          <button className="edit" onClick={() => onJumpTo("detail")}>Change</button>
        </div>

        <div className="sum-row">
          <div className="l">Reason</div>
          <div className="v">
            <b>{reasonObj ? reasonObj.title : "—"}</b>
            {draft.notes && (
              <div className="muted" style={{ fontSize: 13, marginTop: 4, maxWidth: 560 }}>
                "{draft.notes}"
              </div>
            )}
          </div>
          <button className="edit" onClick={() => onJumpTo("reason")}>Change</button>
        </div>

        {(draft.duration || draft.severity || draft.trend || draft.priorTreatment) && (
          <div className="sum-row">
            <div className="l">Clinical context</div>
            <div className="v" style={{ fontSize: 13 }}>
              {draft.duration && <div><span className="muted">Duration:</span> <b>{draft.duration}</b></div>}
              {draft.severity && <div><span className="muted">Severity:</span> <b style={{ textTransform: "capitalize" }}>{draft.severity}</b></div>}
              {draft.trend && <div><span className="muted">Trend:</span> <b style={{ textTransform: "capitalize" }}>{draft.trend}</b></div>}
              {draft.priorTreatment && (
                <div style={{ marginTop: 4, maxWidth: 560 }}>
                  <span className="muted">Tried so far:</span> {draft.priorTreatment}
                </div>
              )}
            </div>
            <button className="edit" onClick={() => onJumpTo("reason")}>Change</button>
          </div>
        )}

        {(draft.medications || draft.allergies) && (
          <div className="sum-row">
            <div className="l">Medical background</div>
            <div className="v" style={{ fontSize: 13 }}>
              {draft.medications && (
                <div style={{ maxWidth: 560 }}>
                  <span className="muted">Medications:</span> {draft.medications}
                </div>
              )}
              {draft.allergies && (
                <div style={{ maxWidth: 560, marginTop: 4 }}>
                  <span className="muted">Allergies:</span> {draft.allergies === "NKDA" ? "No known drug allergies" : draft.allergies}
                </div>
              )}
            </div>
            <button className="edit" onClick={() => onJumpTo("reason")}>Change</button>
          </div>
        )}

        <div className="sum-row">
          <div className="l">Patient</div>
          <div className="v">
            <b>Bill Sato</b>
            <div className="muted" style={{ fontSize: 13 }}>
              DOB Aug 04, 1989 · Member ID <span className="mono">BC-4837-2210</span>
            </div>
          </div>
          <button className="edit">Change</button>
        </div>

        <div className="sum-row">
          <div className="l">Confirm via</div>
          <div className="v">{draft.contact || "Text"} · ending in 4421</div>
          <button className="edit" onClick={() => onJumpTo("reason")}>Change</button>
        </div>
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

// ════════════════════════════════════════════════════════════════
//  CONFIRMATION
// ════════════════════════════════════════════════════════════════

function ConfirmationScreen({ physician, draft, requestId, onStartOver }) {
  const dateObj = new Date(draft.dateISO + "T00:00:00");
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
          <div className="sum-row" style={{ borderTop: "1px solid var(--line)" }}>
            <div className="l">Provider</div>
            <div className="v"><b>{physician.name}</b> · {physician.specialty}</div>
            <div />
          </div>
          <div className="sum-row">
            <div className="l">When</div>
            <div className="v mono"><b>{formatDayLong(dateObj)}</b> · {draft.time}</div>
            <div />
          </div>
          <div className="sum-row">
            <div className="l">Where</div>
            <div className="v">
              {physician.location}
            </div>
            <div />
          </div>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-pad" style={{ paddingBottom: 0 }}>
            <h3 className="section-h">What happens next</h3>
          </div>
          <div className="timeline">
            <div className="tl-item is-done">
              <span className="tl-dot"><Icon name="check" size={12} /></span>
              <div>
                <div className="tl-title">Request submitted</div>
                <div className="tl-desc">Just now — we've forwarded your request to the office.</div>
              </div>
            </div>
            <div className="tl-item is-active">
              <span className="tl-dot">2</span>
              <div>
                <div className="tl-title">Provider reviews & confirms</div>
                <div className="tl-desc">
                  Within 24 hours · we'll {(draft.contact || "Text").toLowerCase()} you ending in 4421.
                </div>
              </div>
            </div>
            <div className="tl-item">
              <span className="tl-dot">3</span>
              <div>
                <div className="tl-title">Intake forms (5 min)</div>
                <div className="tl-desc">Quick health history, sent the day before your visit.</div>
              </div>
            </div>
            <div className="tl-item">
              <span className="tl-dot">4</span>
              <div>
                <div className="tl-title">Your visit</div>
                <div className="tl-desc">
                  Arrive 10 minutes early at {physician.location.split(" — ")[0]}.
                </div>
              </div>
            </div>
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

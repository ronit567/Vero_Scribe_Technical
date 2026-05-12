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

      {/* Appointment context — small inline pill */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "8px 12px", marginBottom: 18,
        background: "var(--surface)", border: "1px solid var(--line)",
        borderRadius: 999, fontSize: 13,
      }}>
        <b style={{ color: "var(--ink-0)" }}>{physician.name}</b>
        <span style={{ color: "var(--ink-4)" }}>•</span>
        <span className="mono" style={{ color: "var(--ink-1)" }}>{apptDate}</span>
        <span style={{ color: "var(--ink-4)" }}>•</span>
        <span className="mono" style={{ color: "var(--ink-1)" }}>{draft.time}</span>
      </div>

      <div className="card">
        <FormBlock label="Reason for visit" required>
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
        </FormBlock>

        <FormBlock label="Anything we should know?" optional>
          <textarea className="textarea"
            placeholder="e.g. Persistent cough for the past 10 days, worse at night. No fever."
            value={draft.notes || ""}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            maxLength={500} />
          <div className="field-help" style={{ textAlign: "right", marginTop: 4 }}>
            {(draft.notes || "").length} / 500
          </div>
        </FormBlock>

        <FormBlock label="How long have you had this?">
          <ChipGroup
            options={["< 24 hours", "1–3 days", "4–7 days", "1–4 weeks", "1–3 months", "> 3 months"]}
            value={draft.duration}
            onChange={(v) => setDraft({ ...draft, duration: v })}
          />
        </FormBlock>

        <FormBlock label="How severe is it right now?">
          <ChipGroup
            options={[
              { id: "mild", label: "Mild", desc: "Noticeable, not limiting" },
              { id: "moderate", label: "Moderate", desc: "Interferes with daily activities" },
              { id: "severe", label: "Severe", desc: "Hard to function" },
            ]}
            value={draft.severity}
            onChange={(v) => setDraft({ ...draft, severity: v })}
          />
        </FormBlock>

        <FormBlock label="Is it changing?">
          <ChipGroup
            options={[
              { id: "improving", label: "Improving" },
              { id: "same", label: "About the same" },
              { id: "worsening", label: "Getting worse" },
            ]}
            value={draft.trend}
            onChange={(v) => setDraft({ ...draft, trend: v })}
          />
        </FormBlock>

        <FormBlock label="What have you tried so far?" optional>
          <textarea className="textarea"
            placeholder="e.g. OTC ibuprofen 400 mg twice daily, rest. Some short-term relief."
            value={draft.priorTreatment || ""}
            onChange={(e) => setDraft({ ...draft, priorTreatment: e.target.value })}
            maxLength={300} />
        </FormBlock>

        <FormBlock label="Current medications"
          trailing={
            <ToggleNone
              active={draft.medications === "None"}
              label="I don't take any"
              onClick={() => setDraft({ ...draft, medications: draft.medications === "None" ? "" : "None" })}
            />
          }>
          <textarea className="textarea"
            placeholder="List medication, dose, and frequency. e.g. Lisinopril 10 mg daily; Atorvastatin 20 mg nightly."
            value={draft.medications && draft.medications !== "None" ? draft.medications : ""}
            disabled={draft.medications === "None"}
            onChange={(e) => setDraft({ ...draft, medications: e.target.value })}
            maxLength={500} />
        </FormBlock>

        <FormBlock label="Allergies" last
          trailing={
            <ToggleNone
              active={draft.allergies === "NKDA"}
              label="No known allergies"
              onClick={() => setDraft({ ...draft, allergies: draft.allergies === "NKDA" ? "" : "NKDA" })}
            />
          }>
          <textarea className="textarea"
            placeholder="Include drug, food, or environmental allergies and reaction type. e.g. Penicillin — hives."
            value={draft.allergies && draft.allergies !== "NKDA" ? draft.allergies : ""}
            disabled={draft.allergies === "NKDA"}
            onChange={(e) => setDraft({ ...draft, allergies: e.target.value })}
            maxLength={300} />
        </FormBlock>
      </div>

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

function FormBlock({ label, optional, required, trailing, last, children }) {
  return (
    <div style={{
      padding: "20px 24px",
      borderBottom: last ? "0" : "1px solid var(--line)",
    }}>
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

function ToggleNone({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 26, padding: "0 10px",
        border: "1px solid " + (active ? "var(--accent)" : "var(--line)"),
        background: active ? "var(--accent-tint)" : "transparent",
        color: active ? "var(--accent-dark)" : "var(--ink-2)",
        borderRadius: 999, fontSize: 12.5, fontWeight: 500,
        display: "inline-flex", alignItems: "center", gap: 6,
        cursor: "pointer",
      }}>
      {active && <Icon name="check" size={12} />}
      {label}
    </button>
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

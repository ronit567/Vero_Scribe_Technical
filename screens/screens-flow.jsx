// Screens: Visit details (reason) + Review + Confirmation
// Globals: Icon, PhotoPlaceholder, Stepper, REASONS, formatDayLong

// ════════════════════════════════════════════════════════════════
//  REASON / VISIT DETAILS
// ════════════════════════════════════════════════════════════════

function ReasonScreen({ physician, draft, setDraft, onBack, onContinue }) {
  const canContinue = !!draft.reason;
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
            This helps {physician.name.split(" ")[1]}{" "}
            prepare for your appointment.
          </p>
        </div>
      </div>

      <div className="card card-pad">
        <h3 className="section-h" style={{ marginBottom: 12 }}>What is the reason for your visit?</h3>
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

        <div style={{ marginTop: 24 }} className="field">
          <label className="field-label">
            Briefly describe what's going on <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>
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

        <div className="divider" />

        <div className="field" style={{ marginBottom: 16 }}>
          <label className="field-label">Is this your first visit with this provider?</label>
          <div className="row gap-2" style={{ marginTop: 4 }}>
            <button
              className={"chip " + (draft.patientStatus === "new" ? "is-active" : "")}
              onClick={() => setDraft({ ...draft, patientStatus: "new" })}>
              Yes — new patient
            </button>
            <button
              className={"chip " + (draft.patientStatus === "returning" ? "is-active" : "")}
              onClick={() => setDraft({ ...draft, patientStatus: "returning" })}>
              No — returning patient
            </button>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Preferred contact for confirmation</label>
          <div className="row gap-2" style={{ marginTop: 4 }}>
            {["Text", "Email", "Phone call"].map((m) => (
              <button key={m}
                className={"chip " + (draft.contact === m ? "is-active" : "")}
                onClick={() => setDraft({ ...draft, contact: m })}>
                {m}
              </button>
            ))}
          </div>
        </div>
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
          <div className="v" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PhotoPlaceholder label="MD" style={{ width: 44, height: 44, borderRadius: "50%" }} />
            <div>
              <div><b>{physician.name}</b></div>
              <div className="muted" style={{ fontSize: 13 }}>
                {physician.credentials} · {physician.specialty}
              </div>
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

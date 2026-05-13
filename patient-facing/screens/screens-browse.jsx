
function BrowseScreen({ filters, setFilters, onSelect }) {
  const languages = React.useMemo(() => {
    const set = new Set();
    PHYSICIANS.forEach((p) => (p.languages || []).forEach((l) => set.add(l)));
    return ["Any language", ...Array.from(set).sort()];
  }, []);

  const filtered = React.useMemo(() => {
    return PHYSICIANS.filter((p) => {
      if (filters.q) {
        const q = filters.q.toLowerCase();
        if (!p.name.toLowerCase().includes(q) &&
            !p.specialty.toLowerCase().includes(q) &&
            !(p.subspecialty || "").toLowerCase().includes(q)) return false;
      }
      if (filters.specialty && filters.specialty !== "All specialties") {
        if (p.specialty !== filters.specialty) return false;
      }
      if (filters.language && filters.language !== "Any language") {
        if (!(p.languages || []).includes(filters.language)) return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Find a physician</h1>
          <p className="page-sub">Browse providers in your area and book an appointment</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filterbar" style={{ gridTemplateColumns: "minmax(260px, 2fr) 1fr" }}>
        <div className="input-with-icon">
          <span className="ico"><Icon name="search" size={16} /></span>
          <input className="input" type="text"
            placeholder="Search by name, specialty, or condition"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        </div>
        <select className="select"
          value={filters.specialty}
          onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}>
          {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Quick chips */}
      <div className="filterchips">
        <button
          className={"chip " + (filters.thisWeek ? "is-active" : "")}
          onClick={() => setFilters({ ...filters, thisWeek: !filters.thisWeek })}>
          {filters.thisWeek && <Icon name="check" size={13} />}
          Available this week
        </button>
        <label className={"chip " + (filters.language && filters.language !== "Any language" ? "is-active" : "")}
          style={{ cursor: "pointer" }}>
          <Icon name="language" size={13} />
          <select className="chip-select"
            value={filters.language || "Any language"}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}>
            {languages.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <button className="chip">
          <Icon name="filter" size={13} /> More filters
        </button>
      </div>

      <div className="resultbar">
        <div className="count">
          <b>{filtered.length}</b> {filtered.length === 1 ? "provider" : "providers"} match your filters
        </div>
        <select className="select" style={{ width: 180, height: 32, fontSize: 13 }}>
          <option>Best match</option>
          <option>Soonest available</option>
          <option>Highest rated</option>
          <option>Nearest to me</option>
        </select>
      </div>

      <PhysicianCards list={filtered} onSelect={onSelect} />

      {filtered.length === 0 && (
        <div className="card card-pad" style={{ textAlign: "center", color: "var(--ink-2)" }}>
          No providers match your filters. Try widening your search.
        </div>
      )}
    </div>
  );
}

function nextAvailText(days) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function hasSlots(physicianId, iso) {
  const s = slotsFor(physicianId, iso);
  return s.morning.length + s.afternoon.length + s.evening.length > 0;
}

function PhysicianCards({ list, onSelect }) {
  return (
    <div className="cards-grid">
      {list.map((p) => (
        <div key={p.id} className="doc-card" onClick={() => onSelect(p.id)}>
          <PhotoPlaceholder image={physicianAvatar(p)} />
          <div className="doc-card-body">
            <div className="row gap-2" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="doc-name">{p.name}</div>
                <div className="doc-cred">{p.credentials} · {p.specialty}</div>
              </div>
            </div>
            <div className="doc-spec">{p.subspecialty}</div>
            <div className="doc-meta-row">
              <span className="it"><Icon name="pin" size={13} /> {p.location.split(" — ")[0]}{p.distanceMi ? ` · ${p.distanceMi} km` : ""}</span>
              <span className="it"><Icon name="language" size={13} /> {p.languages.slice(0, 2).join(", ")}</span>
            </div>
            <div className="doc-meta-row" style={{ marginTop: 6 }}>
              <Rating rating={p.rating} reviews={p.reviews} />
              {p.accepting
                ? <span className="tag tag-pos"><span className="dot" /> Accepting new patients</span>
                : <span className="tag">Waitlist</span>}
            </div>
            <div className="doc-foot">
              <div className="next-avail">Next available <b>{nextAvailText(p.nextAvail)}</b></div>
              <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); onSelect(p.id); }}>
                View profile
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  PHYSICIAN DETAIL  — bio + integrated date/time picker
// ════════════════════════════════════════════════════════════════

function DetailScreen({ physician, draft, setDraft, onBack, onContinue, rescheduleMode }) {
  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [weekStart, setWeekStart] = React.useState(today);

  // In-person only
  React.useEffect(() => {
    if (draft.visitType !== "in-person") {
      setDraft({ ...draft, visitType: "in-person" });
    }
  }, [physician.id]);

  // 7-day strip
  const days = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const selectedDate = draft.dateISO || toISO(addDays(today, physician.nextAvail));
  const slots = React.useMemo(() => slotsFor(physician.id, selectedDate),
                              [physician.id, selectedDate]);
  const totalSlots = slots.morning.length + slots.afternoon.length + slots.evening.length;

  const canPrev = weekStart > today;
  const goPrev = () => canPrev && setWeekStart(addDays(weekStart, -7));
  const goNext = () => setWeekStart(addDays(weekStart, 7));

  const selectDate = (iso) => setDraft({ ...draft, dateISO: iso, time: null });
  const selectTime = (t) => setDraft({ ...draft, time: t });

  return (
    <div className="page">
      <button className="crumb" onClick={onBack}>
        <Icon name="arrow_l" size={14} /> {rescheduleMode ? "Back to visits" : "Back to results"}
      </button>

      <div className="detail-grid">
        {/* Left column */}
        <div>
          <div className="card detail-hero">
            <PhotoPlaceholder image={physicianAvatar(physician)} style={{ width: 120, height: 120, borderRadius: 16 }} />
            <div>
              <h1 className="detail-h1">{physician.name}</h1>
              <div className="detail-cred">{physician.credentials} · {physician.specialty}</div>
              <div className="row gap-3" style={{ marginTop: 10, flexWrap: "wrap" }}>
                <Rating rating={physician.rating} reviews={physician.reviews} />
                {physician.accepting
                  ? <span className="tag tag-pos"><span className="dot" /> Accepting new patients</span>
                  : <span className="tag">Waitlist only</span>}

              </div>
              <div className="detail-stats">
                <div className="stat">
                  <div className="l">Experience</div>
                  <div className="v">{physician.years}<small>yrs</small></div>
                </div>
                <div className="stat">
                  <div className="l">Languages</div>
                  <div className="v" style={{ fontSize: 14, fontFamily: "var(--font-ui)" }}>
                    {physician.languages.join(" · ")}
                  </div>
                </div>
                <div className="stat">
                  <div className="l">Distance</div>
                  <div className="v">
                    {physician.distanceMi ? <>{physician.distanceMi}<small>km</small></> : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="detail-section" style={{ borderTop: 0 }}>
              <h3 className="section-h">About</h3>
              <p className="bio">{physician.bio}</p>
            </div>
            <div className="detail-section">
              <h3 className="section-h">Practice details</h3>
              <dl className="kv">
                <dt>Specialty</dt>
                <dd>{physician.specialty} — {physician.subspecialty}</dd>
                <dt>Board certified</dt>
                <dd>{physician.boardCert}</dd>
                <dt>Location</dt>
                <dd>{physician.location}</dd>
                <dt>Languages</dt>
                <dd>{physician.languages.join(", ")}</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Right column — booking sidebar */}
        <div className="card booking">
          <h3>{rescheduleMode ? "Pick a new time" : "Request an appointment"}</h3>

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 10, marginBottom: 16, fontSize: 13, color: "var(--ink-1)" }}>
            <Icon name="building" size={14} />
            <span>In-person at <b style={{ color: "var(--ink-0)", fontWeight: 600 }}>{physician.location.split(" — ")[0]}</b></span>
          </div>

          {/* Date strip */}
          <div className="datestrip-h">
            <div className="label">{weekStart.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</div>
            <div className="nav">
              <button disabled={!canPrev} onClick={goPrev} aria-label="Previous week">
                <Icon name="chev_l" size={14} />
              </button>
              <button onClick={goNext} aria-label="Next week">
                <Icon name="chev_r" size={14} />
              </button>
            </div>
          </div>
          <div className="datestrip">
            {days.map((d) => {
              const iso = toISO(d);
              const has = hasSlots(physician.id, iso);
              return (
                <button key={iso}
                  className={"dpill " + (selectedDate === iso ? "is-active" : "")}
                  disabled={!has}
                  onClick={() => selectDate(iso)}>
                  <span className="dow">{d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3)}</span>
                  <span className="dnum">{d.getDate()}</span>
                  {has && <span className="dot" />}
                </button>
              );
            })}
          </div>

          {/* Slot groups */}
          {totalSlots === 0 ? (
            <div className="slots-empty">No openings on this day. Pick another date.</div>
          ) : (
            <>
              <SlotGroup label="Morning"   slots={slots.morning}   selected={draft.time} onPick={selectTime} />
              <SlotGroup label="Afternoon" slots={slots.afternoon} selected={draft.time} onPick={selectTime} />
              <SlotGroup label="Evening"   slots={slots.evening}   selected={draft.time} onPick={selectTime} />
            </>
          )}

          {/* Selected summary */}
          {draft.time && (
            <div className="booking-selected" style={{ marginTop: 12 }}>
              <Icon name="calendar" size={13} />{" "}
              <b>{new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined,
                { weekday: "short", month: "short", day: "numeric" })} · {draft.time}</b>
              <div style={{ color: "var(--ink-2)", marginTop: 2 }}>
                {physician.location.split(" — ")[0]}
              </div>
            </div>
          )}

          <button
            className="btn btn-primary btn-lg btn-block"
            disabled={!draft.time}
            onClick={onContinue}>
            {rescheduleMode ? <>Confirm reschedule <Icon name="check" size={16} /></> : <>Continue <Icon name="arrow_r" size={16} /></>}
          </button>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 10, textAlign: "center" }}>
            {rescheduleMode
              ? "Office re-confirms your new time within 24 hours"
              : "Provider confirms within 24 hours"}
          </div>
        </div>
      </div>
    </div>
  );
}

function SlotGroup({ label, slots, selected, onPick }) {
  if (slots.length === 0) return null;
  return (
    <div className="slot-group">
      <div className="slot-group-label">{label}</div>
      <div className="slots">
        {slots.map((t) => (
          <button key={t}
            className={"slot " + (selected === t ? "is-active" : "")}
            onClick={() => onPick(t)}>{t}</button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { BrowseScreen, DetailScreen });

// Patient-facing components — PhotoPlaceholder, Stepper, Rating, avatar helper.
// Icon + date helpers live in shared/ui.jsx and are already on `window`.

function PhotoPlaceholder({ style, className, image }) {
  const cls = ["photo", "photo--img", className].filter(Boolean).join(" ");
  return (
    <div className={cls} style={style}>
      <img src={image} alt="" loading="lazy" />
    </div>
  );
}

function Stepper({ steps, current }) {
  return (
    <div className="stepper" aria-label="Booking progress">
      {steps.map((label, i) => {
        const state = i < current ? "is-done" : i === current ? "is-active" : "";
        return (
          <React.Fragment key={i}>
            <div className={"step " + state}>
              <span className="num">{i < current ? "✓" : i + 1}</span>
              <span>{label}</span>
            </div>
            {i < steps.length - 1 && <div className="step-sep" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Rating({ rating, reviews }) {
  return (
    <span className="row gap-2" style={{ color: "var(--ink-1)", fontSize: 13 }}>
      <span style={{ color: "#E0A800", display: "inline-flex", alignItems: "center" }}>
        <Icon name="star" size={14} strokeWidth={1.5} />
      </span>
      <b style={{ fontWeight: 600, color: "var(--ink-0)" }}>{rating.toFixed(1)}</b>
      <span style={{ color: "var(--ink-3)" }}>({reviews})</span>
    </span>
  );
}

function physicianAvatar(p) {
  const topOverride = p.id === "reiss" ? "&top=bob,straight01,straight02,curly,bigHair" : "";
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(p.id)}&clothing=blazerAndShirt&clothesColor=ffffff&accessories=prescription02,prescription01,round&accessoriesProbability=70&mouth=smile&eyes=default&eyebrows=default${topOverride}&backgroundColor=eaf2ff,e0ecff,dbeafe`;
}

Object.assign(window, { PhotoPlaceholder, Stepper, Rating, physicianAvatar });

export function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export function NumberInput({ value, onChange, min, max, className = "" }) {
  return (
    <input
      type="number"
      className={`input ${className}`}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

export function TabButton({ active, onClick, children }) {
  return (
    <button className={`tab ${active ? "active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function IconButton({ onClick, disabled, title, children }) {
  return (
    <button className="icon-btn" onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  );
}

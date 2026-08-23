export default function Legend({ processes, algo }) {
  return (
    <div className="legend">
      {processes.map((p) => (
        <span key={p.id} className="legend-item">
          <span className="swatch" style={{ background: p.color }} />
          {p.id}{" "}
          <span className="legend-dim">
            (arr {p.arrival}, burst {p.burst}
            {algo === "cfs" ? `, nice ${p.nice}` : ""}
            {(algo === "priorityNP" || algo === "priorityP") ? `, priority ${p.priority}` : ""})
          </span>
        </span>
      ))}
    </div>
  );
}

export default function LiveState({ snap, algo, mlfqQuantums, colorOf }) {
  return (
    <div className="live-row">
      <div className="panel cpu-panel">
        <div className="panel-label">cpu</div>
        <div
          className="cpu-box"
          style={
            snap.running
              ? {
                  background: colorOf(snap.running),
                  border: `1px solid ${colorOf(snap.running)}`,
                  color: "#171513",
                }
              : undefined
          }
        >
          {snap.running || "idle"}
        </div>
        {algo === "mlfq" && snap.running && <div className="cpu-level">level {snap.level}</div>}
      </div>

      <div className="panel queue-panel">
        <div className="panel-label">ready queue{algo === "cfs" ? " (ordered by vruntime)" : ""}</div>

        {algo === "mlfq" ? (
          <div>
            {mlfqQuantums.map((_, lvl) => {
              const items = snap.ready.filter((r) => r.level === lvl);
              return (
                <div key={lvl} className="queue-row">
                  <span className="queue-level-label">L{lvl}</span>
                  <div className="queue-chips">
                    {items.length === 0 && <span className="queue-empty">-</span>}
                    {items.map((r) => (
                      <span key={r.pid} className="queue-chip small" style={{ background: colorOf(r.pid) }}>
                        {r.pid}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="queue-chips">
            {snap.ready.length === 0 && <span className="queue-empty">empty</span>}
            {snap.ready.map((r, i) => (
              <span
                key={r.pid}
                className="queue-chip"
                style={{ background: colorOf(r.pid), opacity: 1 - i * 0.03 }}
              >
                {r.pid}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

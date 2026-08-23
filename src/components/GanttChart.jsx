export default function GanttChart({ segments, tick, maxTick, pxPerTick, colorOf }) {
  return (
    <div className="panel">
      <div className="panel-label">gantt chart</div>
      <div className="gantt-scroll">
        <div className="gantt-track" style={{ width: Math.max(maxTick * pxPerTick, 200) }}>
          {segments.map((s, i) => {
            const start = s.start * pxPerTick;
            const rawEnd = Math.min(s.end, tick) * pxPerTick;
            const width = Math.max(0, rawEnd - start);
            if (width <= 0) return null;
            const isRunningNow = s.end > tick && s.start <= tick;
            const color = s.pid ? colorOf(s.pid) : "transparent";
            return (
              <div
                key={i}
                className="gantt-segment"
                style={{
                  left: start,
                  width,
                  background: color,
                  opacity: s.pid ? (isRunningNow ? 1 : 0.82) : 1,
                }}
              >
                {s.pid && width > 18 ? s.pid : ""}
              </div>
            );
          })}
          <div className="playhead" style={{ left: tick * pxPerTick }} />
        </div>
      </div>
    </div>
  );
}

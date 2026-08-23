const ALGO_SHORT = { rr: "RR", fcfs: "FCFS", sjf: "SJF", srtf: "SRTF", mlfq: "MLFQ", priorityNP: "Pri NP", priorityP: "Pri P", cfs: "CFS" };

export default function CompareTable({ compare, activeAlgo }) {
  if (!compare) return null;
  return (
    <div className="panel">
      <div className="panel-label">algorithm comparison</div>
      <table className="compare-table">
        <thead>
          <tr>
            <td>algo</td>
            <td align="right">avg wait</td>
            <td align="right">avg turn</td>
            <td align="right">avg resp</td>
          </tr>
        </thead>
        <tbody>
          {compare.map((c) => (
            <tr key={c.algo} style={{ color: c.algo === activeAlgo ? "var(--amber)" : "var(--text)" }}>
              <td style={{ padding: "3px 0" }}>{ALGO_SHORT[c.algo]}</td>
              <td align="right">{c.avgWaiting.toFixed(1)}</td>
              <td align="right">{c.avgTurnaround.toFixed(1)}</td>
              <td align="right">{c.avgResponse.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

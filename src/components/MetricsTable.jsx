export default function MetricsTable({ metrics }) {
  return (
    <div className="panel">
      <div className="panel-label">metrics</div>
      <table className="metrics-table">
        <thead>
          <tr>
            <td>process</td>
            <td>arrival</td>
            <td>burst</td>
            <td>completion</td>
            <td>turnaround</td>
            <td>waiting</td>
            <td>response</td>
          </tr>
        </thead>
        <tbody>
          {metrics.rows.map((r) => (
            <tr key={r.id}>
              <td>
                <span className="swatch" style={{ background: r.color }} />
                {r.id}
              </td>
              <td>{r.arrival}</td>
              <td>{r.burst}</td>
              <td>{r.completion ?? "-"}</td>
              <td>{r.turnaround ?? "-"}</td>
              <td>{r.waiting ?? "-"}</td>
              <td>{r.response ?? "-"}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>average</td>
            <td></td>
            <td></td>
            <td></td>
            <td>{metrics.avgTurnaround.toFixed(1)}</td>
            <td>{metrics.avgWaiting.toFixed(1)}</td>
            <td>{metrics.avgResponse.toFixed(1)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

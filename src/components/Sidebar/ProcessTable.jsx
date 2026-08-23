import { NumberInput, IconButton } from "../ui.jsx";

export default function ProcessTable({
  processes,
  updateProc,
  addProc,
  removeProc,
  count,
  setCount,
  seed,
  setSeed,
  onRegenerate,
}) {
  return (
    <div className="panel">
      <div className="panel-label" style={{ justifyContent: "space-between", display: "flex" }}>
        <span>process trace</span>
        <div className="field-row" style={{ gap: 4 }}>
          <NumberInput className="w-sm" value={count} min={1} max={12} onChange={setCount} />
          <NumberInput className="w-sm" value={seed} min={0} max={9999} onChange={setSeed} />
          <IconButton onClick={onRegenerate} title="regenerate synthetic trace">
            refresh
          </IconButton>
        </div>
      </div>

      <div className="process-table-header">
        <span></span>
        <span>id</span>
        <span>arr</span>
        <span>burst</span>
        <span>nice</span>
        <span></span>
      </div>
      <div className="process-table-body">
        {processes.map((p, i) => (
          <div key={p.id} className="process-row">
            <span className="swatch" style={{ background: p.color }} />
            <span style={{ fontSize: 11 }}>{p.id}</span>
            <NumberInput className="w-sm" value={p.arrival} min={0} max={999} onChange={(v) => updateProc(i, "arrival", v)} />
            <NumberInput className="w-sm" value={p.burst} min={1} max={999} onChange={(v) => updateProc(i, "burst", v)} />
            <NumberInput className="w-xs" value={p.nice} min={-5} max={5} onChange={(v) => updateProc(i, "nice", v)} />
            <button className="icon-btn-flat" onClick={() => removeProc(i)} aria-label={`Remove ${p.id}`}>
              remove
            </button>
          </div>
        ))}
      </div>

      <button className="btn btn-ghost" onClick={addProc}>
        add process
      </button>
    </div>
  );
}

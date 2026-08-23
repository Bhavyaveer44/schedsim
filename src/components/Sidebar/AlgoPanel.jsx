import { Field, NumberInput, TabButton } from "../ui.jsx";

export default function AlgoPanel({
  algo,
  setAlgo,
  rrQuantum,
  setRrQuantum,
  mlfqQuantums,
  setMlfqQuantums,
  mlfqBoost,
  setMlfqBoost,
  cfsLatency,
  setCfsLatency,
  cfsMinGran,
  setCfsMinGran,
  onRun,
  onCompare,
}) {
  return (
    <div className="panel">
      <div className="tabs">
        <TabButton active={algo === "rr"} onClick={() => setAlgo("rr")}>
          RR
        </TabButton>
        <TabButton active={algo === "fcfs"} onClick={() => setAlgo("fcfs")}>
          FCFS
        </TabButton>
        <TabButton active={algo === "sjf"} onClick={() => setAlgo("sjf")}>
          SJF
        </TabButton>
        <TabButton active={algo === "srtf"} onClick={() => setAlgo("srtf")}>
          SRTF
        </TabButton>
        <TabButton active={algo === "mlfq"} onClick={() => setAlgo("mlfq")}>
          MLFQ
        </TabButton>
        <TabButton active={algo === "priorityNP"} onClick={() => setAlgo("priorityNP")}>
          Pri NP
        </TabButton>
        <TabButton active={algo === "priorityP"} onClick={() => setAlgo("priorityP")}>
          Pri P
        </TabButton>
        <TabButton active={algo === "cfs"} onClick={() => setAlgo("cfs")}>
          CFS-lite
        </TabButton>
      </div>

      {algo === "rr" && (
        <Field label="time quantum">
          <NumberInput value={rrQuantum} min={1} max={64} onChange={setRrQuantum} />
        </Field>
      )}

      {algo === "mlfq" && (
        <div className="field" style={{ gap: 8 }}>
          <div className="field-row">
            {mlfqQuantums.map((q, i) => (
              <Field key={i} label={`L${i} quantum`}>
                <NumberInput
                  className="w-sm"
                  value={q}
                  min={1}
                  max={64}
                  onChange={(v) => setMlfqQuantums((qs) => qs.map((x, j) => (j === i ? v : x)))}
                />
              </Field>
            ))}
          </div>
          <Field label="priority boost interval (0=off)">
            <NumberInput value={mlfqBoost} min={0} max={200} onChange={setMlfqBoost} />
          </Field>
        </div>
      )}

      {algo === "cfs" && (
        <div className="field-row">
          <Field label="sched latency">
            <NumberInput value={cfsLatency} min={2} max={128} onChange={setCfsLatency} />
          </Field>
          <Field label="min granularity">
            <NumberInput value={cfsMinGran} min={1} max={32} onChange={setCfsMinGran} />
          </Field>
        </div>
      )}

      <button className="btn btn-primary" onClick={onRun}>
        ▶ RUN SIMULATION
      </button>
      <button className="btn btn-secondary" onClick={onCompare}>
        compare all algorithms
      </button>
    </div>
  );
}

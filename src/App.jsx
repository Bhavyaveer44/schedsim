import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { runSim, buildSegments, computeMetrics } from "./lib/schedulers/index.js";
import { genProcesses } from "./lib/prng.js";
import { PALETTE } from "./lib/theme.js";

import Header from "./components/Header.jsx";
import AlgoPanel from "./components/Sidebar/AlgoPanel.jsx";
import ProcessTable from "./components/Sidebar/ProcessTable.jsx";
import CompareTable from "./components/Sidebar/CompareTable.jsx";
import Legend from "./components/Legend.jsx";
import GanttChart from "./components/GanttChart.jsx";
import LiveState from "./components/LiveState.jsx";
import PlaybackBar from "./components/PlaybackBar.jsx";
import MetricsTable from "./components/MetricsTable.jsx";

export default function App() {
  // --- trace configuration ---
  const [seed, setSeed] = useState(42);
  const [count, setCount] = useState(6);
  const [processes, setProcesses] = useState(() => genProcesses(6, 42));

  // --- algorithm + params ---
  const [algo, setAlgo] = useState("rr");
  const [rrQuantum, setRrQuantum] = useState(4);
  const [mlfqQuantums, setMlfqQuantums] = useState([4, 8, 16]);
  const [mlfqBoost, setMlfqBoost] = useState(50);
  const [cfsLatency, setCfsLatency] = useState(24);
  const [cfsMinGran, setCfsMinGran] = useState(2);
  const params = { rrQuantum, mlfqQuantums, mlfqBoost, cfsLatency, cfsMinGran };

  // --- simulation result + playback ---
  const [result, setResult] = useState(() => runSim("rr", processes, { rrQuantum: 4 }));
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(60); // ticks / sec
  const [compare, setCompare] = useState(null);
  const timerRef = useRef(null);

  const segments = useMemo(() => buildSegments(result.ticks), [result]);
  const metrics = useMemo(() => computeMetrics(processes, result), [processes, result]);
  const maxTick = result.maxTick;

  const doRun = useCallback(
    (a = algo, p = processes, pr = params, shouldPlay = false) => {
      const r = runSim(a, p, pr);
      setResult(r);
      setTick(0);
      setPlaying(shouldPlay);
      setCompare(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [algo, processes, rrQuantum, mlfqQuantums, mlfqBoost, cfsLatency, cfsMinGran]
  );

  // re-run automatically when the algorithm tab changes
  useEffect(() => {
    doRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algo]);

  // playback timer
  useEffect(() => {
    if (!playing) return;
    const delay = Math.max(30, 1000 / Math.max(speed, 1));
    timerRef.current = setInterval(() => {
      setTick((t) => {
        if (t >= maxTick) {
          setPlaying(false);
          return t;
        }
        return t + 1;
      });
    }, delay);
    return () => clearInterval(timerRef.current);
  }, [playing, speed, maxTick]);

  const snap = result.ticks[Math.min(tick, Math.max(maxTick - 1, 0))] || { running: null, ready: [] };
  const colorOf = (pid) => processes.find((p) => p.id === pid)?.color || "#7A8194";
  const pxPerTick = Math.min(28, Math.max(7, Math.round(900 / Math.max(maxTick, 1))));

  const regenerate = () => {
    const p = genProcesses(count, seed);
    setProcesses(p);
    setCount(p.length);
    doRun(algo, p, params);
  };

  const updateProc = (idx, key, val) => {
    setProcesses((ps) => ps.map((p, i) => (i === idx ? { ...p, [key]: val } : p)));
  };
  const addProc = () => {
    setProcesses((ps) => {
      const next = [
        ...ps,
        {
          id: `P${ps.length + 1}`,
          arrival: (ps.at(-1)?.arrival ?? 0) + 2,
          burst: 6,
          nice: 0,
          priority: 0,
          color: PALETTE[ps.length % PALETTE.length],
        },
      ];
      setCount(next.length);
      return next;
    });
  };
  const removeProc = (idx) => {
    setProcesses((ps) => {
      const next = ps.filter((_, i) => i !== idx);
      setCount(Math.max(1, next.length));
      return next;
    });
  };

  const runCompare = () => {
    const algos = ["rr", "fcfs", "sjf", "srtf", "mlfq", "priorityNP", "priorityP", "cfs"];
    const out = algos.map((a) => {
      const r = runSim(a, processes, params);
      const m = computeMetrics(processes, r);
      return { algo: a, avgWaiting: m.avgWaiting, avgTurnaround: m.avgTurnaround, avgResponse: m.avgResponse, span: r.maxTick };
    });
    setCompare(out);
  };

  return (
    <div className="app">
      <Header algo={algo} tick={tick} maxTick={maxTick} playing={playing} />

      <div className="app-body">
        <div className="sidebar">
          <AlgoPanel
            algo={algo}
            setAlgo={setAlgo}
            rrQuantum={rrQuantum}
            setRrQuantum={setRrQuantum}
            mlfqQuantums={mlfqQuantums}
            setMlfqQuantums={setMlfqQuantums}
            mlfqBoost={mlfqBoost}
            setMlfqBoost={setMlfqBoost}
            cfsLatency={cfsLatency}
            setCfsLatency={setCfsLatency}
            cfsMinGran={cfsMinGran}
            setCfsMinGran={setCfsMinGran}
            onRun={() => doRun(algo, processes, params, true)}
            onCompare={runCompare}
          />

          <ProcessTable
            processes={processes}
            updateProc={updateProc}
            addProc={addProc}
            removeProc={removeProc}
            count={count}
            setCount={setCount}
            seed={seed}
            setSeed={setSeed}
            onRegenerate={regenerate}
          />

          <CompareTable compare={compare} activeAlgo={algo} />
        </div>

        <div className="main">
          <Legend processes={processes} algo={algo} />

          <GanttChart segments={segments} tick={tick} maxTick={maxTick} pxPerTick={pxPerTick} colorOf={colorOf} />

          <LiveState snap={snap} algo={algo} mlfqQuantums={mlfqQuantums} colorOf={colorOf} />

          <PlaybackBar
            tick={tick}
            setTick={setTick}
            maxTick={maxTick}
            playing={playing}
            setPlaying={setPlaying}
            speed={speed}
            setSpeed={setSpeed}
          />

          <MetricsTable metrics={metrics} />
        </div>
      </div>
    </div>
  );
}

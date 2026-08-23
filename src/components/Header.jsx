import { Cpu, ChevronRight } from "lucide-react";
const ALGO_LABEL = {
  rr: "Round Robin",
  fcfs: "FCFS",
  sjf: "SJF",
  srtf: "SRTF",
  mlfq: "MLFQ",
  priorityNP: "Priority NP",
  priorityP: "Priority P",
  cfs: "CFS-lite",
};

export default function Header({ algo, tick, maxTick, playing }) {
  return (
    <div className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <Cpu size={17} color="#FFB454" />
        </div>
        <div>
          <div className="brand-title">SCHEDSIM</div>
          <div className="brand-sub">CPU Scheduler Visualizer</div>
        </div>
      </div>
      <div className="status">
        <span className={`status-dot ${playing ? "live" : ""}`} />
        <span>{ALGO_LABEL[algo]}</span>
        <ChevronRight size={12} />
        <span>
          t = {Math.min(tick, maxTick)} / {maxTick}
        </span>
      </div>
    </div>
  );
}

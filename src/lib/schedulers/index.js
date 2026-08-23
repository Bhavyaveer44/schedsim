import { simulateRR } from "./rr.js";
import { simulateMLFQ } from "./mlfq.js";
import { simulateCFS } from "./cfs.js";
import { simulateFCFS } from "./fcfs.js";
import { simulateSJF } from "./sjf.js";
import { simulateSRTF } from "./srtf.js";
import { simulatePriorityNP } from "./Prioritynp.js";
import { simulatePriorityP } from "./Priorityp.js";

export {
  simulateRR,
  simulateMLFQ,
  simulateCFS,
  simulateFCFS,
  simulateSJF,
  simulateSRTF,
  simulatePriorityNP,
  simulatePriorityP,
};
export { niceToWeight } from "./cfs.js";
export { buildSegments, computeMetrics, SAFETY_CAP } from "./common.js";

/**
 * Run the selected scheduling algorithm against a process trace.
 * @param {"rr"|"mlfq"|"cfs"|"fcfs"|"sjf"|"srtf"|"priorityNP"|"priorityP"} algo
 * @param {Array} procs
 * @param {object} params see App.jsx for the shape of `params`
 */
export function runSim(algo, procs, params) {
  if (!procs.length) return { ticks: [], completion: {}, response: {}, maxTick: 0 };
  if (algo === "rr") return simulateRR(procs, params.rrQuantum);
  if (algo === "mlfq") return simulateMLFQ(procs, params.mlfqQuantums, params.mlfqBoost);
  if (algo === "fcfs") return simulateFCFS(procs);
  if (algo === "sjf") return simulateSJF(procs);
  if (algo === "srtf") return simulateSRTF(procs);
  if (algo === "priorityNP" || algo === "prioritynp") return simulatePriorityNP(procs);
  if (algo === "priorityP" || algo === "priorityp") return simulatePriorityP(procs);
  return simulateCFS(procs, params.cfsLatency, params.cfsMinGran);
}

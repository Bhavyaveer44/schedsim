import { SAFETY_CAP } from "./common.js";

/**
 * First-Come, First-Served — strictly non-preemptive, dispatched in arrival
 * order. This is just Round Robin with an infinite quantum: once a process
 * starts, it runs to completion.
 *
 * @param {Array<{id:string, arrival:number, burst:number}>} procs
 */
export function simulateFCFS(procs) {
  const arrivals = [...procs].sort((a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id));
  const remaining = {};
  procs.forEach((p) => (remaining[p.id] = p.burst));

  const queue = [];
  const ticks = [];
  const completion = {};
  const response = {};

  let time = 0;
  let current = null;
  let completed = 0;
  const n = procs.length;

  while (completed < n && time < SAFETY_CAP) {
    while (arrivals.length && arrivals[0].arrival === time) {
      queue.push(arrivals.shift().id);
    }
    if (current === null && queue.length) {
      current = queue.shift();
      if (response[current] === undefined) response[current] = time;
    }

    ticks.push({ running: current, ready: queue.map((pid) => ({ pid })) });

    if (current !== null) remaining[current]--;
    time++;

    if (current !== null && remaining[current] === 0) {
      completion[current] = time;
      completed++;
      current = null;
    }
  }

  return { ticks, completion, response, maxTick: ticks.length };
}
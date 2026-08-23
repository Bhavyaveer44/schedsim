import { SAFETY_CAP } from "./common.js";

/**
 * Non-preemptive Shortest Job First.
 *
 * Whenever the CPU is idle, dispatch whichever arrived process has the
 * smallest *total* burst time (job length is assumed known up front — the
 * classic textbook assumption). Once dispatched, a process always runs to
 * completion; new arrivals never interrupt it.
 *
 * @param {Array<{id:string, arrival:number, burst:number}>} procs
 */
export function simulateSJF(procs) {
  const arrivals = [...procs].sort((a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id));
  const remaining = {};
  const burstOf = {};
  const arrivalOf = {};
  procs.forEach((p) => {
    remaining[p.id] = p.burst;
    burstOf[p.id] = p.burst;
    arrivalOf[p.id] = p.arrival;
  });

  const ready = [];
  const ticks = [];
  const completion = {};
  const response = {};

  let time = 0;
  let current = null;
  let completed = 0;
  const n = procs.length;

  while (completed < n && time < SAFETY_CAP) {
    while (arrivals.length && arrivals[0].arrival === time) ready.push(arrivals.shift().id);

    if (current === null && ready.length) {
      ready.sort((a, b) => burstOf[a] - burstOf[b] || arrivalOf[a] - arrivalOf[b] || a.localeCompare(b));
      current = ready.shift();
      if (response[current] === undefined) response[current] = time;
    }

    ticks.push({ running: current, ready: [...ready].sort((a, b) => burstOf[a] - burstOf[b]).map((pid) => ({ pid })) });

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
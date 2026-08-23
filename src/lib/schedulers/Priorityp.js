import { SAFETY_CAP } from "./common.js";

/**
 * Preemptive Priority scheduling.
 *
 * Convention: LOWER `priority` value = HIGHER priority. Every tick, the CPU
 * goes to whichever ready process (including the one currently running) has
 * the lowest priority number — so a newly arriving higher-priority process
 * preempts the running one immediately. Ties are broken by earlier arrival,
 * then id.
 *
 * @param {Array<{id:string, arrival:number, burst:number, priority:number}>} procs
 */
export function simulatePriorityP(procs) {
  const arrivals = [...procs].sort((a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id));
  const remaining = {};
  const priorityOf = {};
  const arrivalOf = {};
  procs.forEach((p) => {
    remaining[p.id] = p.burst;
    priorityOf[p.id] = p.priority;
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

  const byPriority = (a, b) =>
    priorityOf[a] - priorityOf[b] || arrivalOf[a] - arrivalOf[b] || a.localeCompare(b);

  while (completed < n && time < SAFETY_CAP) {
    while (arrivals.length && arrivals[0].arrival === time) ready.push(arrivals.shift().id);

    const candidates = current !== null ? [...ready, current] : [...ready];
    if (candidates.length) {
      candidates.sort(byPriority);
      const best = candidates[0];
      if (best !== current) {
        if (current !== null) ready.push(current);
        const idx = ready.indexOf(best);
        if (idx !== -1) ready.splice(idx, 1);
        current = best;
        if (response[current] === undefined) response[current] = time;
      }
    }

    ticks.push({ running: current, ready: [...ready].sort(byPriority).map((pid) => ({ pid })) });

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
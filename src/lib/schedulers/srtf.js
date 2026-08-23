import { SAFETY_CAP } from "./common.js";

/**
 * Preemptive SJF, a.k.a. Shortest Remaining Time First (SRTF).
 *
 * Every tick, the CPU is re-awarded to whichever ready process (including
 * the one currently running) has the smallest *remaining* time. A newly
 * arriving process with a shorter remaining burst than the running process
 * preempts it immediately. Ties are broken by earlier arrival, then id, so
 * the choice is deterministic and doesn't thrash between equally-short jobs.
 *
 * @param {Array<{id:string, arrival:number, burst:number}>} procs
 */
export function simulateSRTF(procs) {
  const arrivals = [...procs].sort((a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id));
  const remaining = {};
  const arrivalOf = {};
  procs.forEach((p) => {
    remaining[p.id] = p.burst;
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

  const byRemaining = (a, b) =>
    remaining[a] - remaining[b] || arrivalOf[a] - arrivalOf[b] || a.localeCompare(b);

  while (completed < n && time < SAFETY_CAP) {
    while (arrivals.length && arrivals[0].arrival === time) ready.push(arrivals.shift().id);

    const candidates = current !== null ? [...ready, current] : [...ready];
    if (candidates.length) {
      candidates.sort(byRemaining);
      const best = candidates[0];
      if (best !== current) {
        if (current !== null) ready.push(current);
        const idx = ready.indexOf(best);
        if (idx !== -1) ready.splice(idx, 1);
        current = best;
        if (response[current] === undefined) response[current] = time;
      }
    }

    ticks.push({ running: current, ready: [...ready].sort(byRemaining).map((pid) => ({ pid })) });

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
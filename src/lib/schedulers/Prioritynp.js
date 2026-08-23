import { SAFETY_CAP } from "./common.js";

/**
 * Non-preemptive Priority scheduling.
 *
 * Convention: LOWER `priority` value = HIGHER priority (matches Unix nice
 * and most OS textbooks). Whenever the CPU is idle, dispatch the arrived
 * process with the lowest priority number; once dispatched it runs to
 * completion regardless of what arrives afterward.
 *
 * @param {Array<{id:string, arrival:number, burst:number, priority:number}>} procs
 */
export function simulatePriorityNP(procs) {
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

    if (current === null && ready.length) {
      ready.sort(byPriority);
      current = ready.shift();
      if (response[current] === undefined) response[current] = time;
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
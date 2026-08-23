import { SAFETY_CAP } from "./common.js";

/**
 * Map a Linux-style nice value (-20..19, here restricted to -5..5 in the UI)
 * to a scheduling weight, using the same 1.25x-per-step formula the real
 * kernel uses (nice 0 -> weight 1024).
 */
export function niceToWeight(nice) {
  return Math.max(20, Math.round(1024 / Math.pow(1.25, nice)));
}

/**
 * CFS-lite: a simplified Completely Fair Scheduler.
 *
 * Instead of a red-black tree keyed by vruntime, this uses a plain array
 * and picks the minimum by linear scan every reschedule — the scheduling
 * *policy* is faithful, only the data structure is simplified for clarity.
 *
 * - Each process accumulates virtual runtime at a rate inversely
 *   proportional to its weight (lower nice -> higher weight -> vruntime
 *   grows slower -> gets scheduled more often).
 * - The CPU always runs whichever ready process has the smallest vruntime.
 * - The time slice for the current pick is `sched_latency` divided evenly
 *   among the currently runnable processes, floored at `min_granularity`.
 * - A newly-arriving process is seeded with the minimum vruntime currently
 *   in the run queue (not zero) so it can't grab the CPU indefinitely just
 *   for having "saved up" no runtime.
 *
 * @param {Array<{id:string, arrival:number, burst:number, nice:number}>} procs
 * @param {number} latency target scheduling latency (ticks)
 * @param {number} minGranularity minimum time slice (ticks)
 */
export function simulateCFS(procs, latency, minGranularity) {
  const arrivals = [...procs].sort((a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id));
  const remaining = {};
  const weight = {};
  procs.forEach((p) => {
    remaining[p.id] = p.burst;
    weight[p.id] = niceToWeight(p.nice);
  });

  const vruntime = {};
  const ready = [];
  const ticks = [];
  const completion = {};
  const response = {};

  let time = 0;
  let current = null;
  let sliceLeft = 0;
  let completed = 0;
  const n = procs.length;

  while (completed < n && time < SAFETY_CAP) {
    // 1. arrivals join the run queue, seeded at the current minimum vruntime
    while (arrivals.length && arrivals[0].arrival === time) {
      const p = arrivals.shift();
      const pool = current !== null ? [...ready, current] : ready;
      const minV = pool.length ? Math.min(...pool.map((pid) => vruntime[pid])) : 0;
      vruntime[p.id] = minV;
      ready.push(p.id);
    }

    // 2. reschedule if the CPU is idle or the current slice has elapsed
    if (current === null || sliceLeft === 0) {
      if (current !== null) ready.push(current);
      if (ready.length) {
        ready.sort((a, b) => vruntime[a] - vruntime[b] || a.localeCompare(b));
        current = ready.shift();
        const nrRunning = ready.length + 1;
        sliceLeft = Math.max(minGranularity, Math.round(latency / nrRunning));
        if (response[current] === undefined) response[current] = time;
      } else {
        current = null;
      }
    }

    const readySnap = [...ready].sort((a, b) => vruntime[a] - vruntime[b]).map((pid) => ({ pid }));
    ticks.push({ running: current, ready: readySnap });

    // 3. execute one unit of time, accruing weighted virtual runtime
    if (current !== null) {
      remaining[current]--;
      sliceLeft--;
      vruntime[current] += 1024 / weight[current];
    }
    time++;

    // 4. completion check
    if (current !== null && remaining[current] === 0) {
      completion[current] = time;
      completed++;
      current = null;
      sliceLeft = 0;
    }
  }

  return { ticks, completion, response, maxTick: ticks.length };
}

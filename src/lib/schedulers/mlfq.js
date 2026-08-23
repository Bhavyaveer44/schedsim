import { SAFETY_CAP } from "./common.js";

/**
 * Multi-Level Feedback Queue.
 *
 * - New processes enter at level 0 (highest priority).
 * - A process that uses its full quantum without finishing is demoted one
 *   level (capped at the lowest level, which then behaves like plain RR).
 * - An optional periodic priority boost moves every waiting process back to
 *   level 0 to prevent starvation of long-running jobs.
 *
 * @param {Array<{id:string, arrival:number, burst:number}>} procs
 * @param {number[]} levelQuantums quantum for each level, e.g. [4, 8, 16]
 * @param {number} boostInterval ticks between priority boosts, 0 disables it
 */
export function simulateMLFQ(procs, levelQuantums, boostInterval) {
  const L = levelQuantums.length;
  const arrivals = [...procs].sort((a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id));
  const remaining = {};
  procs.forEach((p) => (remaining[p.id] = p.burst));

  const queues = Array.from({ length: L }, () => []);
  const levelOf = {};
  const ticks = [];
  const completion = {};
  const response = {};

  let time = 0;
  let current = null;
  let currentLevel = 0;
  let quantumLeft = 0;
  let preempt = null;
  let completed = 0;
  const n = procs.length;

  while (completed < n && time < SAFETY_CAP) {
    // 0. periodic priority boost
    if (boostInterval > 0 && time > 0 && time % boostInterval === 0) {
      for (let lvl = 1; lvl < L; lvl++) {
        while (queues[lvl].length) queues[0].push(queues[lvl].shift());
      }
      queues[0].forEach((pid) => (levelOf[pid] = 0));
      if (current !== null) {
        currentLevel = 0;
        levelOf[current] = 0;
        quantumLeft = Math.min(quantumLeft, levelQuantums[0]);
      }
    }

    // 1. arrivals enter at level 0
    while (arrivals.length && arrivals[0].arrival === time) {
      const p = arrivals.shift();
      levelOf[p.id] = 0;
      queues[0].push(p.id);
    }

    // 2. re-queue a process preempted last tick at its (possibly demoted) level
    if (preempt !== null) {
      queues[levelOf[preempt]].push(preempt);
      preempt = null;
    }

    // 3. dispatch: scan levels highest to lowest priority
    if (current === null) {
      for (let lvl = 0; lvl < L; lvl++) {
        if (queues[lvl].length) {
          current = queues[lvl].shift();
          currentLevel = lvl;
          quantumLeft = levelQuantums[lvl];
          break;
        }
      }
      if (current !== null && response[current] === undefined) response[current] = time;
    }

    const ready = [];
    queues.forEach((q, lvl) => q.forEach((pid) => ready.push({ pid, level: lvl })));
    ticks.push({ running: current, level: current !== null ? currentLevel : null, ready });

    // 4. execute one unit of time
    if (current !== null) {
      remaining[current]--;
      quantumLeft--;
    }
    time++;

    // 5. completion / demotion check
    if (current !== null) {
      if (remaining[current] === 0) {
        completion[current] = time;
        completed++;
        current = null;
      } else if (quantumLeft === 0) {
        levelOf[current] = Math.min(L - 1, currentLevel + 1);
        preempt = current;
        current = null;
      }
    }
  }

  return { ticks, completion, response, maxTick: ticks.length };
}

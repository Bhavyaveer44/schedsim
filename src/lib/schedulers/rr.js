import { SAFETY_CAP } from "./common.js";

/**
 * Round Robin, simulated one time unit at a time.
 *
 * Ordering convention each tick: processes that arrive at time `t` are
 * enqueued before a process preempted at time `t` is re-enqueued, which
 * matches the standard textbook convention.
 *
 * @param {Array<{id:string, arrival:number, burst:number}>} procs
 * @param {number} quantum
 * @returns {{ticks: Array, completion: Record<string,number>, response: Record<string,number>, maxTick: number}}
 */
export function simulateRR(procs, quantum) {
  const arrivals = [...procs].sort((a, b) => a.arrival - b.arrival || a.id.localeCompare(b.id));
  const remaining = {};
  procs.forEach((p) => (remaining[p.id] = p.burst));

  const queue = [];
  const ticks = [];
  const completion = {};
  const response = {};

  let time = 0;
  let current = null;
  let quantumLeft = 0;
  let preempt = null;
  let completed = 0;
  const n = procs.length;

  while (completed < n && time < SAFETY_CAP) {
    // 1. new arrivals join the back of the queue
    while (arrivals.length && arrivals[0].arrival === time) {
      queue.push(arrivals.shift().id);
    }
    // 2. a process preempted last tick re-joins after this tick's arrivals
    if (preempt !== null) {
      queue.push(preempt);
      preempt = null;
    }
    // 3. dispatch if the CPU is idle
    if (current === null && queue.length) {
      current = queue.shift();
      quantumLeft = quantum;
      if (response[current] === undefined) response[current] = time;
    }

    ticks.push({ running: current, ready: queue.map((pid) => ({ pid })) });

    // 4. execute one unit of time
    if (current !== null) {
      remaining[current]--;
      quantumLeft--;
    }
    time++;

    // 5. completion / preemption check
    if (current !== null) {
      if (remaining[current] === 0) {
        completion[current] = time;
        completed++;
        current = null;
      } else if (quantumLeft === 0) {
        preempt = current;
        current = null;
      }
    }
  }

  return { ticks, completion, response, maxTick: ticks.length };
}

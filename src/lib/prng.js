import { PALETTE } from "./theme.js";

/** Deterministic 32-bit PRNG (mulberry32) so traces are reproducible from a seed. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a synthetic process trace.
 * @param {number} n number of processes
 * @param {number} seed PRNG seed
 * @returns {Array<{id:string, arrival:number, burst:number, nice:number, priority:number, color:string}>}
 */
export function genProcesses(n, seed) {
  const rand = mulberry32(seed);
  let t = 0;
  const procs = [];
  for (let i = 0; i < n; i++) {
    t += Math.floor(rand() * 5);
    const burst = 3 + Math.floor(rand() * 11);
    const nice = Math.floor(rand() * 11) - 5;
    procs.push({
      id: `P${i + 1}`,
      arrival: t,
      burst,
      nice,
      priority: nice,
      color: PALETTE[i % PALETTE.length],
    });
  }
  return procs;
}

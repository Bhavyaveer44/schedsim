// Hard cap on simulated ticks so a misconfigured trace (e.g. zero throughput)
// can't hang the browser in an infinite loop.
export const SAFETY_CAP = 6000;

/**
 * Collapse a per-tick "who is running" array into contiguous Gantt segments.
 * @param {Array<{running: string|null}>} ticks
 * @returns {Array<{pid: string|null, start: number, end: number}>}
 */
export function buildSegments(ticks) {
  const segs = [];
  for (let t = 0; t < ticks.length; t++) {
    const pid = ticks[t].running;
    if (segs.length && segs[segs.length - 1].pid === pid) {
      segs[segs.length - 1].end = t + 1;
    } else {
      segs.push({ pid, start: t, end: t + 1 });
    }
  }
  return segs;
}

/**
 * Compute per-process and average scheduling metrics from a simulation result.
 * @param {Array} procs original process list ({id, arrival, burst, ...})
 * @param {{completion: Record<string,number>, response: Record<string,number>}} result
 */
export function computeMetrics(procs, result) {
  const rows = procs.map((p) => {
    const c = result.completion[p.id];
    const r = result.response[p.id];
    const turnaround = c !== undefined ? c - p.arrival : null;
    const waiting = turnaround !== null ? turnaround - p.burst : null;
    const responseTime = r !== undefined ? r - p.arrival : null;
    return { ...p, completion: c ?? null, turnaround, waiting, response: responseTime };
  });

  const done = rows.filter((r) => r.turnaround !== null);
  const avg = (key) => (done.length ? done.reduce((s, r) => s + r[key], 0) / done.length : 0);

  return {
    rows,
    avgTurnaround: avg("turnaround"),
    avgWaiting: avg("waiting"),
    avgResponse: avg("response"),
  };
}

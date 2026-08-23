# SchedSim

SchedSim is a lightweight CPU scheduler visualizer for comparing how different policies behave on the same process trace. It renders a live Gantt chart, ready queue state, playback controls, and per-process metrics in a single browser-based dashboard.

The app supports:

- Round Robin
- FCFS
- SJF
- SRTF
- MLFQ
- Priority (non-preemptive)
- Priority (preemptive)
- CFS-lite

## Features

- Edit process arrival time, burst time, and nice value directly in the sidebar
- Generate synthetic workloads from a seed and process count
- Run one algorithm or compare all supported algorithms side by side
- Scrub through the timeline and adjust playback speed in real time
- Inspect CPU state, ready queue contents, and aggregate scheduling metrics

## Quick start

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Open the local URL shown in the terminal, typically `http://localhost:5173`.

## Production build

```bash
npm run build
```

This creates a static build in the `dist/` folder.

To preview the production build locally:

```bash
npm run preview -- --host 0.0.0.0
```

## Deploying

This app is a static Vite frontend, so deployment is straightforward.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the app for production:

   ```bash
   npm run build
   ```

3. Publish the generated `dist/` directory to any static host, such as:

   - Vercel
   - Netlify
   - GitHub Pages
   - Cloudflare Pages
   - any S3/NGINX static hosting setup

For a basic local static deployment, you can serve the build folder with a simple HTTP server:

```bash
npx serve dist
```

## Project structure

```text
src/
  App.jsx
  main.jsx
  index.css
  components/
    Header.jsx
    GanttChart.jsx
    Legend.jsx
    LiveState.jsx
    MetricsTable.jsx
    PlaybackBar.jsx
    ui.jsx
    Sidebar/
      AlgoPanel.jsx
      CompareTable.jsx
      ProcessTable.jsx
  lib/
    prng.js
    theme.js
    schedulers/
      common.js
      cfs.js
      fcfs.js
      index.js
      mlfq.js
      Prioritynp.js
      Priorityp.js
      rr.js
      sjf.js
      srtf.js
```

## Scheduler model

Each scheduler is implemented as a pure simulation function that takes a process list plus algorithm-specific parameters and returns a tick trace. The app then renders those results without additional server-side logic.

- `runSim()` dispatches the selected algorithm from `src/lib/schedulers/index.js`
- `buildSegments()` converts the raw tick stream into Gantt-style segments
- `computeMetrics()` calculates turnaround, waiting, and response times

The scheduler logic is intentionally separated from the UI so the simulation logic stays testable and easy to port to another runtime later.

## Notes

- Process IDs are generated from a seeded PRNG and can be modified manually in the UI.
- The app assumes a single CPU and discrete time ticks.
- The compare view runs all algorithms against the same current process set so the trade-offs are easy to inspect.

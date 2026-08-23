import { IconButton } from "./ui.jsx";

export default function PlaybackBar({ tick, setTick, maxTick, playing, setPlaying, speed, setSpeed }) {
  return (
    <div className="playback-bar">
      <div className="transport-group">
        <IconButton onClick={() => setTick(0)} title="reset">
          reset
        </IconButton>
        <IconButton onClick={() => setTick((t) => Math.max(0, t - 1))} title="step back">
          back
        </IconButton>
        <IconButton onClick={() => setPlaying((p) => !p)} disabled={maxTick === 0} title={playing ? "pause" : "play"}>
          {playing ? "pause" : "play"}
        </IconButton>
        <IconButton onClick={() => setTick((t) => Math.min(maxTick, t + 1))} title="step forward">
          next
        </IconButton>
      </div>

      <input
        type="range"
        className="scrub"
        min={0}
        max={Math.max(maxTick, 1)}
        value={Math.min(tick, maxTick)}
        onChange={(e) => {
          setPlaying(false);
          setTick(Number(e.target.value));
        }}
      />
      <span className="tick-readout">
        {Math.min(tick, maxTick)} / {maxTick}
      </span>

      <div className="speed-control">
        <span>speed</span>
        <input
          type="range"
          min={5}
          max={200}
          value={Math.max(5, Math.min(200, speed))}
          onChange={(e) => setSpeed(Math.max(5, Math.min(200, Number(e.target.value))))}
        />
      </div>
    </div>
  );
}

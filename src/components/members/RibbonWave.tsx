import type { CSSProperties } from "react";

type Vars = CSSProperties & Record<string, string>;

const SLICE_COUNT = 76;

/** Colour ramp across the ribbon, blue through violet into rose. */
const STOPS = [
  [37, 99, 235], // blue
  [79, 70, 229], // indigo
  [124, 58, 237], // violet
  [192, 38, 211], // fuchsia
  [219, 39, 119], // pink
  [244, 63, 94], // rose
];

function rampColour(t: number): string {
  const scaled = t * (STOPS.length - 1);
  const index = Math.min(Math.floor(scaled), STOPS.length - 2);
  const local = scaled - index;
  const from = STOPS[index];
  const to = STOPS[index + 1];
  const channel = (i: number) =>
    Math.round(from[i] + (to[i] - from[i]) * local);

  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

/**
 * A ribbon built from thin slices. Height and travel follow an envelope that
 * swells toward the middle, and each slice runs the shared keyframe on its own
 * delay, so the row reads as one wave moving through.
 */
export function RibbonWave() {
  const slices = Array.from({ length: SLICE_COUNT }, (_, index) => {
    const t = index / (SLICE_COUNT - 1);
    // Swell toward the centre so the ribbon tapers at both ends.
    const envelope = Math.sin(Math.PI * t);
    const height = 46 + envelope * 150;
    const amplitude = 18 + envelope * 66;
    const tilt = -14 + envelope * 6;

    return {
      style: {
        left: `${t * 100}%`,
        width: "7px",
        height: `${height}px`,
        marginTop: `${-height / 2}px`,
        background: rampColour(t),
        opacity: String(0.55 + envelope * 0.4),
        "--ribbon-amp": `${amplitude}px`,
        "--ribbon-tilt": `${tilt}deg`,
        "--ribbon-delay": `${-(index * 0.045).toFixed(3)}s`,
        "--ribbon-duration": "3.4s",
      } as Vars,
    };
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative h-[260px] w-full sm:h-[340px]"
    >
      {slices.map((slice, index) => (
        <span key={index} className="ribbon-slice" style={slice.style} />
      ))}
    </div>
  );
}

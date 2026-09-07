import type { CSSProperties } from "react";

type DriftCard = {
  /** Tailwind position, size and tint for the pane. */
  className: string;
  style: CSSProperties;
};

/**
 * Each pane gets its own travel distance, angle, duration and delay so the
 * field never falls into a visible rhythm.
 */
const CARDS: DriftCard[] = [
  {
    className: "left-[-8%] top-[4%] h-[300px] w-[360px] bg-primary-300/40",
    style: {
      "--drift-x": "60px",
      "--drift-y": "-70px",
      "--drift-r": "7deg",
      "--drift-duration": "27s",
    } as CSSProperties,
  },
  {
    className: "right-[-6%] top-[12%] h-[260px] w-[300px] bg-accent-300/40",
    style: {
      "--drift-x": "-50px",
      "--drift-y": "80px",
      "--drift-r": "-6deg",
      "--drift-duration": "33s",
      "--drift-delay": "-6s",
    } as CSSProperties,
  },
  {
    className: "left-[12%] top-[38%] h-[240px] w-[280px] bg-primary-400/28",
    style: {
      "--drift-x": "-70px",
      "--drift-y": "60px",
      "--drift-r": "9deg",
      "--drift-duration": "24s",
      "--drift-delay": "-12s",
    } as CSSProperties,
  },
  {
    className: "right-[8%] top-[52%] h-[320px] w-[340px] bg-accent-200/45",
    style: {
      "--drift-x": "55px",
      "--drift-y": "-65px",
      "--drift-r": "-8deg",
      "--drift-duration": "38s",
      "--drift-delay": "-3s",
    } as CSSProperties,
  },
  {
    className: "left-[-4%] bottom-[6%] h-[280px] w-[320px] bg-primary-200/50",
    style: {
      "--drift-x": "70px",
      "--drift-y": "-55px",
      "--drift-r": "5deg",
      "--drift-duration": "30s",
      "--drift-delay": "-18s",
    } as CSSProperties,
  },
  {
    className: "right-[16%] bottom-[-4%] h-[250px] w-[290px] bg-primary-300/32",
    style: {
      "--drift-x": "-60px",
      "--drift-y": "-75px",
      "--drift-r": "-10deg",
      "--drift-duration": "35s",
      "--drift-delay": "-9s",
    } as CSSProperties,
  },
];

export function DriftField() {
  return (
    <div className="drift-field" aria-hidden="true">
      {CARDS.map((card, index) => (
        <span
          key={index}
          className={`drift-card ${card.className}`}
          style={card.style}
        />
      ))}
    </div>
  );
}

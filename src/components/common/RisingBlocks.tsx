"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type Vars = CSSProperties & Record<string, string>;

/** How far from the cursor a block still feels the pull. */
const PULL_RADIUS = 340;
/** Maximum displacement, in pixels, for a block right under the cursor. */
const MAX_PULL = 46;
/** Per-frame easing toward the target offset — also the spring back. */
const LERP = 0.11;

/**
 * Face colours per cube. Top face catches the most light, the right face sits
 * in shadow, so the three together read as a lit solid.
 */
const CUBES: Array<{ position: string; size: string; style: Vars }> = [
  {
    position: "left-[6%] top-[62%]",
    size: "w-[54px]",
    style: {
      "--cube-top": "#4d8bc8",
      "--cube-left": "#236eb4",
      "--cube-right": "#0d4b89",
      "--rise-opacity": "0.85",
      "--rise-duration": "17s",
    },
  },
  {
    position: "left-[14%] top-[30%]",
    size: "w-[36px]",
    style: {
      "--cube-top": "#78b6e7",
      "--cube-left": "#3f93d0",
      "--cube-right": "#105ca8",
      "--rise-opacity": "0.55",
      "--rise-duration": "23s",
      "--rise-delay": "-6s",
    },
  },
  {
    position: "left-[27%] top-[74%]",
    size: "w-[68px]",
    style: {
      "--cube-top": "#3f93d0",
      "--cube-left": "#1c63a8",
      "--cube-right": "#0a3f75",
      "--rise-opacity": "0.7",
      "--rise-duration": "20s",
      "--rise-delay": "-11s",
    },
  },
  {
    position: "left-[41%] top-[22%]",
    size: "w-[44px]",
    style: {
      "--cube-top": "#f4c43e",
      "--cube-left": "#d9a72a",
      "--cube-right": "#a97d18",
      "--rise-opacity": "0.75",
      "--rise-duration": "26s",
      "--rise-delay": "-3s",
    },
  },
  {
    position: "left-[52%] top-[68%]",
    size: "w-[58px]",
    style: {
      "--cube-top": "#86b4dc",
      "--cube-left": "#4d8bc8",
      "--cube-right": "#0d4b89",
      "--rise-opacity": "0.6",
      "--rise-duration": "19s",
      "--rise-delay": "-14s",
    },
  },
  {
    position: "left-[64%] top-[38%]",
    size: "w-[40px]",
    style: {
      "--cube-top": "#dceaf7",
      "--cube-left": "#a9c8e4",
      "--cube-right": "#6f96bd",
      "--rise-opacity": "0.5",
      "--rise-duration": "24s",
      "--rise-delay": "-8s",
    },
  },
  {
    position: "left-[76%] top-[72%]",
    size: "w-[64px]",
    style: {
      "--cube-top": "#4d8bc8",
      "--cube-left": "#236eb4",
      "--cube-right": "#0c3d6d",
      "--rise-opacity": "0.8",
      "--rise-duration": "21s",
      "--rise-delay": "-17s",
    },
  },
  {
    position: "left-[88%] top-[26%]",
    size: "w-[34px]",
    style: {
      "--cube-top": "#78b6e7",
      "--cube-left": "#3f93d0",
      "--cube-right": "#105ca8",
      "--rise-opacity": "0.45",
      "--rise-duration": "28s",
      "--rise-delay": "-5s",
    },
  },
  {
    position: "left-[34%] top-[50%]",
    size: "w-[30px]",
    style: {
      "--cube-top": "#f0954a",
      "--cube-left": "#d1762e",
      "--cube-right": "#9c521a",
      "--rise-opacity": "0.55",
      "--rise-duration": "22s",
      "--rise-delay": "-19s",
    },
  },
];

const STREAKS: Array<{ position: string; size: string; style: Vars }> = [
  {
    position: "left-[10%] top-[20%]",
    size: "h-[120px]",
    style: { "--streak-duration": "11s" },
  },
  {
    position: "left-[31%] top-[46%]",
    size: "h-[90px]",
    style: { "--streak-duration": "9s", "--streak-delay": "-4s" },
  },
  {
    position: "left-[48%] top-[14%]",
    size: "h-[140px]",
    style: { "--streak-duration": "13s", "--streak-delay": "-7s" },
  },
  {
    position: "left-[70%] top-[52%]",
    size: "h-[100px]",
    style: { "--streak-duration": "10s", "--streak-delay": "-2s" },
  },
  {
    position: "left-[93%] top-[60%]",
    size: "h-[110px]",
    style: { "--streak-duration": "12s", "--streak-delay": "-9s" },
  },
];

/**
 * Positions for the "sides" layout. Everything sits outside the 32-68% band,
 * so a centred panel never has blocks passing behind it.
 */
const SIDE_CUBE_POSITIONS = [
  "left-[4%] top-[62%]",
  "left-[13%] top-[26%]",
  "left-[23%] top-[78%]",
  "left-[8%] top-[42%]",
  "left-[25%] top-[14%]",
  "left-[74%] top-[70%]",
  "left-[85%] top-[32%]",
  "left-[93%] top-[58%]",
  "left-[77%] top-[16%]",
];

const SIDE_STREAK_POSITIONS = [
  "left-[7%] top-[20%]",
  "left-[19%] top-[50%]",
  "left-[28%] top-[12%]",
  "left-[80%] top-[52%]",
  "left-[95%] top-[24%]",
];

type Carrier = {
  node: HTMLSpanElement;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
};

/**
 * Blocks drift upward on their own CSS animation. The cursor pull is applied to
 * a wrapper around each one, so the two transforms never fight: the wrapper
 * carries position, the inner element keeps its keyframes.
 */
export function RisingBlocks({
  layout = "full",
}: {
  /** "sides" keeps the middle clear for centred content. */
  layout?: "full" | "sides";
} = {}) {
  const cubes =
    layout === "sides"
      ? CUBES.map((cube, index) => ({
          ...cube,
          position: SIDE_CUBE_POSITIONS[index],
        }))
      : CUBES;
  const streaks =
    layout === "sides"
      ? STREAKS.map((streak, index) => ({
          ...streak,
          position: SIDE_STREAK_POSITIONS[index],
        }))
      : STREAKS;
  const fieldRef = useRef<HTMLDivElement>(null);
  const carriers = useRef<Array<Carrier | null>>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef<number | null>(null);

  // Slots are addressed by index rather than pushed, so a re-render that
  // re-runs the ref callbacks cannot register the same block twice.
  const register = (index: number) => (node: HTMLSpanElement | null) => {
    carriers.current[index] = node
      ? { node, baseX: 0, baseY: 0, x: 0, y: 0 }
      : null;
  };

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    /** Layout positions are read per resize, never inside the frame loop. */
    function measure() {
      for (const carrier of carriers.current) {
        if (!carrier) continue;
        carrier.baseX = carrier.node.offsetLeft + carrier.node.offsetWidth / 2;
        carrier.baseY = carrier.node.offsetTop + carrier.node.offsetHeight / 2;
      }
    }

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(field);

    function onPointerMove(event: PointerEvent) {
      const rect = field!.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      pointer.current = inside
        ? { x: event.clientX - rect.left, y: event.clientY - rect.top }
        : null;
    }

    function onPointerLeave() {
      pointer.current = null;
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);

    function tick() {
      const cursor = pointer.current;

      for (const carrier of carriers.current) {
        if (!carrier) continue;
        let targetX = 0;
        let targetY = 0;

        if (cursor) {
          const dx = cursor.x - carrier.baseX;
          const dy = cursor.y - carrier.baseY;
          const distance = Math.hypot(dx, dy);

          if (distance < PULL_RADIUS && distance > 0.5) {
            // Falls off with the square of the distance, so only the blocks
            // close to the cursor move far.
            const strength = (1 - distance / PULL_RADIUS) ** 2 * MAX_PULL;
            targetX = (dx / distance) * strength;
            targetY = (dy / distance) * strength;
          }
        }

        carrier.x += (targetX - carrier.x) * LERP;
        carrier.y += (targetY - carrier.y) * LERP;

        carrier.node.style.transform =
          "translate3d(" + carrier.x + "px, " + carrier.y + "px, 0)";
      }

      frame.current = requestAnimationFrame(tick);
    }

    frame.current = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div className="rise-field" ref={fieldRef} aria-hidden="true">
      {streaks.map((streak, index) => (
        <span
          key={`streak-${index}`}
          ref={register(index)}
          className={`absolute ${streak.position}`}
        >
          <span
            className={`rise-streak block ${streak.size}`}
            style={streak.style}
          />
        </span>
      ))}
      {cubes.map((cube, index) => (
        <span
          key={`cube-${index}`}
          ref={register(streaks.length + index)}
          className={`absolute ${cube.position}`}
        >
          <span
            className={`iso-cube block ${cube.size}`}
            style={cube.style}
          >
            <i className="face-top" />
            <i className="face-left" />
            <i className="face-right" />
          </span>
        </span>
      ))}
    </div>
  );
}

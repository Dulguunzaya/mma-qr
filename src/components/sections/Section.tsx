import type { ReactNode } from "react";
import { KnotMark } from "@/components/common/KnotMark";
import { cn } from "@/lib/utils";

export type SectionTone = "light" | "mist" | "dark";

/** Where the knot motif sits on a navy section. */
type DecorPlacement = "hero" | "high" | "low";

const NAVY_BACKGROUND =
  "radial-gradient(120% 140% at 100% 0%, rgba(63,147,208,0.35), transparent 55%), linear-gradient(125deg, #061a2f 4%, #063457 55%, #105ca8 130%)";

const TONE_CLASS: Record<SectionTone, string> = {
  light: "bg-white text-neutral-800",
  mist: "bg-background text-neutral-800",
  dark: "bg-primary-900 text-white",
};

/**
 * Each placement is anchored to an edge and then shifted by a share of the
 * motif's own height, so it sits the same way whatever the section grows to.
 *
 * The right offset bleeds off the edge on a normal screen, but once the
 * 1200px container stops growing it follows the container instead — past a
 * wide viewport's corner the motif would otherwise sit in a corner of its
 * own, far from anything it decorates.
 */
const DECOR_CLASS: Record<DecorPlacement, string> = {
  hero: "top-1/2 right-[max(-6%,calc(50%_-_280px))] w-[clamp(20rem,46vw,42rem)] -translate-y-1/2 opacity-50",
  high: "top-0 right-[max(-14%,calc(50%_-_840px))] w-[clamp(22rem,52vw,46rem)] -translate-y-[15%] opacity-35",
  low: "bottom-0 right-[max(-16%,calc(50%_-_880px))] w-[clamp(24rem,56vw,50rem)] translate-y-[15%] opacity-30",
};

interface SectionProps {
  children: ReactNode;
  /** Surface colour. Alternate light/mist against dark down a page. */
  tone?: SectionTone;
  /** Adds the knot motif. Dark sections only. */
  decor?: DecorPlacement;
  id?: string;
  className?: string;
  /** Applied to the centered container, e.g. to change vertical rhythm. */
  containerClassName?: string;
  /** Decorative layer painted behind the container, above the tone.  */
  backdrop?: ReactNode;
}

export function Section({
  children,
  tone = "light",
  decor,
  id,
  className,
  containerClassName,
  backdrop,
}: SectionProps) {
  const isDark = tone === "dark";

  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden",
        TONE_CLASS[tone],
        className
      )}
    >
      {isDark && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: NAVY_BACKGROUND }}
          />
          {decor && (
            <KnotMark
              aria-hidden="true"
              fill="none"
              stroke="#4FB0FF"
              strokeWidth={10}
              className={cn(
                "knot-decor absolute hidden aspect-[600/580] md:block",
                DECOR_CLASS[decor]
              )}
            />
          )}
        </>
      )}
      {backdrop}
      <div
        className={cn(
          "relative mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-24 lg:px-10",
          containerClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}

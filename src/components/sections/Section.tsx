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

const DECOR_CLASS: Record<DecorPlacement, string> = {
  hero: "-top-[10%] right-[-6%] h-[92%] opacity-50",
  high: "-top-[22%] right-[-14%] h-[130%] opacity-35",
  low: "-top-[30%] right-[-16%] h-[140%] opacity-30",
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
              preserveAspectRatio="none"
              fill="none"
              stroke="#4FB0FF"
              strokeWidth={10}
              className={cn(
                "knot-decor absolute hidden w-[46vw] max-w-[640px] md:block",
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

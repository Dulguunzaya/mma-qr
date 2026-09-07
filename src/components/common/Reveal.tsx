"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Stagger, in milliseconds, applied as a transition delay. */
  delay?: number;
};

/**
 * Fades content in the first time it scrolls into view.
 *
 * The hidden state only ever exists once this effect has run, and an observer,
 * a passive scroll listener and a first-frame check all resolve to the same
 * one-way reveal. Losing any one of them still shows the content, because
 * failing closed here would leave a section permanently invisible. The styles
 * opt out entirely under reduced motion.
 */
export function Reveal({
  as: Component = "div",
  children,
  className,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let observer: IntersectionObserver | undefined;
    let revealed = false;

    function check() {
      if (revealed || !element) return;
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) show();
    }

    function show() {
      if (revealed || !element) return;
      revealed = true;
      element.classList.add("is-visible");
      cleanup();
    }

    function cleanup() {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      observer?.disconnect();
    }

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) show();
        },
        { threshold: 0.15 },
      );
      observer.observe(element);
    }

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });

    // Content already on screen should not wait for a scroll event; the frame
    // delay lets the browser paint the hidden state so the fade still plays.
    const frame = requestAnimationFrame(check);

    return () => {
      cancelAnimationFrame(frame);
      cleanup();
    };
  }, []);

  return (
    <Component
      ref={ref}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}

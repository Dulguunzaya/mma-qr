import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionTone = "light" | "dark";

interface SectionHeadingProps {
  label: string;
  title: string;
  subtitle?: string;
  tone?: SectionTone;
  viewAllHref?: string;
  viewAllLabel?: string;
}

const TONE = {
  light: {
    label: "text-accent-600",
    rule: "bg-accent-500",
    title: "text-primary-900",
    subtitle: "text-neutral-500",
    link: "text-primary-600 hover:text-accent-700",
  },
  dark: {
    label: "text-accent-300",
    rule: "bg-accent-300",
    title: "text-white",
    subtitle: "text-primary-100/85",
    link: "text-accent-300 hover:text-white",
  },
} as const satisfies Record<SectionTone, Record<string, string>>;

export function SectionHeading({
  label,
  title,
  subtitle,
  tone = "light",
  viewAllHref,
  viewAllLabel,
}: SectionHeadingProps) {
  const styles = TONE[tone];

  return (
    <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p
          className={cn(
            "flex items-center gap-3 font-sans text-xs font-medium uppercase tracking-[0.12em]",
            styles.label
          )}
        >
          <span className={cn("h-px w-8", styles.rule)} aria-hidden="true" />
          {label}
        </p>
        <h2
          className={cn(
            "mt-3 font-sans text-2xl font-semibold leading-tight sm:text-3xl",
            styles.title
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={cn("mt-3 text-base leading-7", styles.subtitle)}>
            {subtitle}
          </p>
        )}
      </div>
      {viewAllHref && viewAllLabel && (
        <Link
          href={viewAllHref}
          className={cn(
            "link-arrow inline-flex shrink-0 items-center gap-2 text-sm font-semibold transition-colors",
            styles.link
          )}
        >
          {viewAllLabel}
          <ArrowRight
            className="h-4 w-4"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}

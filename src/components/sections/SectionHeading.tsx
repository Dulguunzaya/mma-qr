import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  label: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function SectionHeading({
  label,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel,
}: SectionHeadingProps) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="flex items-center gap-3 font-sans text-xs font-medium uppercase tracking-[0.12em] text-accent-600">
          <span className="h-px w-8 bg-accent-500" aria-hidden="true" />
          {label}
        </p>
        <h2 className="mt-3 font-sans text-2xl font-semibold leading-tight text-primary-900 sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 text-base leading-7 text-neutral-500">{subtitle}</p>
        )}
      </div>
      {viewAllHref && viewAllLabel && (
        <Link
          href={viewAllHref}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-accent-700"
        >
          {viewAllLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}

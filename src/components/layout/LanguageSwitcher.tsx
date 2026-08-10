"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = { mn: "МН", en: "EN" };

export function LanguageSwitcher({ locales }: { locales: readonly string[] }) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <div
      className="flex items-center gap-1 text-xs font-sans"
      aria-label={t("language")}
    >
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-neutral-300">/</span>}
          <Link
            href={pathname}
            locale={l}
            className={cn(
              "px-1 py-0.5 transition-colors",
              l === locale
                ? "font-semibold text-primary-700"
                : "text-neutral-500 hover:text-primary-600"
            )}
            aria-current={l === locale ? "page" : undefined}
          >
            {LABELS[l] ?? l.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}

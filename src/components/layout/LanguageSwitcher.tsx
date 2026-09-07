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
      className="flex items-center gap-1 font-sans text-[13px]"
      aria-label={t("language")}
    >
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-neutral-300">/</span>}
          <Link
            href={pathname}
            locale={l}
            className={cn(
              "rounded-full px-1 py-0.5 transition-colors",
              l === locale
                ? "font-semibold text-primary-900"
                : "text-neutral-400 hover:text-primary-700"
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

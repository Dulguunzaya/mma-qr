"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  NAV_DROPDOWN_ITEM_LIMIT,
  type NavEntry,
} from "@/lib/nav";
import { cn } from "@/lib/utils";
import { NavItemLink } from "./NavItemLink";

export function MegaMenu({ entries }: { entries: NavEntry[] }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 150);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label={t("menu")}
      className="hidden lg:block"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(null);
      }}
    >
      <ul className="flex items-center gap-1">
        {entries.map(({ item, children }) => {
          const hasChildren = children.length > 0;
          const hasMoreChildren =
            children.length > NAV_DROPDOWN_ITEM_LIMIT;
          const visibleChildren = children.slice(
            0,
            NAV_DROPDOWN_ITEM_LIMIT
          );
          const isOpen = open === item._id;

          return (
            <li
              key={item._id}
              className="relative"
              onMouseEnter={() => {
                cancelClose();
                if (hasChildren) setOpen(item._id);
              }}
              onMouseLeave={scheduleClose}
            >
              <div className="flex items-center">
                <NavItemLink
                  item={item}
                  className={cn(
                    "group relative px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:text-primary-700",
                    isOpen && "text-primary-700"
                  )}
                />
                {hasChildren && (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-controls={`submenu-${item._id}`}
                    aria-label={`${item.label ?? ""} ${t("menu")}`}
                    onClick={() => setOpen(isOpen ? null : item._id)}
                    className="-ml-2 rounded p-1 text-neutral-500 transition-colors hover:text-primary-700"
                  >
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                )}
              </div>

              {hasChildren && isOpen && (
                <div
                  id={`submenu-${item._id}`}
                  className="absolute left-0 top-full z-50 w-80 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg"
                >
                  <ul className="flex flex-col">
                    {visibleChildren.map((child) => (
                      <li key={child._id}>
                        <NavItemLink
                          item={child}
                          onClick={() => setOpen(null)}
                          className="block rounded-md px-3 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                        />
                      </li>
                    ))}
                    {hasMoreChildren && (
                      <li className="mt-1 border-t border-neutral-100 pt-1">
                        <Link
                          href={item.url ?? "/"}
                          onClick={() => setOpen(null)}
                          className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50"
                        >
                          {t("seeAll")}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

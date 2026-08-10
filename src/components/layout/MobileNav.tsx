"use client";

import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  NAV_DROPDOWN_ITEM_LIMIT,
  type NavEntry,
} from "@/lib/nav";
import { useMobileNav } from "@/hooks/useMobileNav";
import { cn } from "@/lib/utils";
import { NavItemLink } from "./NavItemLink";
import { BrandLogo } from "./BrandLogo";
import { HeaderAuth } from "@/components/auth/HeaderAuth";

export function MobileNav({ entries }: { entries: NavEntry[] }) {
  const t = useTranslations("nav");
  const {
    close,
    expanded,
    isOpen,
    openMenu,
    toggleExpanded,
  } = useMobileNav();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={t("menu")}
        aria-expanded={isOpen}
        onClick={openMenu}
        className="flex h-11 w-11 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("menu")}
            className="fixed inset-0 z-[100] h-dvh w-full bg-background lg:hidden"
          >
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5">
                <BrandLogo />
                <button
                  type="button"
                  aria-label={t("close")}
                  onClick={close}
                  autoFocus
                  className="flex h-11 w-11 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav
                aria-label={t("menu")}
                className="flex-1 overflow-y-auto px-5 py-6"
              >
                <ul className="flex flex-col divide-y divide-neutral-100">
                  {entries.map(({ item, children }) => {
                const hasChildren = children.length > 0;
                const hasMoreChildren =
                  children.length > NAV_DROPDOWN_ITEM_LIMIT;
                const visibleChildren = children.slice(
                  0,
                  NAV_DROPDOWN_ITEM_LIMIT
                );
                const isExpanded = expanded === item._id;
                return (
                  <li key={item._id}>
                    <div className="flex items-center justify-between">
                      <NavItemLink
                        item={item}
                        onClick={close}
                        className="flex-1 py-4 text-base font-medium text-neutral-800"
                      />
                      {hasChildren && (
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={`mobile-submenu-${item._id}`}
                          aria-label={`${item.label ?? ""} ${t("menu")}`}
                          onClick={() => toggleExpanded(item._id)}
                          className="flex h-11 w-11 items-center justify-center text-neutral-500"
                        >
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </button>
                      )}
                    </div>
                    {hasChildren && isExpanded && (
                      <ul
                        id={`mobile-submenu-${item._id}`}
                        className="pb-3 pl-4"
                      >
                        {visibleChildren.map((child) => (
                          <li key={child._id}>
                            <NavItemLink
                              item={child}
                              onClick={close}
                              className="block py-2.5 text-sm text-neutral-600"
                            />
                          </li>
                        ))}
                        {hasMoreChildren && (
                          <li className="mt-1 border-t border-neutral-100 pt-1">
                            <Link
                              href={item.url ?? "/"}
                              onClick={close}
                              className="flex items-center justify-between py-2.5 text-sm font-medium text-primary-700"
                            >
                              {t("seeAll")}
                              <ArrowRight
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                );
                  })}
                </ul>
              </nav>
              <div className="border-t border-neutral-200 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                <div className="flex flex-col gap-2">
                  <HeaderAuth mobile onNavigate={close} />
                  <Link
                    href="/join-as-a-member"
                    onClick={close}
                    className="flex min-h-11 items-center justify-center rounded-md bg-primary-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                  >
                    {t("becomeMember")}
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

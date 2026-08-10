"use client";

import { Link, usePathname } from "@/i18n/routing";
import type { MenuItem } from "@/gql/types";
import { cn } from "@/lib/utils";

type NavItemLinkProps = {
  item: MenuItem;
  className?: string;
  onClick?: () => void;
};

export function NavItemLink({
  item,
  className,
  onClick,
}: NavItemLinkProps) {
  const href = item.url ?? "/";
  const label = item.label ?? "";
  const isExternal = /^https?:\/\//.test(href);
  const isDirectLink = isExternal || /^(mailto|tel):/.test(href);
  const pathname = usePathname();
  const internalHref = href.startsWith("/") ? href : `/${href}`;
  const isActive =
    !isDirectLink &&
    (internalHref === "/"
      ? pathname === "/"
      : pathname === internalHref || pathname.startsWith(`${internalHref}/`));

  if (isDirectLink) {
    return (
      <a
        href={href}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className={className}
        onClick={onClick}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        className,
        isActive && "border-b-2 border-accent-500 text-primary-800"
      )}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

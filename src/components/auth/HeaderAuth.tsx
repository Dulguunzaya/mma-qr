"use client";

import { CircleUserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/lib/auth/AuthContext";
import { cn } from "@/lib/utils";

type HeaderAuthProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export function HeaderAuth({ mobile = false, onNavigate }: HeaderAuthProps) {
  const t = useTranslations("auth");
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <span
        className={cn(
          "animate-pulse bg-neutral-100",
          mobile
            ? "block h-9 w-full rounded-md"
            : "hidden h-10 w-28 rounded-full sm:block",
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <Link
      href={user ? "/account" : "/login"}
      onClick={onNavigate}
      className={cn(
        "items-center gap-2",
        mobile
          ? "flex min-h-11 w-full rounded-md px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          : "hidden h-10 whitespace-nowrap rounded-full bg-primary-900 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-primary-800 sm:flex xl:px-5 xl:text-sm",
      )}
    >
      <CircleUserRound className={mobile ? "h-5 w-5" : "h-4 w-4"} />
      {user ? user.firstName || t("account") : t("login")}
    </Link>
  );
}

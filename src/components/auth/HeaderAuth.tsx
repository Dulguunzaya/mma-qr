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
          "h-9 animate-pulse rounded-md bg-neutral-100",
          mobile ? "block w-full" : "hidden w-20 sm:block",
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
        "items-center gap-2 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100",
        mobile
          ? "flex min-h-11 w-full px-4 py-3"
          : "hidden px-3 py-2 sm:flex",
      )}
    >
      <CircleUserRound className={mobile ? "h-5 w-5" : "h-4 w-4"} />
      {user ? user.firstName || t("account") : t("login")}
    </Link>
  );
}

"use client";

import { CircleUserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/lib/auth/AuthContext";

export function HeaderAuth() {
  const t = useTranslations("auth");
  const { user, loading } = useAuth();

  if (loading) {
    return <span className="hidden h-9 w-20 sm:block" aria-hidden="true" />;
  }

  return (
    <Link
      href={user ? "/account" : "/login"}
      className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 sm:flex"
    >
      <CircleUserRound className="h-4 w-4" />
      {user ? user.firstName || t("account") : t("login")}
    </Link>
  );
}

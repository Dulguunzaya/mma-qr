import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["mn", "en"],
  defaultLocale: "mn",
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

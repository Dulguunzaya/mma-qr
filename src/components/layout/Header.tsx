import { getTranslations } from "next-intl/server";
import { getMenu } from "@/gql/server";
import { buildNav } from "@/lib/nav";
import { Link } from "@/i18n/routing";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { HeaderAuth } from "@/components/auth/HeaderAuth";
import { routing } from "@/i18n/routing";
import { BrandLogo } from "./BrandLogo";

export default async function Header({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const items = await getMenu("header", locale);
  const entries = buildNav(items, {
    home: t("home"),
    about: t("about"),
    events: t("events"),
    international: t("international"),
    education: t("education"),
    members: t("members"),
    news: t("news"),
  });

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary-700 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {t("skipToContent")}
      </a>
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-10">
          <Link
            href="/"
            className="shrink-0 rounded-sm"
          >
            <BrandLogo priority />
          </Link>

          <MegaMenu entries={entries} />

          <div className="flex items-center gap-3">
            <LanguageSwitcher locales={routing.locales} />
            <HeaderAuth />
            <Link
              href="/join-as-a-member"
              className="hidden rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-px hover:bg-primary-700 sm:inline-block"
            >
              {t("becomeMember")}
            </Link>
            <MobileNav entries={entries} />
          </div>
        </div>
      </header>
    </>
  );
}

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
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary-800 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {t("skipToContent")}
      </a>
      <header className="sticky top-0 z-40 pb-2 pt-4">
        <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2 rounded-full border border-white/70 bg-white/95 px-3 shadow-[0_14px_44px_-16px_rgba(10,43,77,0.55)] backdrop-blur-md sm:gap-4 sm:px-5">
            <Link href="/" className="shrink-0 rounded-full">
              <BrandLogo priority className="w-24 sm:w-28 xl:w-32" />
            </Link>

            <MegaMenu entries={entries} />

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <LanguageSwitcher locales={routing.locales} />
              <HeaderAuth />
              <MobileNav entries={entries} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

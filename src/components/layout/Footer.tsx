import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { BrandLogo } from "./BrandLogo";

const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/MongolianMAssoc" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/mongolian-marketing-association",
  },
  { label: "Instagram", href: "https://www.instagram.com/mongolianmassoc/" },
];

const FOOTER_LINKS = [
  { labelKey: "nav.about", href: "/about" },
  { labelKey: "nav.events", href: "/events" },
  { labelKey: "nav.international", href: "/international" },
  { labelKey: "nav.education", href: "/education" },
  { labelKey: "nav.members", href: "/members" },
  { labelKey: "nav.news", href: "/news" },
] as const;

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  const year = new Date().getFullYear();

  return (
    <footer className="bg-footer-bg text-footer-fg">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="inline-flex rounded-lg bg-white p-2 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <BrandLogo />
            </Link>
            <p className="mt-3 text-sm leading-6 text-footer-fg/80">
              {t("meta.tagline")}
            </p>
          </div>

          <nav aria-label={t("footer.explore")}>
            <p className="font-sans text-xs uppercase tracking-wider text-footer-fg/60">
              {t("footer.explore")}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {FOOTER_LINKS.map(({ labelKey, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-footer-fg/80 transition-colors hover:text-white"
                  >
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-sans text-xs uppercase tracking-wider text-footer-fg/60">
              {t("footer.contact")}
            </p>
            <address className="mt-4 flex flex-col gap-2.5 text-sm not-italic text-footer-fg/80">
              <span>{t("contact.address")}</span>
              <a
                href={`mailto:${t("contact.email")}`}
                className="transition-colors hover:text-white"
              >
                {t("contact.email")}
              </a>
            </address>
          </div>

          <div>
            <p className="font-sans text-xs uppercase tracking-wider text-footer-fg/60">
              {t("footer.follow")}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {SOCIALS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-footer-fg/80 transition-colors hover:text-white"
                  >
                    {label}
                    <ArrowUpRight className="h-3.5 w-3.5 text-footer-fg/50 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-footer-fg/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {t("meta.siteName")}. {t("footer.rights")}
          </p>
          <p>{t("footer.location")}</p>
        </div>
      </div>
    </footer>
  );
}

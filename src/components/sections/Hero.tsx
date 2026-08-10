import { getTranslations } from "next-intl/server";
import Image from "@/components/common/Image";
import { Link } from "@/i18n/routing";
import { getPageBySlug, getPosts } from "@/gql/server";
import type { Page } from "@/gql/types";
import { getPlainText, getSubheader } from "@/lib/content";

const TICKET_TAG_ID = "K7wiTmtaz4S_k7tvT56Jb";

const HERO_STATS = [
  { id: "founded", cmsKey: "founded" },
  { id: "partners", cmsKey: "internationalpartner" },
  { id: "experience", cmsKey: "experience" },
] as const;

function getCmsStat(page: Page | null, cmsKey: string): string | null {
  const stats = page?.customFieldsMap?.stats;
  if (!stats || typeof stats !== "object" || Array.isArray(stats)) return null;

  const entry = Object.entries(stats).find(
    ([key]) => key.toLowerCase().replace(/[^a-z0-9]/g, "") === cmsKey,
  );
  const value = entry?.[1];

  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return null;

  return value.trim() || null;
}

export default async function Hero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  const [page, sourcePage, events] = await Promise.all([
    getPageBySlug("hero", locale),
    locale === "mn" ? Promise.resolve(null) : getPageBySlug("hero", "mn"),
    getPosts(locale, { categorySlug: "events", limit: 50 }),
  ]);

  const ticketEvent = events.find(
    (event) => event.slug && event.tagIds?.includes(TICKET_TAG_ID)
  );

  const eyebrow = getSubheader(page);
  const headline = page?.name ?? "";
  const subhead = page?.description
    ? getPlainText(page.description)
    : undefined;
  const credibility =
    getCmsStat(page, "bottom") ?? getCmsStat(sourcePage, "bottom") ?? undefined;

  return (
    <section className="relative overflow-hidden border-b border-neutral-200">
      {page?.thumbnail?.url && (
        <Image
          src={page.thumbnail.url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--color-bg-cream) 0%, rgba(250,250,248,0.97) 48%, rgba(250,250,248,0.58) 72%, rgba(250,250,248,0.14) 100%)",
        }}
      />
      <div className="relative mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-24 lg:px-10 lg:py-28">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="flex items-center gap-3 font-sans text-xs font-medium uppercase tracking-[0.12em] text-accent-600">
              <span className="h-px w-8 bg-accent-500" aria-hidden="true" />
              {eyebrow}
            </p>
          )}
          <h1 className="mt-5 [overflow-wrap:anywhere] font-sans text-[clamp(2rem,9vw,3.75rem)] font-semibold leading-[1.1] tracking-tight text-primary-900">
            {headline}
          </h1>
          {subhead && (
            <p className="mt-6 text-lg leading-8 text-neutral-500">{subhead}</p>
          )}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/join-as-a-member"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary-700 px-6 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-800 hover:shadow-md"
            >
              {t("hero.ctaPrimary")}
            </Link>
            <Link
              href="/events"
              className="inline-flex h-12 items-center justify-center rounded-md border border-neutral-300 bg-white/80 px-6 text-sm font-medium text-primary-700 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-400 hover:text-accent-700"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
          {ticketEvent && (
            <div className="mt-4">
              <Link
                href={`/events/${ticketEvent.slug}`}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent-500 px-5 py-3 text-center text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-md sm:w-auto sm:px-6"
              >
                {t("hero.ticketCta", { event: ticketEvent.title ?? "" })}
              </Link>
            </div>
          )}
          <dl className="mt-10 grid grid-cols-3 divide-x divide-neutral-200 border-y border-neutral-200 py-5">
            {HERO_STATS.map(({ id, cmsKey }) => (
              <div key={id} className="min-w-0 px-2 first:pl-0 last:pr-0 sm:px-4">
                <dt className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm">
                  {t(`hero.stats.${id}.label`)}
                </dt>
                <dd className="[overflow-wrap:anywhere] font-sans text-lg font-semibold text-primary-800 sm:text-2xl">
                  {getCmsStat(page, cmsKey) ?? getCmsStat(sourcePage, cmsKey)}
                </dd>
              </div>
            ))}
          </dl>
          {credibility && (
            <p className="mt-5 font-sans text-[11px] leading-5 tracking-wide text-neutral-500">
              {credibility}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

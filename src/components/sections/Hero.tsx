import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "@/components/common/Image";
import { KnotMark } from "@/components/common/KnotMark";
import { Reveal } from "@/components/common/Reveal";
import { Link } from "@/i18n/routing";
import { getPageBySlug, getPosts } from "@/gql/server";
import type { Page } from "@/gql/types";
import { getPlainText, getSubheader } from "@/lib/content";
import { Section } from "./Section";

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
    <>
      <section className="relative -mt-[88px] overflow-hidden bg-primary-900 pt-[88px] text-white">
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
              "radial-gradient(120% 140% at 100% 0%, rgba(63,147,208,0.35), transparent 55%), linear-gradient(125deg, #061a2f 4%, #063457 55%, #105ca8 130%)",
          }}
        />
        <KnotMark
          aria-hidden="true"
          preserveAspectRatio="none"
          fill="none"
          stroke="#4FB0FF"
          strokeWidth={10}
          className="knot-decor absolute -top-[10%] right-[-6%] hidden h-[92%] w-[46vw] max-w-[640px] opacity-50 md:block"
        />

        <div className="relative mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-28">
          <div className="max-w-3xl">
            {eyebrow && (
              <p className="flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-accent-300">
                <span className="h-px w-8 bg-accent-300" aria-hidden="true" />
                {eyebrow}
              </p>
            )}
            <h1 className="mt-6 [overflow-wrap:anywhere] font-sans text-[clamp(2.25rem,7.5vw,4.75rem)] font-extrabold uppercase leading-[1.06] tracking-[-0.01em] text-white">
              {headline}
            </h1>
            {subhead && (
              <p className="mt-7 max-w-2xl text-base leading-8 text-primary-100/85 sm:text-lg">
                {subhead}
              </p>
            )}
            <div className="mt-10 flex flex-col flex-wrap gap-4 sm:flex-row sm:items-center">
              <Link
                href="/join-as-a-member"
                className="btn-brand inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-6 text-sm font-bold sm:h-14 sm:px-8"
              >
                {t("hero.ctaPrimary")}
                <ArrowUpRight
                  className="btn-arrow-diag h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/events"
                className="btn-outline-light inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-6 text-sm font-bold sm:h-14 sm:px-8"
              >
                {t("hero.ctaSecondary")}
                <ArrowRight
                  className="btn-arrow h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
              {ticketEvent && (
                <Link
                  href={`/events/${ticketEvent.slug}`}
                  className="btn-outline-light inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 py-3 text-center text-sm font-bold sm:min-h-14 sm:px-8"
                >
                  {t("hero.ticketCta", { event: ticketEvent.title ?? "" })}
                  <ArrowRight
                    className="btn-arrow h-4 w-4"
                    aria-hidden="true"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <Section
        tone="light"
       
        containerClassName="py-14 sm:py-20"
      >
        <div className="grid gap-10 sm:gap-8 lg:grid-cols-4">
          <dl className="grid gap-10 sm:grid-cols-3 sm:gap-8 lg:col-span-3">
            {HERO_STATS.map(({ id, cmsKey }, index) => (
              <Reveal
                key={id}
                className="flex min-w-0 flex-col-reverse items-start"
                delay={index * 90}
              >
                <dt className="mt-3.5 max-w-[200px] text-sm leading-6 text-neutral-500">
                  {t(`hero.stats.${id}.label`)}
                </dt>
                <dd className="[overflow-wrap:anywhere] font-sans text-[clamp(2.875rem,6vw,4.75rem)] font-extralight leading-none tracking-[-0.02em] text-primary-900">
                  {getCmsStat(page, cmsKey) ?? getCmsStat(sourcePage, cmsKey)}
                </dd>
              </Reveal>
            ))}
          </dl>
          {credibility && (
            <Reveal
              as="p"
              delay={270}
              className="text-sm leading-7 text-neutral-500"
            >
              {credibility}
            </Reveal>
          )}
        </div>
      </Section>
    </>
  );
}

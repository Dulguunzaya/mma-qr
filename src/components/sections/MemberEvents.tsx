import { getTranslations } from "next-intl/server";
import { ArrowUpRight, CalendarDays, Lock } from "lucide-react";
import { getPosts } from "@/gql/server";
import { Link } from "@/i18n/routing";
import { formatDate } from "@/lib/date";
import { Reveal } from "@/components/common/Reveal";
import { CmsSectionHeading } from "./CmsSectionHeading";
import { Section } from "./Section";

export default async function MemberEvents({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  const posts = await getPosts(locale, { categorySlug: "members", limit: 5 });

  if (posts.length === 0) return null;

  return (
    <Section tone="dark" decor="low">
      <CmsSectionHeading
        slug="member-events"
        locale={locale}
        tone="dark"
        viewAllHref="/members-only-events"
        viewAllLabel={t("sections.memberEvents.viewAll")}
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <ol className="border-t border-white/15">
          {posts.map((post, index) => {
            const eventDate =
              (post.customFieldsData?.eventDate as string | undefined) ??
              (post.customFieldsData?.startDate as string | undefined);
            const date = eventDate ?? post.publishedDate ?? post.createdAt;
            const formattedDate = formatDate(date);

            return (
              <Reveal
                key={post._id}
                as="li"
                className="group flex gap-4 rounded-2xl border-b border-white/15 px-1 py-5 transition-[padding,background-color] duration-500 ease-brand hover:bg-white/[0.045] hover:pl-4 sm:items-center sm:gap-6"
                delay={index * 70}
              >
                <div className="flex w-20 shrink-0 flex-col">
                  <CalendarDays
                    className="mb-2 h-4 w-4 text-accent-300"
                    aria-hidden="true"
                  />
                  <time
                    dateTime={date}
                    className="font-sans text-[13px] font-bold leading-5 tracking-[0.02em] text-accent-200"
                  >
                    {formattedDate ?? "—"}
                  </time>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white sm:text-base">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-1 line-clamp-1 text-sm leading-6 text-primary-100/80">
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-highlight px-3 py-1.5 font-sans text-[11px] font-extrabold uppercase tracking-[0.04em] text-primary-900 sm:inline-flex">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  {t("cards.memberOnly")}
                </span>
              </Reveal>
            );
          })}
        </ol>
        <Reveal
          as="aside"
          className="rounded-[26px] border border-white/15 bg-linear-[150deg] from-white/10 to-white/[0.02] p-8 backdrop-blur-sm sm:p-9"
          delay={120}
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/12 text-accent-300">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-7 flex items-center gap-3 font-sans text-[13px] font-bold uppercase tracking-[0.14em] text-accent-300">
            <span className="h-px w-5 bg-accent-300" aria-hidden="true" />
            {t("sections.memberEvents.ctaLabel")}
          </p>
          <h3 className="mt-4 font-sans text-2xl font-extrabold leading-snug text-white">
            {t("sections.memberEvents.ctaTitle")}
          </h3>
          <p className="mt-3.5 text-sm leading-6 text-primary-100/85">
            {t("sections.memberEvents.ctaText")}
          </p>
          <Link
            href="/join-as-a-member"
            className="btn-brand mt-7 inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-7 text-[15px] font-bold"
          >
            {t("sections.memberEvents.ctaButton")}
            <ArrowUpRight
              className="btn-arrow-diag h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}

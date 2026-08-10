import { getTranslations } from "next-intl/server";
import { ArrowRight, CalendarDays, Lock } from "lucide-react";
import { getPosts } from "@/gql/server";
import { Link } from "@/i18n/routing";
import { formatDate } from "@/lib/date";
import { CmsSectionHeading } from "./CmsSectionHeading";

export default async function MemberEvents({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  const posts = await getPosts(locale, { categorySlug: "members", limit: 5 });

  if (posts.length === 0) return null;

  return (
    <section className="border-y border-accent-100 bg-accent-50/60">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-24 lg:px-10">
        <CmsSectionHeading
          slug="member-events"
          locale={locale}
          viewAllHref="/members-only-events"
          viewAllLabel={t("sections.memberEvents.viewAll")}
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <ol className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            {posts.map((post) => {
              const eventDate =
                (post.customFieldsData?.eventDate as string | undefined) ??
                (post.customFieldsData?.startDate as string | undefined);
              const date = eventDate ?? post.publishedDate ?? post.createdAt;
              const formattedDate = formatDate(date);

              return (
                <li
                  key={post._id}
                  className="group flex gap-4 border-b border-neutral-100 px-5 py-5 transition-colors last:border-b-0 hover:bg-accent-50/70 sm:items-center sm:gap-6 sm:px-6"
                >
                  <div className="flex w-20 shrink-0 flex-col border-r border-neutral-200 pr-4">
                    <CalendarDays
                      className="mb-2 h-4 w-4 text-accent-600"
                      aria-hidden="true"
                    />
                    <time
                      dateTime={date}
                      className="font-sans text-[11px] leading-5 text-neutral-500"
                    >
                      {formattedDate ?? "—"}
                    </time>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-primary-800 transition-colors group-hover:text-accent-700 sm:text-base">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-1 line-clamp-1 text-sm text-neutral-500">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-wide text-accent-700 sm:inline-flex">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    {t("cards.memberOnly")}
                  </span>
                </li>
              );
            })}
          </ol>
          <aside className="relative overflow-hidden rounded-lg bg-primary-800 p-7 text-white shadow-md">
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 h-36 w-36 rounded-full border border-accent-500/50"
            />
            <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-md bg-accent-500 text-white">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="relative mt-8 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-accent-300">
              {t("sections.memberEvents.ctaLabel")}
            </p>
            <h3 className="relative mt-3 font-sans text-xl font-semibold leading-snug">
              {t("sections.memberEvents.ctaTitle")}
            </h3>
            <p className="relative mt-3 text-sm leading-6 text-primary-100/80">
              {t("sections.memberEvents.ctaText")}
            </p>
            <Link
              href="/join-as-a-member"
              className="relative mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent-500 px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-md"
            >
              {t("sections.memberEvents.ctaButton")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

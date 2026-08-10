import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Lock } from "lucide-react";
import { getPageBySlug, getPages, getPosts } from "@/gql/server";
import type { Post } from "@/gql/types";
import { getPlainText, getSubheader, NON_ROUTE_PAGE_SLUGS } from "@/lib/content";
import { routing } from "@/i18n/routing";
import { PageHero } from "@/components/sections/PageHero";
import { HubPageHero } from "@/components/sections/HubPageHero";
import { CmsSectionHeading } from "@/components/sections/CmsSectionHeading";
import { EventCard } from "@/components/cards/EventCard";
import { EducationCard } from "@/components/cards/EducationCard";
import { InternationalCard } from "@/components/cards/InternationalCard";
import { NewsCard } from "@/components/cards/NewsCard";
import LeadForm from "@/components/forms/LeadForm";
import AboutPage from "@/components/pages/AboutPage";

type HubKind = "events" | "education" | "international" | "members";

const HUBS: Record<string, HubKind> = {
  events: "events",
  education: "education",
  international: "international",
  members: "members",
  "members-only-events": "members",
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const results = await Promise.all(
    routing.locales.map(async (locale) => {
      const pages = await getPages(locale);
      return pages
        .filter((p) => p.slug && !NON_ROUTE_PAGE_SLUGS.has(p.slug))
        .map((p) => ({ slug: p.slug as string }));
    })
  );
  return results.flat();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = await getPageBySlug(slug, locale);
  if (!page) return {};
  const description = page.description
    ? getPlainText(page.description)
    : undefined;

  return {
    title: page.name,
    description,
    openGraph: {
      title: page.name,
      description,
      type: "website",
    },
    twitter: { card: "summary" },
  };
}

function MemberRows({ posts, badge }: { posts: Post[]; badge: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {posts.map((post) => (
        <div
          key={post._id}
          className="flex items-center justify-between gap-4 border-b border-neutral-100 px-5 py-4 last:border-b-0 sm:px-6"
        >
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-neutral-800 sm:text-base">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="mt-0.5 line-clamp-1 text-sm text-neutral-500">
                {post.excerpt}
              </p>
            )}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-wide text-accent-700">
            <Lock className="h-3 w-3" aria-hidden="true" />
            {badge}
          </span>
        </div>
      ))}
    </div>
  );
}

function HubContent({
  hub,
  posts,
  memberBadge,
}: {
  hub?: HubKind;
  posts: Post[];
  memberBadge: string;
}) {
  if (!hub || posts.length === 0) return null;
  if (hub === "members") {
    return <MemberRows posts={posts} badge={memberBadge} />;
  }

  if (hub === "international") {
    return (
      <div className="grid gap-px overflow-hidden rounded-lg bg-primary-600 shadow-md sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post, index) => (
          <InternationalCard key={post._id} post={post} index={index} />
        ))}
      </div>
    );
  }

  if (hub === "education") {
    const [featuredPost, ...secondaryPosts] = posts;
    const upperPrograms = secondaryPosts.slice(0, 2);
    const remainingPrograms = secondaryPosts.slice(2);

    return (
      <div>
        <div className="grid gap-6 lg:grid-cols-2">
          <EducationCard post={featuredPost} featured />
          {upperPrograms.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {upperPrograms.map((post) => (
                <EducationCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
        {remainingPrograms.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {remainingPrograms.map((post) => (
              <EducationCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => {
        if (hub === "events") return <EventCard key={post._id} post={post} />;
        return <InternationalCard key={post._id} post={post} />;
      })}
    </div>
  );
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = await getPageBySlug(slug, locale);
  if (!page) notFound();

  if (slug === "about") {
    const [
      purpose,
      values,
      directions,
      history,
      management,
      presidents,
      leadership,
      presidentDates,
    ] = await Promise.all([
        getPageBySlug("purpose", locale),
        getPosts(locale, {
          categorySlug: "about-values",
          limit: 20,
          sortDirection: "asc",
        }),
        getPosts(locale, {
          categorySlug: "about-directions",
          limit: 20,
          sortDirection: "asc",
        }),
        getPosts(locale, {
          categorySlug: "about-history",
          limit: 20,
          sortDirection: "asc",
        }),
        getPosts(locale, {
          categorySlug: "about-management",
          limit: 50,
          sortDirection: "asc",
        }),
        getPosts(locale, {
          categorySlug: "about-presidents",
          limit: 50,
          sortDirection: "asc",
        }),
        getPosts(locale, {
          categorySlug: "about-leadership",
          limit: 50,
          sortDirection: "asc",
        }),
        getPosts("mn", {
          categorySlug: "about-presidents",
          limit: 50,
          sortDirection: "asc",
        }),
      ]);

    if (!purpose) notFound();

    return (
      <AboutPage
        locale={locale}
        page={page}
        purpose={purpose}
        values={values}
        directions={directions}
        history={history}
        management={management}
        presidents={presidents}
        leadership={leadership}
        presidentDates={presidentDates}
      />
    );
  }

  const t = await getTranslations({ locale });
  const hub = HUBS[slug];
  const posts = hub
    ? await getPosts(locale, { categorySlug: hub, limit: 100 })
    : [];
  const internationalNewsPosts =
    hub === "international"
      ? await getPosts(locale, {
          categorySlug: "international-news",
          limit: 4,
        })
      : [];
  const isEditorialHub = hub === "education" || hub === "international";

  if (isEditorialHub) {
    return (
      <>
        <HubPageHero
          variant={hub}
          eyebrow={getSubheader(page)}
          title={page.name ?? ""}
          description={page.content}
          itemCount={posts.length}
          itemLabel={t(`pages.${hub}.collectionLabel`)}
          browseLabel={t(`pages.${hub}.browseLabel`)}
        />
        <section
          id="page-content"
          className="mx-auto max-w-[1200px] scroll-mt-24 px-6 pb-14 pt-8 sm:pb-20 sm:pt-10 lg:px-10"
        >
          <CmsSectionHeading slug={`${hub}-listing`} locale={locale} />

          {posts.length > 0 ? (
            <HubContent
              hub={hub}
              posts={posts}
              memberBadge={t("cards.memberOnly")}
            />
          ) : (
            <p className="rounded-lg border border-neutral-200 bg-white px-6 py-10 text-sm text-neutral-500">
              {t(`pages.${hub}.empty`)}
            </p>
          )}

          {hub === "international" && internationalNewsPosts.length > 0 && (
            <div className="mt-16 border-t border-neutral-200 pt-14 sm:mt-20 sm:pt-16">
              <CmsSectionHeading slug="international-news" locale={locale} />
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                <NewsCard
                  post={internationalNewsPosts[0]}
                  featured
                  hrefBase="/international"
                />
                {internationalNewsPosts.length > 1 && (
                  <div className="rounded-lg border border-neutral-200 bg-white px-5 sm:px-6">
                    {internationalNewsPosts.slice(1).map((post) => (
                      <NewsCard
                        key={post._id}
                        post={post}
                        hrefBase="/international"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={page.name ?? ""}
        eyebrow={getSubheader(page)}
        description={page.content}
      />
      <div className="mx-auto max-w-[1200px] px-6 pb-12 pt-8 sm:pb-16 sm:pt-10 lg:px-10">
        <HubContent
          hub={hub}
          posts={posts}
          memberBadge={t("cards.memberOnly")}
        />

        {slug === "join-as-a-member" && (
          <div className="mx-auto max-w-2xl">
            <LeadForm />
          </div>
        )}
      </div>
    </>
  );
}

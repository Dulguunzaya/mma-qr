import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getPageBySlug, getPosts } from "@/gql/server";
import { getSubheader } from "@/lib/content";
import { HubPageHero } from "@/components/sections/HubPageHero";
import { CmsSectionHeading } from "@/components/sections/CmsSectionHeading";
import NewsList from "@/components/NewsList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "news" });
  return {
    title: t("title"),
    description: t("subtitle"),
    openGraph: { title: t("title"), description: t("subtitle"), type: "website" },
  };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "news" });
  const [page, posts] = await Promise.all([
    getPageBySlug("news", locale),
    getPosts(locale, { categorySlug: "news", limit: 100 }),
  ]);

  return (
    <>
      <HubPageHero
        variant="news"
        eyebrow={getSubheader(page)}
        title={page?.name ?? ""}
        description={page?.content}
        itemCount={posts.length}
        itemLabel={t("collectionLabel")}
        browseLabel={t("browseLabel")}
      />
      <section
        id="page-content"
        className="mx-auto max-w-[1200px] scroll-mt-24 px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-10"
      >
        <CmsSectionHeading slug="news-listing" locale={locale} />
        <NewsList posts={posts} />
      </section>
    </>
  );
}

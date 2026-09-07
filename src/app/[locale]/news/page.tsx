import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getPageBySlug, getPosts } from "@/gql/server";
import { getSubheader } from "@/lib/content";
import { HubPageHero } from "@/components/sections/HubPageHero";
import { CmsSectionHeading } from "@/components/sections/CmsSectionHeading";
import NewsList from "@/components/NewsList";
import { Section } from "@/components/sections/Section";

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
      <Section
        tone="light"
        id="page-content"
        className="scroll-mt-24"
        containerClassName="py-14 sm:py-20"
      >
        <CmsSectionHeading slug="news-listing" locale={locale} />
        <NewsList posts={posts} />
      </Section>
    </>
  );
}

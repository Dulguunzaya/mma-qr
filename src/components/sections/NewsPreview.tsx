import { getTranslations } from "next-intl/server";
import { getPosts } from "@/gql/server";
import { NewsCard } from "@/components/cards/NewsCard";
import { CmsSectionHeading } from "./CmsSectionHeading";

export default async function NewsPreview({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "sections" });
  const posts = await getPosts(locale, { categorySlug: "news", limit: 4 });

  if (posts.length === 0) return null;
  const [featuredPost, ...secondaryPosts] = posts;

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-24 lg:px-10">
      <CmsSectionHeading
        slug="news-preview"
        locale={locale}
        viewAllHref="/news"
        viewAllLabel={t("news.viewAll")}
      />
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <NewsCard post={featuredPost} featured />
        {secondaryPosts.length > 0 && (
          <div className="rounded-lg border border-neutral-200 bg-white px-5 sm:px-6">
            {secondaryPosts.map((post) => (
              <NewsCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

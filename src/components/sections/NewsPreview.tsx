import { getTranslations } from "next-intl/server";
import { getPosts } from "@/gql/server";
import { NewsCard } from "@/components/cards/NewsCard";
import { Reveal } from "@/components/common/Reveal";
import { CmsSectionHeading } from "./CmsSectionHeading";
import { Section } from "./Section";

export default async function NewsPreview({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "sections" });
  const posts = await getPosts(locale, { categorySlug: "news", limit: 4 });

  if (posts.length === 0) return null;
  const [featuredPost, ...secondaryPosts] = posts;

  return (
    <Section tone="light">
      <CmsSectionHeading
        slug="news-preview"
        locale={locale}
        viewAllHref="/news"
        viewAllLabel={t("news.viewAll")}
      />
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal className="h-full">
          <NewsCard post={featuredPost} featured />
        </Reveal>
        {secondaryPosts.length > 0 && (
          <Reveal
            delay={110}
            className="rounded-2xl border border-neutral-200 bg-white px-5 sm:px-6"
          >
            {secondaryPosts.map((post) => (
              <NewsCard key={post._id} post={post} />
            ))}
          </Reveal>
        )}
      </div>
    </Section>
  );
}

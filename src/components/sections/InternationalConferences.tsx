import { getTranslations } from "next-intl/server";
import { getPosts } from "@/gql/server";
import { InternationalCard } from "@/components/cards/InternationalCard";
import { Reveal } from "@/components/common/Reveal";
import { CmsSectionHeading } from "./CmsSectionHeading";
import { Section } from "./Section";

export default async function InternationalConferences({
  locale,
}: {
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "sections" });
  const posts = await getPosts(locale, {
    categorySlug: "international",
    limit: 4,
  });

  if (posts.length === 0) return null;

  return (
    <Section tone="light">
      <CmsSectionHeading
        slug="international-conferences"
        locale={locale}
        viewAllHref="/international"
        viewAllLabel={t("international.viewAll")}
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post, index) => (
          <Reveal key={post._id} className="h-full" delay={index * 80}>
            <InternationalCard post={post} index={index} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

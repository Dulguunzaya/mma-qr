import { getTranslations } from "next-intl/server";
import { getPosts } from "@/gql/server";
import { EducationCard } from "@/components/cards/EducationCard";
import { Reveal } from "@/components/common/Reveal";
import { CmsSectionHeading } from "./CmsSectionHeading";
import { Section } from "./Section";

export default async function EducationPrograms({
  locale,
}: {
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "sections" });
  const posts = await getPosts(locale, {
    categorySlug: "education",
    limit: 7,
  });

  if (posts.length === 0) return null;

  return (
    <Section tone="mist">
      <CmsSectionHeading
        slug="education-programs"
        locale={locale}
        viewAllHref="/education"
        viewAllLabel={t("education.viewAll")}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(1).map((post, index) => (
          <Reveal key={post._id} className="h-full" delay={index * 80}>
            <EducationCard post={post} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

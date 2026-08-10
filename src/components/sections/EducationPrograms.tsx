import { getTranslations } from "next-intl/server";
import { getPosts } from "@/gql/server";
import { EducationCard } from "@/components/cards/EducationCard";
import { CmsSectionHeading } from "./CmsSectionHeading";

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
    <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-24 lg:px-10">
      <CmsSectionHeading
        slug="education-programs"
        locale={locale}
        viewAllHref="/education"
        viewAllLabel={t("education.viewAll")}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(1).map((post) => (
          <EducationCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}

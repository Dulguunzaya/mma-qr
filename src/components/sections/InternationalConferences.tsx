import { getTranslations } from "next-intl/server";
import { getPosts } from "@/gql/server";
import { InternationalCard } from "@/components/cards/InternationalCard";
import { CmsSectionHeading } from "./CmsSectionHeading";

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
    <section className="border-y border-neutral-200 bg-primary-50/50">
      <div className="mx-auto max-w-[1200px] px-6 py-16 sm:py-24 lg:px-10">
        <CmsSectionHeading
          slug="international-conferences"
          locale={locale}
          viewAllHref="/international"
          viewAllLabel={t("international.viewAll")}
        />
        <div className="grid gap-px overflow-hidden rounded-lg bg-primary-600 shadow-md sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post, index) => (
            <InternationalCard key={post._id} post={post} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

import { getTranslations } from "next-intl/server";
import { getPosts } from "@/gql/server";
import { EventCard } from "@/components/cards/EventCard";
import { CmsSectionHeading } from "./CmsSectionHeading";

export default async function FlagshipEvents({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "sections" });
  const posts = await getPosts(locale, { categorySlug: "events", limit: 4 });

  if (posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 sm:py-24 lg:px-10">
      <CmsSectionHeading
        slug="flagship-events"
        locale={locale}
        viewAllHref="/events"
        viewAllLabel={t("flagshipEvents.viewAll")}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post, index) => (
          <EventCard key={post._id} post={post} index={index} />
        ))}
      </div>
    </section>
  );
}

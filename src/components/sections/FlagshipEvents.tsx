import { getTranslations } from "next-intl/server";
import { getPosts } from "@/gql/server";
import { EventCard } from "@/components/cards/EventCard";
import { Reveal } from "@/components/common/Reveal";
import { CmsSectionHeading } from "./CmsSectionHeading";
import { Section } from "./Section";

export default async function FlagshipEvents({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "sections" });
  const posts = await getPosts(locale, { categorySlug: "events", limit: 4 });

  if (posts.length === 0) return null;

  return (
    <Section tone="dark" decor="high">
      <CmsSectionHeading
        slug="flagship-events"
        locale={locale}
        tone="dark"
        viewAllHref="/events"
        viewAllLabel={t("flagshipEvents.viewAll")}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post, index) => (
          <Reveal key={post._id} className="h-full" delay={index * 90}>
            <EventCard post={post} index={index} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getPageBySlug } from "@/gql/server";
import { getSubheader } from "@/lib/content";
import { PageHero } from "@/components/sections/PageHero";
import LeadForm from "@/components/forms/LeadForm";
import { Section } from "@/components/sections/Section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    openGraph: { title: t("title"), type: "website" },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const page = await getPageBySlug("contact", locale);

  return (
    <>
      <PageHero
        title={page?.name ?? ""}
        eyebrow={getSubheader(page)}
        description={page?.content}
      />
      <Section tone="light" containerClassName="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <address className="flex flex-col gap-3 text-sm not-italic text-neutral-600">
              <span className="font-medium text-neutral-800">
                {t("contact.address")}
              </span>
              <a
                href={`mailto:${t("contact.email")}`}
                className="text-primary-600 transition-colors hover:text-primary-800"
              >
                {t("contact.email")}
              </a>
            </address>
          </div>
          <div>
            <LeadForm />
          </div>
        </div>
      </Section>
    </>
  );
}

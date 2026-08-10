import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import FlagshipEvents from "@/components/sections/FlagshipEvents";
import InternationalConferences from "@/components/sections/InternationalConferences";
import EducationPrograms from "@/components/sections/EducationPrograms";
import MemberEvents from "@/components/sections/MemberEvents";
import NewsPreview from "@/components/sections/NewsPreview";
import PartnerNetwork from "@/components/sections/PartnerNetwork";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero locale={locale} />
      <FlagshipEvents locale={locale} />
      <InternationalConferences locale={locale} />
      <EducationPrograms locale={locale} />
      <MemberEvents locale={locale} />
      <NewsPreview locale={locale} />
      <PartnerNetwork locale={locale} />
    </>
  );
}

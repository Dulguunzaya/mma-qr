import { getPageBySlug } from "@/gql/server";
import { getPlainText, getSubheader } from "@/lib/content";
import { SectionHeading } from "./SectionHeading";

interface CmsSectionHeadingProps {
  slug: string;
  locale: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export async function CmsSectionHeading({
  slug,
  locale,
  viewAllHref,
  viewAllLabel,
}: CmsSectionHeadingProps) {
  const page = await getPageBySlug(slug, locale);
  if (!page) return null;

  return (
    <SectionHeading
      label={getSubheader(page) ?? ""}
      title={page.name ?? ""}
      subtitle={page.description ? getPlainText(page.description) : undefined}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
    />
  );
}

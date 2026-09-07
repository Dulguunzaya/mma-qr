import { getPageBySlug } from "@/gql/server";
import { getPlainText, getSubheader } from "@/lib/content";
import { SectionHeading } from "./SectionHeading";

interface CmsSectionHeadingProps {
  slug: string;
  locale: string;
  tone?: "light" | "dark";
  viewAllHref?: string;
  viewAllLabel?: string;
}

export async function CmsSectionHeading({
  slug,
  locale,
  tone,
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
      tone={tone}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
    />
  );
}

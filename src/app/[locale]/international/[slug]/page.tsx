import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getPostBySlug } from "@/gql/server";
import { getPostMetadata, getPostParams } from "@/lib/post-route";
import { PostDetail } from "@/components/PostDetail";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getPostParams(["international", "international-news"]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return getPostMetadata(locale, slug);
}

export default async function InternationalDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pages.international" });
  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();

  return (
    <PostDetail
      post={post}
      backHref="/international"
      backLabel={t("title")}
    />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getPostBySlug } from "@/gql/server";
import { getPostMetadata, getPostParams } from "@/lib/post-route";
import EventDetailView from "@/components/pages/EventDetailPage";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getPostParams("events");
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

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();

  return <EventDetailView post={post} locale={locale} />;
}

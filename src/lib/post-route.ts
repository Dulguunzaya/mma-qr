import type { Metadata } from "next";
import { getPostBySlug, getPosts } from "@/gql/server";
import { routing } from "@/i18n/routing";

export async function getPostParams(categorySlugs: string | string[]) {
  const slugs = Array.isArray(categorySlugs) ? categorySlugs : [categorySlugs];
  const postsByLocale = await Promise.all(
    routing.locales.map(async (locale) => {
      const posts = (
        await Promise.all(
          slugs.map((categorySlug) =>
            getPosts(locale, { categorySlug, limit: 100 })
          )
        )
      ).flat();
      return posts.flatMap((post) =>
        post.slug ? [{ slug: post.slug }] : []
      );
    })
  );
  return postsByLocale.flat();
}

export async function getPostMetadata(
  locale: string,
  slug: string,
  includePublishedTime = false
): Promise<Metadata> {
  const post = await getPostBySlug(slug, locale);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      ...(includePublishedTime && post.publishedDate
        ? { publishedTime: post.publishedDate }
        : {}),
    },
  };
}

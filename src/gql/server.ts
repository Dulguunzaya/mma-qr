import "server-only";

import { cache } from "react";
import { requestGraphQL } from "./request";
import {
  CATEGORIES_QUERY,
  MENUS_QUERY,
  PAGES_QUERY,
  PAGE_DETAIL_QUERY,
  POST_QUERY,
  POSTS_QUERY,
  PRODUCT_DETAIL_QUERY,
} from "./queries";
import type { MenuItem, Page, Post, PostCategory, Product } from "./types";

const endpoint =
  process.env.GRAPHQL_URL ??
  process.env.NEXT_PUBLIC_ERXES_ENDPOINT ??
  process.env.NEXT_PUBLIC_GRAPHQL_URL;

const appToken =
  process.env.ERXES_APP_TOKEN ?? process.env.NEXT_PUBLIC_ERXES_APP_TOKEN;

function queryServer<TData>(
  query: string,
  variables: Record<string, unknown>
): Promise<TData | null> {
  if (!endpoint) {
    // Keep builds deployable when CMS credentials are supplied only at runtime.
    // Callers already treat missing CMS records as empty content.
    return Promise.resolve(null);
  }

  return requestGraphQL<TData>({
    endpoint,
    appToken,
    query,
    variables,
    cache: "no-store",
  });
}

const loadPages = cache(async (language: string): Promise<Page[]> => {
  const data = await queryServer<{
    cpPageList?: { pages?: Page[] };
  }>(PAGES_QUERY, { language, limit: 100 });
  return data?.cpPageList?.pages ?? [];
});

export function getPages(language: string): Promise<Page[]> {
  return loadPages(language);
}

const loadPageBySlug = cache(
  async (slug: string, language: string): Promise<Page | null> => {
    const data = await queryServer<{ cpCmsPageDetail: Page | null }>(
      PAGE_DETAIL_QUERY,
      { slug, language }
    );
    return data?.cpCmsPageDetail ?? null;
  }
);

export function getPageBySlug(
  slug: string,
  language: string
): Promise<Page | null> {
  return loadPageBySlug(slug, language);
}

const CATEGORY_ALIASES: Record<string, string[]> = {
  events: ["events", "arga-khemjee"],
  education: ["education", "bolovsrol"],
  international: ["international", "olon-uls"],
  "international-news": ["international-news", "olon-ulsyn-medee"],
  "about-values": ["unet-zuils"],
  "about-directions": ["mmkh-ny-uil-ajillagaany-chiglel"],
  "about-history": ["bidnii-tuukh"],
  "about-management": ["menejmentiin-bag"],
  "about-presidents": ["ue-ueiin-erunkhiilugchid"],
  "about-leadership": ["udirdlagyn-bag"],
  partners: ["olon-ulsyn-suljee", "olon-ulsyn-tunshuud"],
  members: ["members", "gishuuded"],
  news: ["news", "medee"],
};

const loadCategories = cache(
  async (language: string): Promise<PostCategory[]> => {
    const data = await queryServer<{
      cpCategories?: { list?: PostCategory[] };
    }>(CATEGORIES_QUERY, { language, limit: 100 });
    return data?.cpCategories?.list ?? [];
  }
);

async function getCategoryId(
  slug: string,
  language: string
): Promise<string | null> {
  const categories = await loadCategories(language);
  const aliases = CATEGORY_ALIASES[slug] ?? [slug];

  for (const alias of aliases) {
    const category = categories.find((entry) => entry.slug === alias);
    if (category) return category._id;
  }

  return null;
}

type GetPostsOptions = {
  categorySlug?: string;
  limit?: number;
  sortDirection?: "asc" | "desc";
};

export async function getPosts(
  language: string,
  options: GetPostsOptions = {}
): Promise<Post[]> {
  const { categorySlug, limit = 50, sortDirection } = options;
  const categoryId = categorySlug
    ? await getCategoryId(categorySlug, language)
    : null;

  if (categorySlug && !categoryId) return [];

  const data = await queryServer<{ cpPosts: Post[] }>(POSTS_QUERY, {
    language,
    status: "published",
    categoryIds: categoryId ? [categoryId] : undefined,
    sortField: "publishedDate",
    sortDirection,
    limit,
  });

  return data?.cpPosts ?? [];
}

export async function getPostBySlug(
  slug: string,
  language: string
): Promise<Post | null> {
  const data = await queryServer<{ cpPost: Post | null }>(POST_QUERY, {
    slug,
    language,
  });
  return data?.cpPost ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const data = await queryServer<{ cpProductDetail: Product | null }>(
    PRODUCT_DETAIL_QUERY,
    { id }
  );
  return data?.cpProductDetail ?? null;
}

export async function getMenu(
  kind: "header" | "footer",
  language: string
): Promise<MenuItem[]> {
  const data = await queryServer<{ cpMenus: MenuItem[] }>(MENUS_QUERY, {
    kind,
    language,
  });

  return [...(data?.cpMenus ?? [])].sort(
    (first, second) => (first.order ?? 0) - (second.order ?? 0)
  );
}

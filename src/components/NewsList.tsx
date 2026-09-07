"use client";

import { useTranslations } from "next-intl";
import { NewsCard } from "@/components/cards/NewsCard";
import type { Post } from "@/gql/types";
import { useNewsPagination } from "@/hooks/useNewsPagination";
import { cn } from "@/lib/utils";

const PER_PAGE = 8;

export default function NewsList({ posts }: { posts: Post[] }) {
  const t = useTranslations("news");
  const { page, setPage, totalPages, visibleItems } = useNewsPagination(
    posts,
    PER_PAGE
  );

  if (posts.length === 0) {
    return <p className="py-10 text-sm text-neutral-500">{t("empty")}</p>;
  }

  const [featuredPost, ...secondaryPosts] = visibleItems;

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <NewsCard post={featuredPost} featured />
        {secondaryPosts.length > 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white px-5 sm:px-6">
            {secondaryPosts.map((post) => (
              <NewsCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label={t("pagination")}
          className="mt-10 flex items-center justify-center gap-1"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-medium transition-colors",
                p === page
                  ? "bg-primary-600 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {p}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

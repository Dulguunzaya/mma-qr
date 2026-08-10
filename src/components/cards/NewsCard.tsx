import { useTranslations } from "next-intl";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { Link } from "@/i18n/routing";
import PostImage from "@/components/common/PostImage";
import type { Post } from "@/gql/types";
import { formatDate } from "@/lib/date";

export function NewsCard({
  post,
  featured = false,
  hrefBase = "/news",
}: {
  post: Post;
  featured?: boolean;
  hrefBase?: string;
}) {
  const t = useTranslations("cards");
  const date = post.publishedDate ?? post.createdAt;
  const formattedDate = formatDate(date);

  if (featured) {
    return (
      <article className="group h-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-md">
        <Link href={`${hrefBase}/${post.slug}`} className="flex h-full flex-col">
          <div className="relative aspect-[16/9] overflow-hidden bg-primary-800">
            <PostImage
              post={post}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              fallback={
                <div aria-hidden="true" className="absolute inset-0">
                  <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full border border-primary-500" />
                  <div className="absolute right-2 top-0 h-40 w-40 rounded-full border border-accent-500/60" />
                  <Newspaper className="absolute bottom-7 left-7 h-14 w-14 stroke-[1.25] text-primary-100 transition-transform duration-200 group-hover:-translate-y-1" />
                  <span className="absolute bottom-0 left-0 h-1 w-1/3 bg-accent-500 transition-all duration-300 group-hover:w-full" />
                </div>
              }
            />
          </div>
          <div className="flex flex-1 flex-col p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              {date && formattedDate && (
                <time
                  dateTime={date}
                  className="font-sans text-xs text-neutral-400"
                >
                  {formattedDate}
                </time>
              )}
            </div>
            <h3 className="mt-4 font-sans text-xl font-semibold leading-snug text-primary-900 transition-colors group-hover:text-accent-700 sm:text-2xl">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-500">
                {post.excerpt}
              </p>
            )}
            <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-primary-600 transition-colors group-hover:text-accent-700">
              {t("readMore")}
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group border-b border-neutral-200 py-5 last:border-b-0">
      <Link
        href={`${hrefBase}/${post.slug}`}
        className="flex items-start justify-between gap-6"
      >
        <div className="min-w-0">
          {date && formattedDate && (
            <time
              dateTime={date}
              className="font-sans text-xs uppercase tracking-wider text-accent-700"
            >
              {formattedDate}
            </time>
          )}
          <h3 className="mt-1.5 text-base font-semibold leading-snug text-neutral-800 transition-colors group-hover:text-primary-700">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-neutral-500">
              {post.excerpt}
            </p>
          )}
        </div>
        <PostImage
          post={post}
          fill
          sizes="112px"
          className="object-cover"
          containerClassName="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-md bg-primary-50 sm:block"
          fallback={
            <ArrowUpRight
              className="mt-1 h-4 w-4 shrink-0 text-neutral-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-600"
              aria-hidden="true"
            />
          }
        />
      </Link>
    </article>
  );
}

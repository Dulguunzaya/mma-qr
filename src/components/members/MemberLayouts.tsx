import { ArrowUpRight, CalendarDays, Lock } from "lucide-react";
import Image from "@/components/common/Image";
import type { Post } from "@/gql/types";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

/**
 * Four layouts that repeat as CMS records come through, so a plain list of
 * member events reads as a composed page. The cycle tiles a four-column grid
 * exactly: 2 + 1 + 1 fills one row, then the banner takes the next.
 */
const LAYOUTS = [
  {
    // Wide feature on mid navy.
    span: "lg:col-span-2",
    surface: "bg-navy-mid text-ivory",
    border: "border-white/10",
    aspect: "aspect-[16/9]",
    title: "text-xl sm:text-2xl",
    body: "text-ivory/75",
    meta: "text-ivory/60",
  },
  {
    // Standing card on ivory.
    span: "lg:col-span-1",
    surface: "bg-ivory text-navy-deep",
    border: "border-navy-deep/10",
    aspect: "aspect-[4/3]",
    title: "text-lg",
    body: "text-navy-deep/70",
    meta: "text-navy-mid",
  },
  {
    // Outlined card, the canvas showing through.
    span: "lg:col-span-1",
    surface: "bg-white/[0.04] text-ivory",
    border: "border-ivory/25",
    aspect: "aspect-square",
    title: "text-lg",
    body: "text-ivory/70",
    meta: "text-ivory/55",
  },
  {
    // Full-width banner on ivory.
    span: "lg:col-span-4",
    surface: "bg-ivory text-navy-deep",
    border: "border-navy-deep/10",
    aspect: "aspect-[21/9]",
    title: "text-xl sm:text-3xl",
    body: "text-navy-deep/70",
    meta: "text-navy-mid",
  },
] as const;

export function MemberLayouts({
  posts,
  badge,
}: {
  posts: Post[];
  badge: string;
}) {
  return (
    <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {posts.map((post, index) => {
        const layout = LAYOUTS[index % LAYOUTS.length];
        const isBanner = layout.span === "lg:col-span-4";
        const date = post.publishedDate ?? post.createdAt;
        const formattedDate = formatDate(date);

        return (
          <li
            key={post._id}
            className={cn(
              "group overflow-hidden rounded-3xl border transition-[translate,box-shadow] duration-500 ease-brand hover:-translate-y-1.5 hover:shadow-[0_28px_52px_-20px_rgba(6,20,45,0.7)]",
              layout.span,
              layout.surface,
              layout.border,
              isBanner && "sm:col-span-2"
            )}
          >
            <div className={cn("relative overflow-hidden", layout.aspect)}>
              <Image
                src={post.thumbnail?.url}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                className="object-cover transition-[scale] duration-700 ease-brand group-hover:scale-105"
              />
            </div>

            <div className={cn("p-5", isBanner ? "sm:p-8" : "sm:p-6")}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-highlight px-3 py-1.5 font-sans text-[11px] font-extrabold uppercase tracking-[0.04em] text-navy-deep">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  {badge}
                </span>
                {date && formattedDate && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 font-sans text-[12px] font-bold",
                      layout.meta
                    )}
                  >
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    <time dateTime={date}>{formattedDate}</time>
                  </span>
                )}
              </div>

              <h3
                className={cn(
                  "mt-4 font-sans font-extrabold leading-snug",
                  layout.title
                )}
              >
                {post.title}
              </h3>

              {post.excerpt && (
                <p
                  className={cn(
                    "mt-2.5 text-sm leading-6",
                    layout.body,
                    isBanner ? "max-w-2xl" : "line-clamp-3"
                  )}
                >
                  {post.excerpt}
                </p>
              )}

              <span
                aria-hidden="true"
                className={cn(
                  "mt-5 inline-flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] transition-[background-color,scale] duration-500 ease-brand group-hover:scale-110",
                  layout.surface.includes("bg-ivory")
                    ? "border-navy-deep/25 text-navy-deep group-hover:bg-navy-deep/10"
                    : "border-ivory/35 text-ivory group-hover:bg-white/10"
                )}
              >
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

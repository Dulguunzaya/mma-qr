import { useTranslations } from "next-intl";
import {
  Globe2,
  Megaphone,
  MessagesSquare,
  Presentation,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import PostImage from "@/components/common/PostImage";
import type { Post } from "@/gql/types";

const EVENT_ICONS = [Megaphone, MessagesSquare, Globe2, Presentation];

export function EventCard({ post, index = 0 }: { post: Post; index?: number }) {
  const t = useTranslations("cards");
  const Icon = EVENT_ICONS[index % EVENT_ICONS.length];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent-300 hover:shadow-lg">
      <Link href={`/events/${post.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-primary-50">
          <PostImage
            post={post}
            source="thumbnail"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            fallback={
              <div
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden bg-primary-800"
              >
                <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full border border-accent-400/60" />
                <div className="absolute -right-4 -top-8 h-28 w-28 rounded-full border border-primary-400/60" />
                <div className="absolute inset-x-0 bottom-0 h-1 bg-accent-500" />
                <span className="absolute left-5 top-5 font-sans text-xs tracking-[0.18em] text-accent-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon className="absolute bottom-5 left-5 h-12 w-12 stroke-[1.25] text-primary-100 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105" />
              </div>
            }
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="font-sans text-base font-medium leading-snug text-neutral-800 transition-colors group-hover:text-primary-700">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="line-clamp-2 text-sm leading-6 text-neutral-500">
              {post.excerpt}
            </p>
          )}
          <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-medium text-primary-600 transition-colors group-hover:text-accent-700">
            {t("readMore")}
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}

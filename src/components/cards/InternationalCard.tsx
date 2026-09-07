import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { Post } from "@/gql/types";

const CARD_CLASS =
  "glass-card group relative flex h-full min-h-[172px] flex-col justify-between overflow-hidden rounded-3xl p-6 pb-7 backdrop-blur-xl backdrop-saturate-[1.8] hover:-translate-y-2";

export function InternationalCard({
  post,
  index = 0,
}: {
  post: Post;
  index?: number;
}) {
  const externalUrl =
    (post.customFieldsData?.externalUrl as string | undefined) ?? null;
  const meta =
    (post.customFieldsData?.location as string | undefined) ?? null;

  const inner = (
    <>
      <div className="relative flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full bg-primary-600/90 font-sans text-[12.5px] font-extrabold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_6px_-1px_rgba(16,92,168,0.5)]"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          aria-hidden="true"
          className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/45 text-primary-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] transition-colors duration-500 ease-brand group-hover:bg-primary-600 group-hover:text-white"
        >
          <ArrowUpRight className="h-[15px] w-[15px] transition-[translate] duration-500 ease-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
      <div className="relative mt-8">
        <h3 className="font-sans text-[19px] font-extrabold leading-[1.25] text-primary-900">
          {post.title}
        </h3>
        {meta && (
          <p className="mt-1.5 font-sans text-xs uppercase tracking-wider text-primary-600">
            {meta}
          </p>
        )}
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 text-[13.5px] leading-6 text-primary-800/80">
            {post.excerpt}
          </p>
        )}
      </div>
    </>
  );

  if (externalUrl) {
    return (
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={CARD_CLASS}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={`/international/${post.slug}`} className={CARD_CLASS}>
      {inner}
    </Link>
  );
}

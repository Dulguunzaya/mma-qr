import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { Post } from "@/gql/types";

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
      <div className="mb-7 flex items-center gap-3" aria-hidden="true">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-accent-400/60 font-sans text-[11px] text-accent-300">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="h-px flex-1 bg-primary-600 transition-colors duration-200 group-hover:bg-accent-500" />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-sans text-base font-medium leading-snug text-white transition-colors group-hover:text-accent-200">
            {post.title}
          </h3>
          {meta && (
            <p className="mt-1 font-sans text-xs uppercase tracking-wider text-accent-300">
              {meta}
            </p>
          )}
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-primary-200 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-300" />
      </div>
      {post.excerpt && (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-primary-100/80">
          {post.excerpt}
        </p>
      )}
    </>
  );

  const className =
    "group block h-full bg-primary-800 p-6 transition-colors duration-200 hover:bg-primary-700 sm:p-7";

  if (externalUrl) {
    return (
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={`/international/${post.slug}`} className={className}>
      {inner}
    </Link>
  );
}

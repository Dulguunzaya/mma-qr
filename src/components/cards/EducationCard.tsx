import { useTranslations } from "next-intl";
import { GraduationCap } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { Post } from "@/gql/types";

export function EducationCard({
  post,
  featured = false,
}: {
  post: Post;
  featured?: boolean;
}) {
  const t = useTranslations("cards");
  const audience =
    (post.customFieldsData?.audience as string | undefined) ?? null;

  if (featured) {
    return (
      <article className="group relative h-full min-h-80 overflow-hidden rounded-lg bg-primary-800 p-7 shadow-md sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full border border-primary-600"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full border border-accent-500/70"
        />
        <Link
          href={`/education/${post.slug}`}
          className="relative flex h-full flex-col"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-accent-300">
              {t("featured")}
            </span>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-accent-500 text-white transition-transform duration-200 group-hover:-translate-y-1">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
          <h3 className="mt-12 max-w-md font-sans text-2xl font-semibold leading-tight text-white sm:text-3xl">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-4 max-w-md text-base leading-7 text-primary-100/80">
              {post.excerpt}
            </p>
          )}
          <div className="mt-auto flex items-end justify-between gap-4 pt-10">
            {audience ? (
              <span className="rounded-full border border-primary-500 px-3 py-1 font-sans text-[11px] uppercase tracking-wide text-primary-100">
                {audience === "student" ? t("student") : t("professional")}
              </span>
            ) : (
              <span />
            )}
            <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-300">
              {t("readMore")}
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col rounded-lg border border-neutral-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-md">
      <Link href={`/education/${post.slug}`} className="flex h-full flex-col">
        <span className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent-50 text-accent-700 transition-colors group-hover:bg-accent-500 group-hover:text-white">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className="font-sans text-base font-medium leading-snug text-neutral-800 transition-colors group-hover:text-primary-700">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-500">
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          {audience ? (
            <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 font-sans text-[11px] uppercase tracking-wide text-neutral-500">
              {audience === "student" ? t("student") : t("professional")}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors group-hover:text-accent-700">
            {t("readMore")}
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}

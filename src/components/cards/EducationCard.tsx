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
      <article className="group relative h-full min-h-72 overflow-hidden rounded-lg bg-primary-800 p-5 shadow-md sm:min-h-80 sm:p-8">
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
            <span className="inline-flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-accent-500 text-white transition-[rotate,scale] duration-500 ease-brand group-hover:-rotate-[8deg] group-hover:scale-105">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <h3 className="mt-10 max-w-md [overflow-wrap:anywhere] font-sans text-xl font-semibold leading-tight text-white sm:mt-12 sm:text-3xl">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-4 max-w-md text-base leading-7 text-primary-100/80">
              {post.excerpt}
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-8 sm:pt-10">
            {audience ? (
              <span className="rounded-full border border-primary-500 px-3 py-1 font-sans text-[11px] uppercase tracking-wide text-primary-100">
                {audience === "student" ? t("student") : t("professional")}
              </span>
            ) : (
              <span />
            )}
            <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-300">
              {t("readMore")}
              <span className="transition-[translate] duration-500 ease-brand group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-[translate,box-shadow,border-color] duration-500 ease-brand hover:-translate-y-1.5 hover:border-transparent hover:shadow-lg sm:p-7">
      <Link href={`/education/${post.slug}`} className="flex h-full flex-col">
        <span className="mb-5 inline-flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-primary-50 text-primary-600 transition-[background-color,color,rotate,scale] duration-500 ease-brand group-hover:-rotate-[8deg] group-hover:scale-105 group-hover:bg-primary-900 group-hover:text-white">
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
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
            <span className="transition-[translate] duration-500 ease-brand group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}

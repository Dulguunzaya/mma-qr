import PostImage from "@/components/common/PostImage";
import { getPageBySlug, getPosts } from "@/gql/server";
import type { Post } from "@/gql/types";
import { getSubheader } from "@/lib/content";

function getPostLink(post: Post): string | null {
  const content = post.content ?? "";
  const hrefMatch = content.match(/href=["'](https?:\/\/[^"']+)["']/i);
  if (hrefMatch) return hrefMatch[1];
  const urlMatch = content.match(/https?:\/\/[^\s"'<>]+/i);
  return urlMatch ? urlMatch[0] : null;
}

export default async function PartnerNetwork({ locale }: { locale: string }) {
  const [page, partners] = await Promise.all([
    getPageBySlug("partner-network", locale),
    getPosts(locale, {
      categorySlug: "partners",
      limit: 20,
      sortDirection: "asc",
    }),
  ]);

  if (partners.length === 0) return null;

  return (
    <section className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-14 sm:py-16 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center">
          <div>
            <p className="flex items-center gap-3 font-sans text-xs font-medium uppercase tracking-[0.12em] text-accent-600">
              <span className="h-px w-8 bg-accent-500" aria-hidden="true" />
              {getSubheader(page)}
            </p>
            <h2 className="mt-3 font-sans text-xl font-semibold text-primary-900">
              {page?.name}
            </h2>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
            {partners.map((partner) => {
              const link = getPostLink(partner);
              const logo = (
                <PostImage
                  post={partner}
                  source="all"
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="object-contain object-left"
                  containerClassName="relative block h-12"
                />
              );

              return (
                <li
                  key={partner._id}
                  className="border-l border-neutral-200 pl-4"
                >
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block transition-opacity hover:opacity-80"
                    >
                      {logo}
                    </a>
                  ) : (
                    logo
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

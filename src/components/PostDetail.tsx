import { Link } from "@/i18n/routing";
import PostImage from "@/components/common/PostImage";
import type { Post } from "@/gql/types";
import { CmsContent } from "@/components/CmsContent";
import { DriftField } from "@/components/common/DriftField";
import { formatDate } from "@/lib/date";

interface PostDetailProps {
  post: Post;
  backHref: string;
  backLabel: string;
  dateLabel?: string;
  showImages?: boolean;
}

export function PostDetail({
  post,
  backHref,
  backLabel,
  dateLabel,
  showImages = false,
}: PostDetailProps) {
  const date = post.publishedDate ?? post.createdAt;
  const formattedDate = formatDate(date);

  return (
    <div className="relative overflow-hidden bg-white">
      <DriftField />
      <article className="relative mx-auto max-w-[820px] px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div>
        <Link
          href={backHref}
          className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-800"
        >
          ← {backLabel}
        </Link>

        {date && formattedDate && (
          <time
            dateTime={date}
            className="mt-6 block font-sans text-xs uppercase tracking-wider text-neutral-400"
          >
            {dateLabel ? `${dateLabel} · ` : ""}
            {formattedDate}
          </time>
        )}

        <h1 className="mt-3 font-sans text-2xl font-semibold leading-tight text-neutral-900 sm:text-4xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-4 text-lg leading-8 text-neutral-500">
            {post.excerpt}
          </p>
        )}

        <PostImage
          post={post}
          source={showImages ? "thumbnail" : "all"}
          fill
          sizes="(max-width: 820px) 100vw, 820px"
          className="object-cover"
          containerClassName="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-primary-50"
          priority
        />

        {showImages && post.images?.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {post.images.map((image, index) => (
              <PostImage
                key={`${image.url ?? "news-image"}-${index}`}
                post={post}
                source="images"
                imageIndex={index}
                fill
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-cover"
                containerClassName="relative aspect-[16/10] overflow-hidden rounded-2xl bg-primary-50"
              />
            ))}
          </div>
        ) : null}

        <CmsContent html={post.content} className="mt-10" />
      </div>
      </article>
    </div>
  );
}

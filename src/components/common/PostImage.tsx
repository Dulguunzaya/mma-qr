"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import Image from "@/components/common/Image";
import type { Post } from "@/gql/types";

type PostMedia = Pick<Post, "title" | "thumbnail" | "images">;
type PostImageSource = "all" | "thumbnail" | "images";

function getPostImageUrls(
  post: PostMedia,
  source: PostImageSource,
  imageIndex?: number,
): string[] {
  const attachments =
    source === "thumbnail"
      ? [post.thumbnail]
      : source === "images"
        ? imageIndex === undefined
          ? (post.images ?? [])
          : [post.images?.[imageIndex]]
        : [post.thumbnail, ...(post.images ?? [])];

  return [
    ...new Set(
      attachments.flatMap((attachment) => {
        const url = attachment?.url?.trim();
        return url ? [url] : [];
      }),
    ),
  ];
}

type PostImageProps = Omit<
  ComponentProps<typeof Image>,
  "src" | "alt" | "fallback"
> & {
  post: PostMedia;
  alt?: string;
  containerClassName?: string;
  fallback?: ReactNode;
  imageIndex?: number;
  source?: PostImageSource;
};

export default function PostImage({
  post,
  alt = post.title ?? "",
  containerClassName,
  fallback = null,
  imageIndex,
  source = "all",
  ...props
}: PostImageProps) {
  const sources = getPostImageUrls(post, source, imageIndex);

  if (!sources.length) return fallback;

  return (
    <ResolvedPostImage
      key={sources.join("\n")}
      sources={sources}
      alt={alt}
      containerClassName={containerClassName}
      fallback={fallback}
      {...props}
    />
  );
}

type ResolvedPostImageProps = Omit<PostImageProps, "post"> & {
  sources: string[];
};

function ResolvedPostImage({
  sources,
  alt = "",
  containerClassName,
  fallback,
  onError,
  ...props
}: ResolvedPostImageProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed) return fallback;

  const src = sources[sourceIndex];
  const image = (
    <Image
      src={src}
      alt={alt}
      fallback={src}
      onError={(event) => {
        onError?.(event);
        if (sourceIndex < sources.length - 1) {
          setSourceIndex(sourceIndex + 1);
        } else {
          setFailed(true);
        }
      }}
      {...props}
    />
  );

  return containerClassName ? (
    <div className={containerClassName}>{image}</div>
  ) : (
    image
  );
}

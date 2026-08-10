"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PostImage from "@/components/common/PostImage";
import type { Post } from "@/gql/types";

interface PostImageCarouselProps {
  post: Post;
  previousLabel: string;
  nextLabel: string;
  fallback?: ReactNode;
}

export default function PostImageCarousel({
  post,
  previousLabel,
  nextLabel,
  fallback = null,
}: PostImageCarouselProps) {
  const candidates = [
    ...(post.thumbnail?.url?.trim()
      ? [
          {
            source: "thumbnail" as const,
            imageIndex: undefined,
            url: post.thumbnail.url.trim(),
          },
        ]
      : []),
    ...(post.images ?? []).flatMap((image, index) =>
      image.url?.trim()
        ? [
            {
              source: "images" as const,
              imageIndex: index,
              url: image.url.trim(),
            },
          ]
        : [],
    ),
  ];
  const images = candidates.filter(
    (image, index) =>
      candidates.findIndex((candidate) => candidate.url === image.url) ===
      index,
  );
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) return fallback;

  const activeImage = images[activeIndex];
  const hasMultipleImages = images.length > 1;

  function showPrevious() {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  return (
    <div className="mt-9">
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-neutral-200 bg-primary-50">
        <PostImage
          key={activeImage.url}
          post={post}
          source={activeImage.source}
          imageIndex={activeImage.imageIndex}
          fill
          sizes="(max-width: 1024px) 100vw, 760px"
          className="object-cover"
          priority={activeIndex === 0}
        />

        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label={previousLabel}
              className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary-800 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label={nextLabel}
              className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary-800 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : null}

        <span className="absolute bottom-3 right-3 rounded-full bg-primary-900/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {activeIndex + 1} / {images.length}
        </span>
      </div>

      {hasMultipleImages ? (
        <div className="mt-3 flex justify-center gap-2">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${index + 1} / ${images.length}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex
                  ? "w-7 bg-primary-600"
                  : "w-2 bg-neutral-300 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

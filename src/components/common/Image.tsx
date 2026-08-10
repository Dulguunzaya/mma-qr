"use client";

import NextImage, { ImageProps as NextImageProps } from "next/image";
import { useState } from "react";

const PLACEHOLDER = "/file.svg";

function getFileUrl(url: string): string {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  const fileUrl = process.env.NEXT_PUBLIC_ERXES_FILE_URL;
  if (fileUrl) return `${fileUrl}${url}`;

  const endpoint =
    process.env.NEXT_PUBLIC_ERXES_ENDPOINT ??
    process.env.NEXT_PUBLIC_GRAPHQL_URL ??
    "";
  const apiDomain = endpoint.replace(/\/gateway\/graphql\/?$/, "");
  return apiDomain ? `${apiDomain}/read-file?key=${url}` : url;
}

type ImageProps = Omit<NextImageProps, "src"> & {
  src?: string | null;
  fallback?: string;
};

export default function Image({
  src,
  fallback = PLACEHOLDER,
  alt = "",
  onError,
  ...props
}: ImageProps) {
  const resolved = getFileUrl(src || "") || fallback;

  return (
    <ImageWithFallback
      key={resolved}
      initialSrc={resolved}
      fallback={fallback}
      alt={alt}
      onError={onError}
      {...props}
    />
  );
}

function ImageWithFallback({
  initialSrc,
  fallback,
  onError,
  ...props
}: Omit<NextImageProps, "src"> & {
  initialSrc: string;
  fallback: string;
}) {
  const [imgSrc, setImgSrc] = useState(initialSrc);

  return (
    <NextImage
      {...props}
      src={imgSrc}
      onError={(event) => {
        onError?.(event);
        if (imgSrc !== fallback) setImgSrc(fallback);
      }}
    />
  );
}

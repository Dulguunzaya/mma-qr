import type { ElementType, HTMLAttributes } from "react";
import { sanitizeCmsHtml } from "@/lib/content";
import { cn } from "@/lib/utils";

type CmsContentProps = {
  html?: string | null;
  as?: ElementType;
} & Omit<HTMLAttributes<HTMLElement>, "dangerouslySetInnerHTML">;

export function CmsContent({
  html,
  as: Component = "div",
  className,
  ...props
}: CmsContentProps) {
  if (!html) return null;

  return (
    <Component
      {...props}
      className={cn("cms-content", className)}
      dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(html) }}
    />
  );
}

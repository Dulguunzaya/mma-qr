import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "relative block aspect-[251/98] w-28 shrink-0 overflow-hidden sm:w-32 xl:w-[152px]",
        className
      )}
    >
      <Image
        src="/images/mma-logo.avif"
        alt="Mongolian Marketing Association"
        width={424}
        height={154}
        priority={priority}
        sizes="(min-width: 1280px) 257px, (min-width: 640px) 216px, 189px"
        style={{ maxWidth: "none" }}
        className="absolute left-[-34.66%] top-[-30.61%] h-[157.14%] w-[168.92%] max-w-none"
      />
    </span>
  );
}

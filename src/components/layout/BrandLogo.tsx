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
        "relative block h-10 w-[124px] shrink-0 overflow-hidden",
        className
      )}
    >
      <Image
        src="/images/mma-logo.avif"
        alt="Mongolian Marketing Association"
        width={424}
        height={154}
        priority={priority}
        sizes="124px"
        className="absolute -left-[49px] -top-5 h-[81px] w-[223px] max-w-none"
      />
    </span>
  );
}

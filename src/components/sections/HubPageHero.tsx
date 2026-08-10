import { CmsContent } from "@/components/CmsContent";

type HubPageHeroVariant = "international" | "education" | "news";

interface HubPageHeroProps {
  variant: HubPageHeroVariant;
  eyebrow?: string;
  title: string;
  description?: string | null;
  itemCount: number;
  itemLabel: string;
  browseLabel: string;
}

export function HubPageHero({
  title,
  eyebrow,
  description,
}: HubPageHeroProps) {
  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-12 sm:pt-16 lg:px-10">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="mb-4 flex items-center gap-3 font-sans text-xs font-medium uppercase tracking-[0.12em] text-accent-600">
            <span className="h-px w-8 bg-accent-500" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <div className="flex items-center gap-6">
          <span
            className="h-px w-16 shrink-0 bg-primary-500"
            aria-hidden="true"
          />
          <h1 className="text-2xl font-semibold uppercase leading-tight tracking-[0.14em] text-primary-800 sm:text-3xl">
            {title}
          </h1>
        </div>
        <CmsContent
          html={description}
          className="mt-5 max-w-2xl text-base leading-7 text-neutral-500 sm:ml-[5.5rem]"
        />
      </div>
    </div>
  );
}

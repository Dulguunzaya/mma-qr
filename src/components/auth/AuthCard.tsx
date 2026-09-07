import type { ReactNode } from "react";
import { RisingBlocks } from "@/components/common/RisingBlocks";
import { Section } from "@/components/sections/Section";

export const fieldClassName =
  "mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

export const buttonClassName =
  "w-full rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60";

/**
 * The sign-in, register and password pages share the home hero's navy field,
 * so entering the members area feels like part of the same site rather than a
 * separate utility screen. The card itself stays light for form legibility.
 */
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Section
      tone="dark"
      decor="hero"
      backdrop={<RisingBlocks layout="sides" />}
      className="-mt-[88px] pt-[88px]"
      containerClassName="flex min-h-[calc(100vh-88px)] max-w-lg items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-6"
    >
      <div className="w-full rounded-2xl border border-white/15 bg-white p-5 shadow-[0_30px_60px_-24px_rgba(6,26,47,0.75)] sm:p-8">
        <h1 className="text-2xl font-semibold text-neutral-800">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>
        <div className="mt-8">{children}</div>
      </div>
    </Section>
  );
}

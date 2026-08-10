import type { ReactNode } from "react";

export const fieldClassName =
  "mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

export const buttonClassName =
  "w-full rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60";

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
    <section className="mx-auto w-full max-w-md px-6 py-16 sm:py-24">
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-neutral-800">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

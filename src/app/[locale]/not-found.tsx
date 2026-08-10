import { Link } from "@/i18n/routing";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col items-center px-6 py-24 text-center">
      <p className="font-sans text-5xl font-semibold text-primary-200">404</p>
      <h1 className="mt-4 font-sans text-xl font-semibold text-neutral-800">
        Page not found
      </h1>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-md bg-primary-600 px-6 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        ← Home
      </Link>
    </div>
  );
}

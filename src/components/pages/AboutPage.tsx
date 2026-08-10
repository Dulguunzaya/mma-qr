import NextImage from "next/image";
import type { LucideIcon } from "lucide-react";
import { Compass, ShieldCheck, Target, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Page, Post } from "@/gql/types";
import { getPageBySlug } from "@/gql/server";
import { getPlainText, getSubheader } from "@/lib/content";
import { CmsContent } from "@/components/CmsContent";

const VALUE_ICONS: LucideIcon[] = [Compass, Target, ShieldCheck, Users];

type AboutPerson = {
  id: string;
  name: string;
  role: string;
  image?: string;
  startDate?: string;
  endDate?: string;
};

type AboutPageProps = {
  locale: string;
  page: Page;
  purpose: Page;
  values: Post[];
  directions: Post[];
  history: Post[];
  management: Post[];
  presidents: Post[];
  leadership: Post[];
  presidentDates: Post[];
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-accent-700">
      <span className="h-px w-8 bg-accent-500" aria-hidden="true" />
      {children}
    </p>
  );
}

function SectionHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <h2 className="mt-3 text-2xl font-semibold leading-tight text-primary-900 sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500">
          {description}
        </p>
      )}
    </div>
  );
}

function PersonImage({ person, size }: { person: AboutPerson; size: string }) {
  return (
    <NextImage
      src={person.image || "/file.svg"}
      alt={person.name}
      fill
      sizes={size}
      className="object-cover"
    />
  );
}

function LeadershipRow({ person }: { person: AboutPerson }) {
  return (
    <article className="group flex items-center gap-4 border-b border-neutral-200 py-4 last:border-b-0">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-neutral-200 transition-colors duration-200 group-hover:ring-accent-300">
        <PersonImage person={person} size="64px" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-primary-900">
          {person.name}
        </h4>
        <p className="mt-1 text-sm leading-5 text-neutral-500">{person.role}</p>
      </div>
    </article>
  );
}

function ManagementCard({ person }: { person: AboutPerson }) {
  return (
    <article className="group flex min-h-28 items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-md">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-neutral-200">
        <PersonImage person={person} size="64px" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-primary-900">
          {person.name}
        </h3>
        <p className="mt-1 text-sm leading-5 text-neutral-500">{person.role}</p>
      </div>
    </article>
  );
}

function findField(value: unknown, fieldName: string, depth = 0): unknown {
  if (!value || typeof value !== "object" || depth > 5) return undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findField(item, fieldName, depth + 1);
      if (match !== undefined) return match;
    }
    return undefined;
  }

  const entries = Object.entries(value);
  const direct = entries.find(
    ([key]) => key.toLowerCase() === fieldName.toLowerCase(),
  );
  if (direct) return direct[1];
  for (const [, nested] of entries) {
    const match = findField(nested, fieldName, depth + 1);
    if (match !== undefined) return match;
  }
  return undefined;
}

function fieldString(post: Post | undefined, fieldName: string) {
  const value = findField(post?.customFieldsMap, fieldName);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function todayInUlaanbaatar() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function year(date?: string) {
  return date?.match(/^\d{4}/)?.[0];
}

export default async function AboutPage({
  locale,
  page,
  purpose,
  values,
  directions,
  history,
  management,
  presidents,
  leadership,
  presidentDates,
}: AboutPageProps) {
  const t = await getTranslations({ locale, namespace: "about" });
  const [valuesPage, directionsPage, historyPage, presidentsPage, managementPage] =
    await Promise.all([
      getPageBySlug("about-values", locale),
      getPageBySlug("about-directions", locale),
      getPageBySlug("about-history", locale),
      getPageBySlug("about-presidents", locale),
      getPageBySlug("about-management", locale),
    ]);
  const datePosts = new Map(presidentDates.map((post) => [post._id, post]));
  const presidentPeople = presidents.map((post): AboutPerson => {
    const datePost = datePosts.get(post._id) ?? post;
    return {
      id: post._id,
      name: post.title ?? "",
      role: post.excerpt ?? "",
      image: post.thumbnail?.url ?? undefined,
      startDate: fieldString(datePost, "startDate"),
      endDate: fieldString(datePost, "endDate"),
    };
  });
  const leadershipTeam = leadership.map(
    (post): AboutPerson => ({
      id: post._id,
      name: post.title ?? "",
      role: post.excerpt ?? "",
      image: post.thumbnail?.url ?? undefined,
    }),
  );
  const today = todayInUlaanbaatar();
  const currentPresident = presidentPeople
    .filter(
      (person) =>
        (!person.startDate || person.startDate <= today) &&
        (!person.endDate || person.endDate >= today),
    )
    .sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""))[0];
  const pastPresidents = presidentPeople
    .filter(
      (person) =>
        person.id !== currentPresident?.id &&
        (!person.startDate || person.startDate <= today),
    )
    .sort((a, b) =>
      (b.endDate ?? b.startDate ?? "").localeCompare(
        a.endDate ?? a.startDate ?? "",
      ),
    );
  const managementPeople = management.map(
    (post): AboutPerson => ({
      id: post._id,
      name: post.title ?? "",
      role: post.excerpt ?? "",
      image: post.thumbnail?.url ?? undefined,
    }),
  );
  const period = (person: AboutPerson) => {
    const start = year(person.startDate);
    const end = year(person.endDate);
    if (!start) return end ?? "";
    return `${start}–${end ?? t("present")}`;
  };

  return (
    <>
      <div className="mx-auto max-w-[1200px] px-6 pt-12 sm:pt-16 lg:px-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-6">
            <span
              className="h-px w-16 shrink-0 bg-primary-500"
              aria-hidden="true"
            />
            <h1 className="text-2xl font-semibold uppercase leading-tight tracking-[0.14em] text-primary-800 sm:text-3xl">
              {page.name}
            </h1>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-500 sm:ml-[5.5rem]">
            {getSubheader(page)}
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-[1200px] px-6 pb-14 pt-8 sm:pb-20 sm:pt-10 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              label={page.name ?? ""}
              title={purpose.name ?? ""}
            />
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
              <NextImage
                src="/images/about/about-purpose.jpg"
                alt={t("purposeImageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="object-cover"
              />
            </div>
          </div>
          <CmsContent html={purpose.description} className="self-center" />
        </div>

        {values.length > 0 && (
          <div className="mt-14 border-t border-neutral-200 pt-12">
            <SectionHeading
              label={getSubheader(valuesPage) ?? ""}
              title={valuesPage?.name ?? ""}
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => {
                const Icon = VALUE_ICONS[index] ?? Compass;
                return (
                  <article
                    key={value._id}
                    className="group flex flex-col rounded-lg border border-neutral-200 bg-white p-5 transition-colors duration-200 hover:border-accent-300"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-50 text-accent-700 transition-colors duration-200 group-hover:bg-accent-100">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="text-xs font-semibold text-accent-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-primary-900">
                      {value.title}
                    </h3>
                    {value.excerpt && (
                      <p className="mt-2 text-sm leading-7 text-neutral-500">
                        {value.excerpt}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {directions.length > 0 && (
        <section className="border-y border-neutral-200 bg-neutral-100/50">
          <div className="mx-auto max-w-[1200px] px-6 py-14 sm:py-20 lg:px-10">
            <SectionHeading
              label={getSubheader(directionsPage) ?? ""}
              title={directionsPage?.name ?? ""}
            />
            <ol className="mt-8 grid gap-4 sm:grid-cols-2">
              {directions.map((direction, index) => (
                <li
                  key={direction._id}
                  className="grid grid-cols-[48px_1fr] gap-4 rounded-lg border border-neutral-200 bg-white p-5 last:sm:col-span-2"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-300 text-xs font-semibold text-accent-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-semibold text-primary-900">
                      {direction.title}
                    </h3>
                    {direction.excerpt && (
                      <p className="mt-2 text-sm leading-6 text-neutral-500">
                        {direction.excerpt}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="border-b border-neutral-200 bg-background">
          <div className="mx-auto max-w-[1200px] px-6 py-14 sm:py-20 lg:px-10">
            <div className="grid gap-6 lg:grid-cols-[0.45fr_0.55fr] lg:items-end lg:gap-16">
              <SectionHeading
                label={getSubheader(historyPage) ?? ""}
                title={historyPage?.name ?? ""}
              />
              <div>
                <p className="max-w-2xl text-sm leading-7 text-neutral-500">
                  {historyPage?.description
                    ? getPlainText(historyPage.description)
                    : ""}
                </p>
              </div>
            </div>
            <div className="relative mt-10">
              <div
                role="region"
                aria-label={t("historyScrollLabel")}
                tabIndex={0}
                className="snap-x snap-proximity overflow-x-auto overscroll-x-contain pb-4"
              >
                <ol className="relative flex min-w-max items-start gap-4 px-1 pr-24 pt-10 before:absolute before:left-6 before:right-6 before:top-4 before:h-px before:bg-accent-300">
                  {history.map((entry) => (
                    <li
                      key={entry._id}
                      className="relative flex h-fit w-[min(82vw,360px)] shrink-0 snap-start flex-col rounded-lg border border-neutral-200 bg-white p-6 sm:w-[400px]"
                    >
                      <span
                        className="absolute -top-[29px] left-6 h-3 w-3 rounded-full border-2 border-neutral-50 bg-accent-500 ring-1 ring-accent-400"
                        aria-hidden="true"
                      />
                      <span className="text-xl font-semibold text-accent-700">
                        {entry.title}
                      </span>
                      <CmsContent
                        html={entry.content}
                        className="mt-4 text-sm leading-7 text-neutral-500"
                      />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      )}

      {(presidentPeople.length > 0 || leadershipTeam.length > 0) && (
        <section
          id="leadership"
          className="scroll-mt-24 mx-auto max-w-[1200px] px-6 py-14 sm:py-20 lg:px-10"
        >
          <SectionHeading
            label={getSubheader(presidentsPage) ?? ""}
            title={presidentsPage?.name ?? ""}
          />
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            {currentPresident && (
              <article className="grid gap-5 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-[220px_1fr]">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
                  <PersonImage
                    person={currentPresident}
                    size="(max-width: 640px) 100vw, 220px"
                  />
                </div>
                <div className="self-center sm:pr-4">
                  <span className="inline-flex rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-accent-700">
                    {t("currentLabel")}
                  </span>
                  <p className="mt-5 text-xs font-semibold text-accent-700">
                    {period(currentPresident)}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-primary-900">
                    {currentPresident.name}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {t("presidentRole")}
                  </p>
                </div>
              </article>
            )}

            <div className="grid gap-10 sm:grid-cols-2">
              {pastPresidents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-neutral-500">
                    {t("pastPresidentsTitle")}
                  </h3>
                  <ol className="mt-3 border-t border-neutral-200">
                    {pastPresidents.map((person) => (
                      <li
                        key={person.id}
                        className="group flex items-center gap-3 border-b border-neutral-200 py-3"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-neutral-200 transition-colors duration-200 group-hover:ring-accent-300">
                          <PersonImage person={person} size="48px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-primary-900">
                            {person.name}
                          </h4>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {t("presidentRole")}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-accent-700">
                          {period(person)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {leadershipTeam.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-neutral-500">
                    {t("leadershipTitle")}
                  </h3>
                  <div className="mt-3 border-t border-neutral-200">
                    {leadershipTeam.map((person) => (
                      <LeadershipRow key={person.id} person={person} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {managementPeople.length > 0 && (
        <section className="border-t border-neutral-200 bg-neutral-100/50">
          <div className="mx-auto max-w-[1200px] px-6 py-14 sm:py-20 lg:px-10">
            <SectionHeading
              label={getSubheader(managementPage) ?? ""}
              title={managementPage?.name ?? ""}
              description={
                managementPage?.description
                  ? getPlainText(managementPage.description)
                  : undefined
              }
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {managementPeople.map((person) => (
                <ManagementCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

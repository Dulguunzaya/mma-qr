import { ChevronLeft, Ticket } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import PostImageCarousel from "@/components/common/PostImageCarousel";
import type { Post } from "@/gql/types";
import { getPageBySlug, getProductById } from "@/gql/server";
import { getPlainText } from "@/lib/content";
import { CmsContent } from "@/components/CmsContent";
import TicketBookingCard, {
  type EventSession,
} from "@/components/tickets/TicketBookingCard";

interface EventDetailPageProps {
  post: Post;
  locale: string;
}

const COMPANY_BILLING_PIPELINE_ID =
  process.env.COMPANY_BILLING_PIPELINE_ID ?? "oE64JLNbB5C9PkMXQ8-u4";
const PERSONAL_BILLING_PIPELINE_ID =
  process.env.PERSONAL_BILLING_PIPELINE_ID ?? "oE64JLNbB5C9PkMXQ8-u4";
const DEFAULT_MAX_QUANTITY = 10;

function getPositiveNumber(value: unknown): number | null {
  const normalized =
    typeof value === "string" ? value.replace(/[^\d.-]/g, "") : value;
  const numberValue =
    typeof normalized === "number" ? normalized : Number(normalized);

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

function getString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = getString(item);
      if (found) return found;
    }
    return undefined;
  }

  return typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;
}

function findCustomField(
  value: unknown,
  fieldName: string,
  depth = 0,
): unknown {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    depth > 5
  ) {
    return undefined;
  }

  const entries = Object.entries(value);
  const directMatch = entries.find(
    ([key]) => key.toLowerCase() === fieldName.toLowerCase(),
  );
  if (directMatch) return directMatch[1];

  for (const [, nestedValue] of entries) {
    const nestedMatch = findCustomField(nestedValue, fieldName, depth + 1);
    if (nestedMatch !== undefined) return nestedMatch;
  }

  return undefined;
}

function findFirstCustomField(
  sources: unknown[],
  fieldNames: string[],
): unknown {
  for (const source of sources) {
    for (const fieldName of fieldNames) {
      const value = findCustomField(source, fieldName);
      if (value !== undefined && value !== null && value !== "") return value;
    }
  }

  return undefined;
}

function normaliseFieldKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Reads one value out of a custom-field group, matching the field by code. */
function pickGroupField(
  group: Record<string, unknown>,
  names: string[],
): unknown {
  for (const name of names) {
    const entry = Object.entries(group).find(
      ([key]) => normaliseFieldKey(key) === name,
    );
    const value = entry?.[1];
    if (value !== undefined && value !== null && value !== "") return value;
  }

  return undefined;
}

/** Only groups the CMS has given a code to survive in customFieldsMap. */
function getSessionsFromMap(map: unknown): EventSession[] {
  if (!map || typeof map !== "object" || Array.isArray(map)) return [];

  const sessions: EventSession[] = [];

  for (const group of Object.values(map as Record<string, unknown>)) {
    if (!group || typeof group !== "object" || Array.isArray(group)) continue;

    const entry = group as Record<string, unknown>;
    const date = getString(
      pickGroupField(entry, ["date", "eventdate", "startdate"]),
    );
    const location = getString(
      pickGroupField(entry, ["location", "eventlocation", "venue", "address"]),
    );

    if (!date && !location) continue;

    sessions.push({
      title: getString(pickGroupField(entry, ["title", "name", "heading"])),
      date,
      location,
    });
  }

  return sessions;
}

function isDateValue(value: unknown): boolean {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value.trim());
}

function isUrlValue(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * An event can sell through an outside service. The link is read from a coded
 * field when there is one, and otherwise from whichever custom field holds a
 * link — so it can be pasted into any text field the CMS offers.
 */
function getTicketUrl(post: Post): string | undefined {
  const coded = getString(
    findFirstCustomField(
      [post.customFieldsMap, post.customFieldsData],
      ["ticketUrl", "ticketLink", "externalUrl", "url", "link"],
    ),
  );
  if (isUrlValue(coded)) return coded.trim();

  if (Array.isArray(post.customFieldsData)) {
    for (const entry of post.customFieldsData as Array<{ value?: unknown }>) {
      if (isUrlValue(entry?.value)) return entry.value.trim();
    }
  }

  return undefined;
}

/**
 * Keeps the values a reader would recognise as a heading or a venue, dropping
 * the quantity and the product reference that share the group.
 */
function isLabelValue(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return false;
  if (!/\s/.test(trimmed) && /^[A-Za-z0-9_-]{15,}$/.test(trimmed)) return false;
  // A pasted ticket link is not a heading or a venue.
  if (isUrlValue(trimmed)) return false;

  return true;
}

/**
 * customFieldsMap drops every group the CMS has not given a code to, so the
 * days are rebuilt from the flat field list instead. Entries arrive in the
 * group order the CMS shows — heading, date, venue — and a group holds one date
 * and at most those two labels, which is enough to tell where one day ends and
 * the next begins.
 */
function getSessionsFromEntries(data: unknown): EventSession[] {
  if (!Array.isArray(data)) return [];

  const buckets: Array<{ date?: string; labels: string[] }> = [];
  let current: { date?: string; labels: string[] } | null = null;

  for (const entry of data as Array<{ value?: unknown }>) {
    const value = entry?.value;
    const date = isDateValue(value) ? String(value).trim() : undefined;
    const label = !date && isLabelValue(value) ? value.trim() : undefined;
    if (!date && !label) continue;

    const startsNewDay =
      !current ||
      (date !== undefined && current.date !== undefined) ||
      (label !== undefined && current.labels.length >= 2);

    if (startsNewDay) {
      current = { labels: [] };
      buckets.push(current);
    }

    if (date) current!.date = date;
    else if (label) current!.labels.push(label);
  }

  const sessions = buckets
    .map((bucket) => ({
      title: bucket.labels[0],
      date: bucket.date,
      location: bucket.labels[1],
    }))
    .filter((session) => session.date || session.location);

  // A removed group can leave a duplicate day behind; show each one once.
  const seen = new Set<string>();
  return sessions.filter((session) => {
    const key = `${session.title ?? ""}|${session.date ?? ""}|${session.location ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Cyrillic anywhere in a label marks the Mongolian wording of a day. */
function isCyrillic(text: string | undefined): boolean {
  return typeof text === "string" && /[\u0400-\u04FF]/.test(text);
}

/**
 * Custom fields are not translated: both language versions of a post read the
 * same groups. A day written up twice — once in Mongolian, once in English —
 * therefore arrives as two groups sharing one date. Keep the wording that
 * matches the language being read, and leave a date alone when only one
 * wording exists or when the day genuinely holds several sessions.
 */
function pickSessionsForLocale(
  sessions: EventSession[],
  locale: string,
): EventSession[] {
  const wantsCyrillic = locale === "mn";
  const matchesLocale = (session: EventSession) =>
    isCyrillic(session.title) || isCyrillic(session.location)
      ? wantsCyrillic
      : !wantsCyrillic;

  const datesWithMatch = new Set(
    sessions
      .filter((session) => session.date && matchesLocale(session))
      .map((session) => session.date),
  );

  return sessions.filter(
    (session) =>
      !session.date ||
      !datesWithMatch.has(session.date) ||
      matchesLocale(session),
  );
}

function getEventSessions(post: Post, locale: string): EventSession[] {
  const fromEntries = getSessionsFromEntries(post.customFieldsData);
  const sessions =
    fromEntries.length > 0
      ? fromEntries
      : getSessionsFromMap(post.customFieldsMap);

  return pickSessionsForLocale(sessions, locale);
}

export default async function EventDetailPage({
  post,
  locale,
}: EventDetailPageProps) {
  const t = await getTranslations({ locale, namespace: "eventTicket" });
  const customFields = [post.customFieldsMap, post.customFieldsData];
  const productId = getString(
    findFirstCustomField(customFields, ["product"]),
  );
  const product = productId ? await getProductById(productId) : null;
  const unitPrice = getPositiveNumber(product?.unitPrice);
  const maxQuantity = Math.floor(
    getPositiveNumber(findFirstCustomField(customFields, ["quantity"])) ??
      DEFAULT_MAX_QUANTITY,
  );
  const eventDate = getString(
    findFirstCustomField(customFields, ["date", "eventDate", "startDate"]),
  );
  const eventTime = getString(
    findFirstCustomField(customFields, ["time", "eventTime", "startTime"]),
  );
  const eventLocation = getString(
    findFirstCustomField(customFields, [
      "location",
      "eventLocation",
      "venue",
      "address",
    ]),
  );
  const sessions = getEventSessions(post, locale);
  const ticketUrl = getTicketUrl(post);
  const soldOut = findFirstCustomField(customFields, ["soldout"]) === true;
  const termsPage = await getPageBySlug("nuhtsul", locale);
  const termsLabel = termsPage
    ? getPlainText(termsPage.content ?? "") ||
      getPlainText(termsPage.description ?? "") ||
      undefined
    : undefined;

  return (
    <article className="border-b border-neutral-200 bg-background">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <Link
          href="/events"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-accent-700"
        >
          <ChevronLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          {t("back")}
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-accent-700">
              <span className="h-px w-8 bg-accent-500" aria-hidden="true" />
              {t("eyebrow")}
            </p>
            <h1 className="mt-4 max-w-3xl [overflow-wrap:anywhere] text-[clamp(2rem,9vw,4rem)] font-semibold leading-[1.08] tracking-tight text-primary-900">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
                {post.excerpt}
              </p>
            )}

            <PostImageCarousel
              post={post}
              previousLabel={t("previousImage")}
              nextLabel={t("nextImage")}
              fallback={
                <div
                  className="relative mt-9 flex aspect-[16/9] items-end overflow-hidden rounded-2xl bg-primary-800 p-7 sm:p-9"
                  aria-hidden="true"
                >
                  <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border border-primary-500" />
                  <div className="absolute -right-4 -top-12 h-52 w-52 rounded-full border border-accent-400/70" />
                  <Ticket className="h-16 w-16 stroke-[1.2] text-accent-300" />
                </div>
              }
            />

            <section className="mt-12 border-t border-neutral-200 pt-10">
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-accent-700">
                <span className="h-px w-8 bg-accent-500" aria-hidden="true" />
                {t("aboutLabel")}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-primary-900 sm:text-3xl">
                {t("aboutTitle")}
              </h2>
              {post.content ? (
                <CmsContent html={post.content} className="mt-6" />
              ) : (
                <p className="mt-6 text-base leading-8 text-neutral-600">
                  {post.excerpt}
                </p>
              )}
            </section>
          </div>

          <TicketBookingCard
            companyBillingPipelineId={COMPANY_BILLING_PIPELINE_ID}
            productId={productId}
            eventTitle={post.title ?? ""}
            eventSlug={post.slug ?? ""}
            eventDate={eventDate}
            eventLocation={eventLocation}
            eventTime={eventTime}
            locale={locale}
            maxQuantity={maxQuantity}
            personalBillingPipelineId={PERSONAL_BILLING_PIPELINE_ID}
            sessions={sessions}
            ticketUrl={ticketUrl}
            soldOut={soldOut}
            termsLabel={termsLabel}
            unitPrice={unitPrice}
          />
        </div>
      </div>
    </article>
  );
}

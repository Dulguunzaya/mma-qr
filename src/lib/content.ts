import { decodeHTML } from "entities";
import sanitizeHtml from "sanitize-html";

export const SUBHEADER_FIELD_ID = "field_1786088572660";

export const NON_ROUTE_PAGE_SLUGS = new Set([
  "hero",
  "flagship-events",
  "international-conferences",
  "education-programs",
  "member-events",
  "news-preview",
  "partner-network",
  "news",
  "education-listing",
  "international-listing",
  "international-news",
  "news-listing",
  "about-values",
  "about-directions",
  "about-history",
  "about-presidents",
  "about-management",
]);

type WithSubheaderField = {
  customFieldsData?: Array<{ field?: string; value?: unknown }> | Record<string, unknown> | null;
  customFieldsMap?: Record<string, unknown> | null;
};

function normalizeFieldKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getSubheader(page?: WithSubheaderField | null): string | undefined {
  if (!page) return undefined;

  const data = page.customFieldsData;
  if (Array.isArray(data)) {
    const entry = data.find((item) => item?.field === SUBHEADER_FIELD_ID);
    if (typeof entry?.value === "string" && entry.value.trim()) {
      return entry.value.trim();
    }
  } else if (data && typeof data === "object") {
    const value = data[SUBHEADER_FIELD_ID];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  const map = page.customFieldsMap;
  if (map && typeof map === "object") {
    const entry = Object.entries(map).find(
      ([key]) => normalizeFieldKey(key) === "subheader"
    );
    const value = entry?.[1];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return undefined;
}


export function sanitizeCmsHtml(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
    },
  });
}

export function getPlainText(content: string): string {
  const stripped = sanitizeHtml(decodeHTML(content), {
    allowedTags: [],
    allowedAttributes: {},
  });
  return decodeHTML(stripped).trim();
}

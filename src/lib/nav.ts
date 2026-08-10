import type { MenuItem } from "@/gql/types";

export type NavEntry = {
  item: MenuItem;
  children: MenuItem[];
};

export type NavSectionKey =
  | "home"
  | "about"
  | "events"
  | "international"
  | "education"
  | "members"
  | "news";

type NavSection = {
  key: NavSectionKey;
  url: string;
  childUrls?: string[];
};

const NAV_SECTIONS: NavSection[] = [
  { key: "home", url: "/" },
  { key: "about", url: "/about" },
  { key: "events", url: "/events" },
  { key: "international", url: "/international" },
  { key: "education", url: "/education" },
  {
    key: "members",
    url: "/members",
    childUrls: ["/join-as-a-member", "/members-only-events"],
  },
  { key: "news", url: "/news" },
];

export const NAV_DROPDOWN_ITEM_LIMIT = 5;

export function buildNav(
  items: MenuItem[],
  labels: Record<NavSectionKey, string>
): NavEntry[] {
  const itemsById = new Map(items.map((item) => [item._id, item]));

  return NAV_SECTIONS.map((section, order) => {
    const children = items
      .filter((candidate) => {
        const url = candidate.url ?? "";
        if (!url || url === section.url) return false;

        const parent = candidate.parentId
          ? itemsById.get(candidate.parentId)
          : undefined;
        const belongsToCmsSection = parent?.url === section.url;
        const belongsToRoute =
          section.url !== "/" && url.startsWith(`${section.url}/`);
        const belongsToKnownPage = section.childUrls?.includes(url) ?? false;

        return belongsToCmsSection || belongsToRoute || belongsToKnownPage;
      })
      .sort(
        (first, second) => (first.order ?? 0) - (second.order ?? 0)
      );

    return {
      item: {
        _id: `static-nav-${section.key}`,
        label: labels[section.key],
        url: section.url,
        order,
      },
      children,
    };
  });
}

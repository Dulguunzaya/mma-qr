import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  env: {
    ERXES_APP_TOKEN:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRQb3J0YWxJZCI6IjdUWDh3SUN6dUtwSnBacDJOazV5ZyIsImlhdCI6MTc4NTIxMjA4MH0.EmH8zqWT9YwFko4hbFR6gReGwm0BUM560d9iAwYDis8",
    GRAPHQL_URL: "https://mmanew.next.erxes.io/gateway/graphql",
    NEXT_PUBLIC_ERXES_APP_TOKEN:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRQb3J0YWxJZCI6IjdUWDh3SUN6dUtwSnBacDJOazV5ZyIsImlhdCI6MTc4NTIxMjA4MH0.EmH8zqWT9YwFko4hbFR6gReGwm0BUM560d9iAwYDis8",
    NEXT_PUBLIC_ERXES_ENDPOINT:
      "https://mmanew.next.erxes.io/gateway/graphql",
    NEXT_PUBLIC_ERXES_FILE_URL:
      "https://mmanew.next.erxes.io/gateway/read-file?key=",
    NEXT_PUBLIC_SITE_URL: "https://www.marketing.org.mn",
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mmanew.next.erxes.io",
        pathname: "/gateway/read-file",
      },
    ],
  },
};

export default withNextIntl(nextConfig);

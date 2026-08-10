const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_URL ??
  process.env.NEXT_PUBLIC_ERXES_ENDPOINT ??
  process.env.NEXT_PUBLIC_GRAPHQL_URL;

const APP_TOKEN =
  process.env.ERXES_APP_TOKEN ?? process.env.NEXT_PUBLIC_ERXES_APP_TOKEN;

export async function POST(request: Request) {
  if (!GRAPHQL_ENDPOINT) {
    return Response.json(
      { errors: [{ message: "GraphQL endpoint is not configured" }] },
      { status: 500 },
    );
  }

  const headers = new Headers({
    "content-type": "application/json",
    ...(APP_TOKEN ? { "x-app-token": APP_TOKEN } : {}),
  });
  const cookie = request.headers.get("cookie");
  const clientAuthToken = request.headers.get("client-auth-token");

  if (cookie) headers.set("cookie", cookie);
  if (clientAuthToken) headers.set("client-auth-token", clientAuthToken);

  const upstream = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: await request.text(),
    cache: "no-store",
  });
  const responseHeaders = new Headers({
    "content-type": upstream.headers.get("content-type") ?? "application/json",
  });

  for (const setCookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", setCookie);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

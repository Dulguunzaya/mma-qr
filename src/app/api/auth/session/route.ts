const COOKIE_NAME = "client-auth-token";
const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

function cookie(value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return new Response(null, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    token?: unknown;
  } | null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";

  if (!token || token.length > 8192) {
    return new Response(null, { status: 400 });
  }

  return new Response(null, {
    status: 204,
    headers: { "set-cookie": cookie(token, ONE_DAY_IN_SECONDS) },
  });
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: { "set-cookie": cookie("", 0) },
  });
}

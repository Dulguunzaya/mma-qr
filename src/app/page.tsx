import Link from "next/link";

export default function RootPage() {
  return (
    <html lang="mn">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="refresh" content="0; url=/mn" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MMA — Монголын Маркетингийн Холбоо</title>
      </head>
      <body>
        <p>
          <Link href="/mn">Монголын Маркетингийн Холбоо</Link> ·{" "}
          <Link href="/en">Mongolian Marketing Association</Link>
        </p>
      </body>
    </html>
  );
}

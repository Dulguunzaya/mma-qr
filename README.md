# Mongolian Marketing Association website

A bilingual Next.js website backed by the erxes CMS.

## Setup

1. Copy `.env.example` to `.env.local` and provide the erxes endpoint and app
   token.
2. Install dependencies with `pnpm install`.
3. Start development with `pnpm dev`.

The Mongolian site is available at `/mn` and the English site at `/en`.

## Commands

- `pnpm dev` — start the development server
- `pnpm check` — run TypeScript and ESLint validation
- `pnpm build` — create the production build in `.next`
- `pnpm start` — run the production server

## Project structure

- `src/app` — routes and layouts
- `src/components` — site components
- `src/gql` — GraphQL documents, request handling and server CMS functions
- `src/hooks` — reusable client-side behavior
- `messages` — Mongolian and English translations

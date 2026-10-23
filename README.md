# OrbitFlow Dashboard

A responsive customer-engagement dashboard starter built with **Next.js App Router**, **TypeScript**, and **Tailwind CSS v4**. The interface is inspired by modern SaaS dashboards but uses its own OrbitFlow brand and a separate emerald / teal / warm-amber color system.

## Features

- `src/app` App Router structure with overview and dedicated workspace routes.
- Reusable sidebar, top navigation, modal, toast, page header, metric card, and table patterns.
- Responsive desktop sidebar, collapsible navigation, and mobile navigation drawer.
- Light, dark, and system theme modes (persisted with `next-themes`).
- Interactive overview, onboarding checklist, charts, and campaign table.
- Add-contact and add-deal flows, contact/deal detail dialogs, and live in-session filtering.
- Create campaign and AI-agent draft forms.
- CSV export for contacts, deals, and a summary report.
- Demo wallet credits, notification popover, help center, tutorials, channel views, integrations, and local assistant demo.
- Keyboard-dismissable modals, reduced-motion support, status labels, focus styles, and accessible control labels.

## Requirements

- Node.js 20.9 or later (Node.js 22 LTS recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production checks

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

## Routes

- `/` — Overview dashboard
- `/contacts` — Contact directory
- `/deals` — Sales pipeline
- `/campaigns` — Campaign workspace
- `/analytics` — Performance insights
- `/whatsapp`, `/sms`, `/rcs`, `/email`, `/voice` — Channel workspaces
- `/chatbot` — AI agent drafts
- `/templates` — Reusable message templates
- `/integrations` — Integration catalog
- `/settings` — Workspace preferences
- `/help` — Help center

## Important production notes

This is a polished **front-end starter**, not a connected CRM or messaging backend. Dashboard records are sample data; create flows and wallet updates live in client state and reset when the app is refreshed. CSV exports are generated in the browser. The AI assistant uses illustrative local response rules, not a model API. No real payments, message delivery, voice calls, provider credentials, user authentication, authorization, or database persistence are configured.

Before handling real customer data, connect server-side APIs and a database, add authentication and role-based authorization, validate all writes server-side, store secrets only in server environment variables, configure provider webhooks, implement consent / opt-out handling, and add logging, monitoring, rate limits, and tests. Real wallet transactions must use a payment provider with server-side verification; never treat client-side credit changes as payments.

## Styling notes

Tailwind CSS v4 is loaded through `@import "tailwindcss"` with the official `@tailwindcss/postcss` integration. Global semantic CSS variables power the design tokens so the entire app can switch themes consistently. The interface uses Emerald / Teal accents and warm Amber highlights rather than Botify's purple / blue palette.

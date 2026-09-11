# CollegePick

Find the college that fits you, not just the one that ranks.

CollegePick is a college discovery tool: search and filter colleges, read fees, placements and
reviews on one page, compare up to three colleges side by side, and save what you shortlist.

- Live: _not deployed yet_
- Repo: https://github.com/krishna-2-005/collegepick

## Status

| Area | State |
|---|---|
| App scaffold and design system | Done |
| Database schema and seed | Planned |
| Colleges, detail, reviews, compare, saved APIs | Planned |
| Auth (email and password) | Planned |
| Home, listing, detail, compare, saved pages | Planned |
| Deploy | Planned |

## Features

1. **College listing and search**: search by name, filter by state, city, course, fees, rating, exam and ownership, sort, load more.
2. **College detail**: overview, courses, placements and reviews.
3. **Compare colleges**: two or three colleges side by side, shareable link, save the comparison.
4. **Accounts and saved items**: sign up, log in, save colleges and comparisons.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · PostgreSQL on Neon ·
Prisma · Auth.js · Zod · TanStack Query · zustand · nuqs · Recharts · lucide-react · sonner

## Run locally

Requires Node 20+ and pnpm 10.

```bash
pnpm install
cp .env.example .env      # then fill in DATABASE_URL and AUTH_SECRET
pnpm dev                  # http://localhost:3000
```

The component kit is at [`/dev/ui`](http://localhost:3000/dev/ui).

| Script | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm screenshot [/path ...]` | Full-page screenshots at 375, 768 and 1280px into `.screenshots/` (app must be running) |

## Design system

The interface is meant to feel like a clear decision tool: a calm surface, one bold accent, and
numbers doing the talking.

### Color tokens

Defined as CSS variables in `src/app/globals.css` and exposed to Tailwind as `bg-surface`,
`text-ink`, `border-line` and so on.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F7F8FA` | Page background |
| `--surface` | `#FFFFFF` | Cards, panels |
| `--ink` | `#14213D` | Primary text |
| `--ink-muted` | `#5B6478` | Secondary text |
| `--line` | `#E3E6EC` | Borders, dividers |
| `--accent` | `#1F5EFF` | Primary actions, links, active filters |
| `--accent-soft` | `#E8EEFF` | Selected chips, accent backgrounds |
| `--good` | `#12805C` | Best in row, high placement |
| `--warn` | `#B45309` | Fee warnings, low placement rate, destructive actions |
| `--gold` | `#C99A2E` | Rating stars only |

### Type

- Headings: Bricolage Grotesque 500/700. Body, UI and numbers: Inter 400/500/600.
- Scale: 12 / 14 / 16 / 18 / 22 / 28 / 36 / 52px. Body is 16px with 1.6 line height.
- Every number is set with tabular figures. Big numbers are always larger than their label.
- Sentence case everywhere; no all-caps labels.

### Shape and depth

- Radius: 6px for controls, 12px for cards, 20px for the hero panel and compare table.
- Depth comes from borders and the contrast between `--bg` and `--surface`. The one shadow is
  reserved for the sticky compare bar and dialogs.

### Motion

Only three things move in the whole app:

1. The compare bar slides up when the first college is added, and college avatars pop into it.
2. Filtered results cross-fade (150ms) when the list changes.
3. The save heart fills with a spring when tapped.

`prefers-reduced-motion` turns all three off.

## Architecture

_Added with the API work: page → hook → route handler → zod → server → Prisma._

## Data model

_Added with the Prisma schema._

## API reference

_Added with the API work._

## Decisions

- **Own UI kit on native elements.** Dialog and Drawer use `<dialog>` with `showModal()` for focus
  trapping, Escape and an inert page without a library. The fee slider is two native range inputs,
  the star rating input is five native radios, and Select is a styled native `<select>`. Keyboard
  and screen reader behavior comes from the platform instead of custom code.
- **Tailwind defaults are removed.** The theme resets Tailwind's palette, shadows, radii and type
  scale, so an off-system class like `bg-gray-100` or `shadow-lg` produces no CSS. Only the tokens
  above exist.
- **Destructive actions use `--warn`.** The palette has no red; amber reads as "careful" and keeps
  the palette to the ten tokens.
- **No motion outside the three allowed animations.** Skeletons are static blocks (no pulse),
  loading buttons swap their label ("Saving college…") instead of showing a spinner, hover states
  change instantly, and sonner's toast transitions are turned off.
- **Toasts sit top-center with no shadow,** so they never cover the sticky compare bar and the
  single-shadow rule holds.
- **Tabular figures are set on `body`,** which guarantees every number lines up without relying
  on each component to remember it.
- **Hit targets:** small buttons and chips are 40px tall on mobile and 36px/32px from 768px up.
- **`noUncheckedIndexedAccess` is on** in addition to `strict`, so array and record lookups are
  typed as possibly undefined.
- **`/dev/ui` ships to production** with `noindex`. It documents the design system for reviewers
  and costs nothing at runtime.
- **Dependencies are added in the step that first uses them,** so each commit's `package.json`
  matches what the code actually imports.

## Edge cases

_Documented as each API lands._

## What's next

_Filled in after deploy._

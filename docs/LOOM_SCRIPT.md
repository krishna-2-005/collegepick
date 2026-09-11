# Loom script (about 9 minutes)

Have ready: the live site on desktop and a phone-sized window, the browser network tab, the
repo open at `src/server/reviews.ts` and `src/server/colleges.ts`, Prisma Studio.

## 0:00 What it is, and a 90-second demo

"CollegePick helps a student go from 200 colleges to a shortlist of three. Four features:
search and filters, a college page, side-by-side compare, and accounts with saved items."

1. Home: type "kaveri" in the search, arrow down, Enter. The typeahead cancels stale requests.
2. Back, then "Browse by state → Karnataka". Add B.Tech and a fee range. Point out the URL
   changing, then press Back to show filters are history entries. Copy the URL into a new tab:
   same results.
3. Add two colleges to compare from the cards; the bar slides up. Add a fourth: toast
   explains the limit.
4. Open a college: sticky section tabs, placement chart, reviews. Write a review (log in with
   the demo account first): it appears immediately, the rating updates.
5. Compare page: best value per row in green, radar chart, Share link, Save comparison.
6. Saved page: saved colleges and the saved comparison. Resize to phone width: filters in a
   drawer, compare table scrolls with the first column pinned.
7. Predictor (stretch): JEE Main, rank 40,000 → reach, good chance and safe, each row showing
   the closing rank and how far it is from yours.

## 2:00 Architecture and request flow

Show the diagram in `docs/ARCHITECTURE.md`.

- "Page → hook → route handler → zod → server layer → Prisma. Route handlers are thin; all
  queries live in `server/*`, which is marked `server-only`."
- "Server components call the server layer directly. The listing renders its first page on
  the server and hands it to TanStack Query under the same key, so there's no second fetch."
- "One response envelope everywhere; errors carry a code, a human message and zod details."

## 4:00 Schema and denormalization

Open `prisma/schema.prisma`, then Prisma Studio.

- "Rating, rating count and fee range are stored on College. The listing filters and sorts on
  them on every request, so they need to be plain indexed columns."
- Open `createReview`: "They're recomputed inside the insert transaction. The `FOR UPDATE`
  lock on the college row means two reviews at the same moment can't both read the old count."
- "Keyset pagination: the cursor is the last row's sort value and id. Offsets would repeat or
  skip rows when a rating changes between two Load more clicks."

## 6:00 Edge cases live

In the network tab:

- `/api/colleges?minFees=900000&maxFees=100000` → 400, message and `details.path`.
- `/api/colleges/compare?ids=a` → 400; `?ids=a,a` → 400; an unknown slug → 404 naming it.
- Post the same review twice → 409. Sign up with an existing email in capitals → 409.
- Save an already-saved college → 200, not an error.
- `/colleges/not-a-real-college` → real 404 status and page.
- `/login?next=//evil.com` → lands on `/`.
- Mention `pnpm smoke` (107 checks, including five parallel reviews) and `pnpm a11y`
  (axe, zero violations).

## 8:00 Design decisions

- "Data-first: numbers are bigger than their labels, tabular figures everywhere, one accent."
- "Own small UI kit on native elements: `<dialog>`, native range inputs, native radios. The
  platform gives focus trapping and keyboard support."
- "Exactly three animations, all following a user action: compare bar, results fade, save
  heart. Everything respects reduced motion. Tailwind's default palette and shadows are
  removed, so off-system styles don't compile to anything."

## 9:00 Trade-offs and next steps

- JWT sessions can't be revoked early; next step is a token version on the user.
- The rate limiter is in-memory, so it's per instance; next step is Upstash.
- Mobile Lighthouse performance on the listing is held back by hydration; next step is
  rendering the first page of cards as server components.
- The predictor uses one closing rank per exam; real use needs category, quota, round and
  several years of history.

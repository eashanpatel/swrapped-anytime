# Wrapped Anytime

Get your Spotify statistics anytime and anywhere, not just at the end of the year.

Shows your top artists and tracks over three time ranges — 1 month, 6 months,
and lifetime — using the Spotify Web API.

Built with React 18, React Router 6, and Vite.

## Setup

You need a Spotify app of your own. Create one at the
[Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

In **Edit Settings → Redirect URIs**, add:

```
http://127.0.0.1:3000/callback
```

`localhost` aliases and plain `http://` redirect URIs were removed by Spotify on
27 November 2025. `127.0.0.1` is still accepted for local development; anything
deployed needs an `https://` URI.

Then copy the example env file and fill in your Client ID:

```bash
cp .env.example .env
```

```
VITE_SPOTIFY_CLIENT_ID=your-client-id
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback
```

The Client ID is a public identifier for a PKCE client, not a secret. There is
no client secret in this flow — if something asks you for one, it is the wrong
flow.

## Running it

```bash
npm install
npm run dev
```

Then open **<http://127.0.0.1:3000>**.

> Browse to `127.0.0.1`, never `localhost`. They reach the same dev server, but
> Spotify matches `redirect_uri` as an exact string. Loading the app via
> `localhost` and then sending a `127.0.0.1` redirect URI fails with
> `INVALID_CLIENT: Invalid redirect URI`, which does not hint at the real cause.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on `127.0.0.1:3000` (strict port) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the auth unit tests |

The dev server pins its port deliberately. If Vite silently fell back to 3001,
the redirect URI would stop matching and Spotify would return an opaque error.

## Authentication

Authorization Code flow with PKCE, entirely in the browser. `src/auth/pkce.js`
owns the whole flow; `getValidAccessToken()` is the only token accessor the rest
of the app should use. It refreshes access tokens automatically, with a 60
second skew window so a request never goes out holding a token that is about to
expire.

All Spotify calls go through `src/api/spotify.js`, which is the single place
API errors are handled.

## Known trade-off

This keeps a refresh token in `localStorage`. That is the standard shape for a
browser-only public client and is fine for a personal project, but it is a
long-lived credential sitting in storage readable by any XSS on the origin.

The real fix is a small backend that holds the refresh token and proxies Spotify
calls. That changes the deployment story entirely, so it is deliberately not
done here.

## Design

Dark, single-theme by intent — a listening-stats app is a low-light surface, so
there is no light variant.

Tokens live in `src/styles/tokens.css`: colour, type scale, spacing, radii,
elevation, and motion, all as CSS custom properties. Components reference the
tokens, never raw hex. The generated design system this was derived from is in
`design-system/wrapped-anytime/MASTER.md`.

- `src/styles/tokens.css` — tokens, reset, and the global reduced-motion rule
- `src/App.css` — landing page and the authenticated shell
- `src/styles/page.css` — the shared grid, card, skeleton, and state styles
- `src/ui/icons.jsx` — hand-authored SVG set, 24px box, 2px stroke

Type is Righteous for headings and Poppins for body, loaded from Google Fonts
with `display=swap`.

The six destinations are one grid — {artists, songs} × {month, six, lifetime} —
so the nav is two segmented controls rather than six flat links. Changing one
axis holds the other steady. All six URLs still work as direct links.

## Follow-up work

1. Collapse the six near-identical page components into one parameterized
   `<TopItemsPage type timeRange />`. They already share `<TopItemsGrid>` for
   the loading, error, and empty states; what remains duplicated is the fetch
   call and the page copy.
2. Backend token proxy, per the trade-off above.
3. A deploy target with an `https://` redirect URI.

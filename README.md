# Wrapped Anytime

Your Spotify listening statistics on demand — not once a year when Spotify
decides you are ready for them.

Shows your top **artists** and **tracks** across three time ranges (last four
weeks, roughly six months, and all-time), pulled live from the Spotify Web API.

**Stack:** React 18 · React Router 6 · Vite · Vitest. No CSS framework, no state
library, no icon package — three runtime dependencies total.

---

## Contents

- [How it works](#how-it-works)
- [Setup](#setup)
- [Running it](#running-it)
- [Project structure](#project-structure)
- [Authentication](#authentication)
- [Design](#design)
- [Security trade-off](#security-trade-off)
- [Roadmap](#roadmap)

---

## How it works

You log in with Spotify, the app exchanges the resulting code for an access
token entirely in your browser, and every page calls `GET /v1/me/top/{type}`
with an explicit `time_range`. There is no backend and no database — nothing is
stored anywhere except your own browser's `localStorage`.

The app requests two read-only scopes: `user-top-read` and
`user-read-recently-played`. It never writes to your account.

---

## Setup

### 1. Create a Spotify app

Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
and create an app. Under **Edit Settings → Redirect URIs**, add exactly:

```
http://127.0.0.1:3000/callback
```

> **Why `127.0.0.1` and not `localhost`?**
> On **27 November 2025** Spotify removed the Implicit Grant flow, plain `http://`
> redirect URIs, and `localhost` aliases. `127.0.0.1` is still accepted for local
> development. Anything deployed needs an `https://` URI.

### 2. Configure the environment

```bash
cp .env.example .env
```

Fill in your Client ID:

```ini
VITE_SPOTIFY_CLIENT_ID=your-client-id-here
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback
```

The Client ID is a **public** identifier for a PKCE client, not a secret. There
is no client secret in this flow — if something asks you for one, it is the
wrong flow.

---

## Running it

```bash
npm install
npm run dev
```

Then open **<http://127.0.0.1:3000>**.

> ⚠️ **Browse to `127.0.0.1`, never `localhost`.** Vite will print a
> `localhost` URL — ignore it. Both reach the same server, but Spotify matches
> `redirect_uri` as an exact *string*. Loading the app from `localhost` and then
> sending a `127.0.0.1` redirect URI fails with
> `INVALID_CLIENT: Invalid redirect URI`, which gives no hint as to the real cause.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on `127.0.0.1:3000` |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the auth unit tests |

The dev server pins its port on purpose (`strictPort`). If Vite silently fell
back to 3001, the redirect URI would stop matching and Spotify would return an
opaque error.

---

## Project structure

```
src/
├── auth/
│   ├── pkce.js          Whole OAuth flow: challenge, exchange, refresh, storage
│   ├── pkce.test.js     Unit tests for the parts that are easy to get wrong
│   └── Callback.jsx     /callback route — completes login, then redirects
├── api/
│   └── spotify.js       The single place Spotify API errors are handled
├── ui/
│   ├── TopItemsGrid.jsx Loading / error / empty / data states for all six pages
│   └── icons.jsx        Hand-authored SVG set (24px box, 2px stroke)
├── Artists/             Three pages + the artist card
├── Songs/               Three pages + the track card
├── styles/
│   ├── tokens.css       Design tokens, reset, global reduced-motion rule
│   └── page.css         Shared grid, card, skeleton and state styles
├── App.css              Landing page and authenticated shell
├── App.jsx              Routing, landing page, app shell
└── main.jsx             Entry point
```

### Routes

| Path | Page |
| --- | --- |
| `/` | Landing page, or redirect to `/artistsmonth` when signed in |
| `/callback` | OAuth return URI |
| `/artistsmonth` · `/artistssixmonth` · `/artistslifetime` | Top artists |
| `/songsmonth` · `/songssixmonth` · `/songslifetime` | Top tracks |

The six destinations are really one grid — `{artists, songs} × {month, six,
lifetime}` — so the nav is two segmented controls rather than six flat links.
Changing one axis holds the other steady. Every URL still works as a direct
link.

---

## Authentication

**Authorization Code flow with PKCE**, run entirely in the browser.

```
Login  →  /authorize (S256 challenge + state)  →  Spotify consent
       →  /callback?code=…  →  POST /api/token  →  tokens in localStorage
```

`src/auth/pkce.js` owns all of it. The rest of the app touches exactly one
function, `getValidAccessToken()`, which returns a usable token or refreshes it
first. Refresh happens automatically with a **60-second skew window**, so a
request never goes out holding a token that is about to expire mid-flight.

Details worth knowing if you are reading the code:

- **State is verified** on return to guard against CSRF.
- **The authorization code is single-use**, and React StrictMode fires effects
  twice in development, so `Callback.jsx` guards the exchange with a ref.
- **Spotify usually issues a new refresh token** on each refresh, but not
  always — when it omits one, the previous token is kept rather than lost.
- **A rejected refresh token clears storage** and surfaces a plain "please log
  in again" message instead of a white screen.

Two unit tests cover the parts most likely to break silently: the S256 challenge
against the published [RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
test vector, and the refresh-versus-cache decision around the skew window.

---

## Design

Dark, single-theme by intent — a listening-stats app is a low-light surface, so
there is no light variant.

- **Colour:** deep indigo ground (`#0F0F23`), raised cards (`#1B1B30`), green
  accent (`#22C55E`)
- **Type:** Righteous for headings, Poppins for body
- **Tokens:** every colour, size, radius, shadow and duration is a CSS custom
  property in `src/styles/tokens.css`. Components never use raw hex.

Accessibility and polish notes:

- Body text measures **7.4:1** against the background and the primary button
  label **7.8:1** against the green — both past WCAG AAA.
- `prefers-reduced-motion` is honoured globally; the stagger, shimmer and hover
  effects all opt out.
- Loading is a shimmer skeleton in the same box as a real card, so filling in
  data shifts no layout.
- Responsive down to 375px with no horizontal scroll.

---

## Security trade-off

This app keeps a refresh token in `localStorage`. That is the standard shape for
a browser-only public client and is fine for a personal project, but it is a
long-lived credential sitting in storage readable by any XSS on the origin.

The real fix is a small backend that holds the refresh token and proxies Spotify
calls. That changes the deployment story entirely, so it is deliberately out of
scope here.

---

## Roadmap

- [ ] Collapse the six near-identical page components into one parameterized
      `<TopItemsPage type timeRange />`. They already share `<TopItemsGrid>` for
      the loading, error and empty states; what remains duplicated is the fetch
      call and the page copy.
- [ ] Backend token proxy, per the trade-off above.
- [ ] Deploy target with an `https://` redirect URI.

---

## License

No license specified. All rights reserved.

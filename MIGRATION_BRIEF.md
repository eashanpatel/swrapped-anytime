# wrapped-anytime — Migration Brief

**Prepared:** 2 September 2026
**Scope:** Targeted refactor — replace auth + build tooling, fix real bugs, keep components/CSS/layout.

## How to use this

Open Claude Code in the project root and start with:

> Read MIGRATION_BRIEF.md and execute it. Work on a branch called `migrate/vite-pkce`. Do Task A first and confirm the app boots before moving to Task B.

Everything below was verified by rebuilding the project from source in a clean container on Node 22 — not inferred from reading.

---

## 0. Manual steps (only Eashan can do these)

Do these **before** Task B, or the auth work can't be tested.

1. Spotify Developer Dashboard → your app → **Edit Settings**.
2. **Remove** the redirect URI `http://localhost:3000`.
3. **Add** `http://127.0.0.1:3000/callback`.
   - `localhost` is no longer accepted. `127.0.0.1` still is, for local dev only.
   - Any deployed version needs an `https://` URI.
4. Note the Client ID — it goes in `.env` as `VITE_SPOTIFY_CLIENT_ID`.

> The Client ID is a **public** identifier for a PKCE client, not a secret. It's fine in a repo. There is no client secret in this flow — if a solution asks you for one, it's the wrong flow.

---

## 1. Confirmed diagnostics

### The app cannot authenticate at all (root cause)

`src/App.js` uses the **Implicit Grant flow**, which Spotify removed on **27 November 2025**, along with HTTP redirect URIs and `localhost` aliases. Three separate things in this one URL are now rejected:

```js
// src/App.js:19-21, 63
const REDIRECT_URI = "http://localhost:3000";   // localhost alias — removed
const RESPONSE_TYPE = "token"                   // implicit grant — removed
// ...and the authorize URL is built by hand with response_type=token
```

This is not a "the app is old" problem. It is a "the front door was bricked up" problem, and no build fix touches it.

### Build tooling

The project builds and runs **fine on Node 22** once dependencies resolve correctly. Verified: production build succeeded, dev server returned HTTP 200, landing page rendered correctly in headless Chrome.

One dependency landmine: a fresh `npm install` (no lockfile) resolves `@rushstack/eslint-patch` to 1.16.1, which is incompatible with the ESLint 8 config CRA ships, and the build dies with:

```
[eslint] package.json » eslint-config-react-app/jest#overrides[0]:
	Environment key "jest/globals" is unknown
```

The committed `package-lock.json` pins 1.10.2, which is correct — so this only bites on a lockfile-less install. **Vite removes this entire class of problem**, which is the main argument for Task A beyond CRA being unmaintained.

`npm audit` reports 35 vulnerabilities (15 high), nearly all in the CRA dev-server chain. Task A eliminates most of them by deletion.

### Bugs found by reading

| # | Issue | Severity | Location |
|---|---|---|---|
| 1 | Token stored in `localStorage` with **no expiry check**. Implicit tokens lasted 1h. After that `token` is truthy so the app shows the logged-in view, every fetch 401s, `objArray.items` is `undefined`, and `artists.forEach` throws an uncaught TypeError. | **High** — guaranteed crash | `App.js:27-38`, all 6 page components |
| 2 | **Zero error handling** in every fetch. No `res.ok` check, no try/catch, no loading state, no empty state. | **High** | all 6 page components |
| 3 | No `<Route path="/">`. Spotify redirects to `/`, so after login the user lands on a header with an empty content area until they click a nav link. | **High** — breaks the login journey | `App.js:123-130` |
| 4 | `obj.images[1].url` assumes ≥2 images always returned. Throws when Spotify returns fewer. | Medium | `ArtistCard.js:17`, `SongsCard.js:52` |
| 5 | The **6-month pages omit `time_range` entirely** and rely on Spotify's undocumented default. It happens to be `medium_term`, so it works by accident. | Medium | `ArtistsPageSix.js:19`, `SongsPageSix.js:19` |
| 6 | `<Nav.Link href>` does full page reloads instead of client-side routing. Works in dev; 404s on static hosting without a rewrite rule. | Medium | `App.js:109-114` |
| 7 | Component renders `<html><body>` inside `#root`. Invalid DOM nesting. React 18 tolerates it; don't count on that continuing. | Medium | `App.js:48-49, 133-134` |
| 8 | `SongsPageLifetime` and `SongsPageMonth` use `class="headerTextArtists"`, defined in **ArtistsPageStyle.css**, not in their own stylesheet. Works only because bundled CSS is global. `SongsPageSix` correctly uses `headerTextSongs`. The two rules are currently identical, so it's invisible — until one changes. | Low | `SongsPage{Lifetime,Month}.js:52-53` |
| 9 | 71 uses of `class=` vs 6 of `className=`. React passes these through with console warnings. Cosmetic, but it floods the dev console. | Low | throughout |
| 10 | 4 × `target="_blank"` without `rel="noopener noreferrer"`. Modern browsers imply `noopener`, so this is hygiene. | Low | `App.js`, card components |

### Dead weight (verified unused — safe to delete)

- **`axios`** — imported in 8 files, **never called once**. Every request uses `fetch`.
- **`localforage`**, **`match-sorter`**, **`sort-by`** — zero references. Leftovers from the React Router tutorial template.
- **`bootstrap` / `react-bootstrap`** — the Bootstrap CSS is **never imported anywhere**, so these components have always rendered unstyled. The only one actually used is `<Nav.Link>`, which is being replaced by `<Link>` in fix #6 anyway. Both packages can go.
- **`src/index.html`** — a stray duplicate of `public/index.html`. CRA never used it. Delete.
- **`web-vitals` / `reportWebVitals.js`** — never consumed; `reportWebVitals()` is called with no argument, which is a no-op.

---

## 2. Scope

**In scope:** build tooling, auth, the ten bugs above, dead dependency removal.

**Out of scope — do not do these:**
- Do not collapse the six near-identical page components into one parameterized component. It's the obviously correct refactor and it is *deliberately deferred* to keep this diff reviewable. Note it as follow-up work.
- Do not restyle anything. The CSS works.
- Do not add TypeScript.
- Do not add a state management library. There are three pieces of state.
- Do not add tests for the existing components. Do write the two auth tests noted in Task B.

---

## 3. Task A — CRA → Vite

Do this first and confirm the app boots before touching auth.

### A1. Dependencies

```bash
npm uninstall react-scripts axios localforage match-sorter sort-by bootstrap react-bootstrap \
  web-vitals @testing-library/jest-dom @testing-library/react @testing-library/user-event
npm install -D vite @vitejs/plugin-react
```

Keep: `react`, `react-dom`, `react-router-dom`.

### A2. File moves and renames

Vite's esbuild only transforms JSX in `.jsx`/`.tsx` files. **Every file containing JSX must be renamed**, or you get cryptic parse errors:

```
src/index.js                    → src/main.jsx
src/App.js                      → src/App.jsx
src/Artists/*.js                → src/Artists/*.jsx
src/Songs/*.js                  → src/Songs/*.jsx
public/index.html               → index.html   (project root)
```

Delete: `src/index.html`, `src/reportWebVitals.js`, `src/setupTests.js`, `src/App.test.js`, `src/logo.svg`.

Update every import to match the new paths.

### A3. `index.html` (project root)

Strip all `%PUBLIC_URL%` placeholders — that's a CRA-ism Vite doesn't understand. Reference the entry module explicitly, and give it a real title:

```html
<link rel="icon" href="/favicon.ico" />
<title>Wrapped Anytime</title>
...
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

(It currently says `<title>React App</title>`. Fix that while you're here.)

### A4. `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
  },
});
```

`strictPort` matters: if Vite silently falls back to 3001, the redirect URI stops matching and you get an opaque Spotify error.

### A5. `package.json` scripts

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

Also delete the `eslintConfig` and `browserslist` blocks — both are CRA-only.

### A6. Environment

`.env` (gitignored):
```
VITE_SPOTIFY_CLIENT_ID=376c9d16034d4f9b9f11892d4b3df6e6
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback
```

Commit a `.env.example` with the same keys and empty values. Add `.env` to `.gitignore`.

### A7. Checkpoint

`npm run dev` → open **`http://127.0.0.1:3000`** (not `localhost` — see Task B). The landing page should render exactly as before. Stop and confirm this works before continuing.

---

## 4. Task B — Implicit Grant → Authorization Code with PKCE

### B0. The one thing that will waste your afternoon

**Browse to `http://127.0.0.1:3000`, never `http://localhost:3000`.** They resolve to the same server, but `redirect_uri` is matched by Spotify as an exact *string*. Loading the app via `localhost` and then sending a `127.0.0.1` redirect URI produces `INVALID_CLIENT: Invalid redirect URI`, which tells you nothing about the real cause.

### B1. New file: `src/auth/pkce.js`

```js
const AUTH_ENDPOINT  = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const CLIENT_ID    = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = 'user-top-read user-read-recently-played';
const STORAGE_KEY = 'spotify_tokens';

function randomString(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  return Array.from(crypto.getRandomValues(new Uint8Array(len)), v => chars[v % chars.length]).join('');
}

function base64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function challengeFrom(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(digest);
}

// --- token storage -------------------------------------------------

export function getStoredTokens() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
}

function saveTokens({ access_token, refresh_token, expires_in }) {
  const existing = getStoredTokens();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    access_token,
    // Spotify issues a NEW refresh token on most refreshes; if it omits one, keep the old.
    refresh_token: refresh_token ?? existing?.refresh_token,
    expires_at: Date.now() + expires_in * 1000,
  }));
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEY);
}

// --- flow ----------------------------------------------------------

export async function beginLogin() {
  const verifier = randomString(64);
  const state = randomString(16);
  sessionStorage.setItem('pkce_verifier', verifier);
  sessionStorage.setItem('auth_state', state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: await challengeFrom(verifier),
    scope: SCOPES,
    state,
  });
  window.location.assign(`${AUTH_ENDPOINT}?${params}`);
}

export async function completeLogin() {
  const url = new URL(window.location.href);
  const error = url.searchParams.get('error');
  if (error) throw new Error(`Spotify denied the request: ${error}`);

  const code = url.searchParams.get('code');
  if (!code) return null;

  const state = url.searchParams.get('state');
  if (!state || state !== sessionStorage.getItem('auth_state')) {
    throw new Error('State mismatch — aborting.');
  }
  const verifier = sessionStorage.getItem('pkce_verifier');
  if (!verifier) throw new Error('Missing PKCE verifier — restart login.');

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: verifier,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${await res.text()}`);

  saveTokens(await res.json());
  sessionStorage.removeItem('pkce_verifier');
  sessionStorage.removeItem('auth_state');
  window.history.replaceState({}, '', '/');   // strip ?code= from the URL
  return getStoredTokens();
}

async function refreshTokens(refresh_token) {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
      client_id: CLIENT_ID,
    }),
  });
  if (!res.ok) { clearTokens(); throw new Error('Session expired — please log in again.'); }
  saveTokens(await res.json());
  return getStoredTokens();
}

/** The only token accessor the rest of the app should use. */
export async function getValidAccessToken() {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) return null;
  if (Date.now() < tokens.expires_at - 60_000) return tokens.access_token;
  if (!tokens.refresh_token) { clearTokens(); return null; }
  return (await refreshTokens(tokens.refresh_token)).access_token;
}
```

### B2. New file: `src/api/spotify.js`

One fetch wrapper, so error handling exists in exactly one place instead of nowhere:

```js
import { getValidAccessToken } from '../auth/pkce';

export async function getTopItems(type, timeRange, limit = 20) {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated');

  const url = `https://api.spotify.com/v1/me/top/${type}` +
              `?time_range=${timeRange}&limit=${limit}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  if (res.status === 401) throw new Error('Session expired — please log in again.');
  if (res.status === 403) throw new Error('Spotify refused this request. Check your app is not restricted in the developer dashboard.');
  if (res.status === 429) throw new Error('Rate limited by Spotify. Wait a moment and retry.');
  if (!res.ok) throw new Error(`Spotify API error ${res.status}`);

  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];   // fixes bug #1's crash path
}
```

Note the explicit `limit=20` — the pages render exactly 20 cards, and the API default is also 20, but make it explicit rather than relying on a default (same reasoning as bug #5).

### B3. Routing and `App.jsx`

- Add a `/callback` route that calls `completeLogin()`, shows a "Signing you in…" state, and navigates to `/artistsmonth` on success or back to `/` with an error message on failure.
- Add `<Route path="/" element={...} />` so the post-login landing isn't blank (**bug #3**).
- Replace the hand-built `<a href="https://accounts.spotify.com/authorize?...">` on line 63 with `<button onClick={beginLogin}>`.
- Replace all six `<Nav.Link href>` with `<Link to>` from `react-router-dom` (**bug #6**, and it drops the last `react-bootstrap` dependency).
- Remove the `<html>` and `<body>` wrappers; return a `<div>` (**bug #7**).
- `logout` should call `clearTokens()` and navigate to `/`.

Decide auth state with `getStoredTokens()` on mount, not by reading a raw token string.

### B4. Page components (all six)

Each one should:

1. Call `getTopItems('artists' | 'tracks', 'short_term' | 'medium_term' | 'long_term')` — **explicit `time_range` on all six**, fixing bug #5.
2. Track `loading` / `error` / `data` and render all three states (**bug #2**).
3. Drop the `useMemo(convertToCards)` + 20 hardcoded array indices. Render `{items.map(...)}` directly — the current code stores JSX in state, which is why the crash in bug #1 is so ugly.
4. Fix the `class="headerTextArtists"` → `headerTextSongs` mismatch in the two Songs pages (**bug #8**).

### B5. Card components

Guard the image lookup (**bug #4**):

```js
const img = obj.images?.[1]?.url ?? obj.images?.[0]?.url ?? PLACEHOLDER;
```

Same for `obj.album.images` in `SongsCard`. Add `rel="noopener noreferrer"` to the `target="_blank"` links (**bug #10**).

### B6. Two tests worth writing

Nothing else needs tests, but these two encode the parts that are easy to get subtly wrong:

- `challengeFrom()` produces the correct S256 base64url challenge for a known verifier (use a published RFC 7636 test vector).
- `getValidAccessToken()` refreshes when `expires_at` is within the 60s skew window, and returns the cached token when it isn't.

---

## 5. Task C — cleanup

- Codemod `class=` → `className=` across all `.jsx` files (**bug #9**). 71 occurrences; it's mechanical, do it in one pass, verify the page still renders identically.
- The landing page hotlinks three album-art images from `townsquare.media`, `architecturaldigest.com`, and `graphicdesignforum.com`. These are 2+ years old and likely dead. Check them; if broken, download and put them in `public/`.
- Update `README.md` — it's still the stock CRA readme and documents `npm start`, which no longer exists.

---

## 6. Verification checklist

Task A is done when:

- [ ] `npm run dev` serves on `http://127.0.0.1:3000` and the landing page is visually identical to before
- [ ] `npm run build && npm run preview` works
- [ ] `npm audit` high-severity count has dropped substantially
- [ ] No `react-scripts`, `axios`, `bootstrap`, `localforage`, `match-sorter`, or `sort-by` in `package.json`

Task B is done when:

- [ ] Clicking "Spotify Login" reaches Spotify's real consent screen
- [ ] Approving returns to `/callback` and lands on a populated page
- [ ] The URL has no leftover `?code=` after login
- [ ] All six pages load real data with correct time ranges
- [ ] Hard-refreshing on `/songslifetime` still works (client-side routing intact)
- [ ] **Expiry test:** in DevTools, edit `spotify_tokens.expires_at` in localStorage to a past timestamp, refresh, and confirm the app silently refreshes rather than crashing. This is the specific failure that made the old app unusable — verify it explicitly.
- [ ] **Revocation test:** corrupt `refresh_token`, refresh, and confirm you get a clean "please log in again" rather than a white screen
- [ ] Logout clears storage and returns to the landing page

---

## 7. Known trade-off to accept, not solve

This keeps a refresh token in `localStorage`. That's the standard shape for a browser-only public client, and it's fine for a personal project — but it is a long-lived credential sitting in storage readable by any XSS on the origin. The real fix is a small backend that holds the refresh token and proxies Spotify calls.

**Don't build that now.** It changes the deployment story entirely. Note it in the README as future work and move on.

---

## 8. Follow-up work (explicitly deferred)

1. Collapse the six page components into one parameterized `<TopItemsPage type timeRange />` — six files become one, and five of the ten bugs above only existed because the same code was copy-pasted six times.
2. Backend token proxy (§7).
3. Deploy target with an `https://` redirect URI.

const AUTH_ENDPOINT  = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const CLIENT_ID =
  import.meta.env.VITE_SPOTIFY_CLIENT_ID || '376c9d16034d4f9b9f11892d4b3df6e6';

const REDIRECT_URI =
  import.meta.env.VITE_SPOTIFY_REDIRECT_URI ||
  (typeof window === 'undefined' ? '' : `${window.location.origin}/callback`);
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

export async function challengeFrom(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(digest);
}

export function getStoredTokens() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
}

function saveTokens({ access_token, refresh_token, expires_in }) {
  const existing = getStoredTokens();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    access_token,
    refresh_token: refresh_token ?? existing?.refresh_token,
    expires_at: Date.now() + expires_in * 1000,
  }));
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function beginLogin() {
  if (!CLIENT_ID || !REDIRECT_URI) {
    throw new Error(
      'Spotify is not configured for this build. VITE_SPOTIFY_CLIENT_ID and ' +
      'VITE_SPOTIFY_REDIRECT_URI must be set in the host environment before ' +
      'the build runs, then redeployed.'
    );
  }

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
  window.history.replaceState({}, '', '/');
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

export async function getValidAccessToken() {
  const tokens = getStoredTokens();
  if (!tokens?.access_token) return null;
  if (Date.now() < tokens.expires_at - 60_000) return tokens.access_token;
  if (!tokens.refresh_token) { clearTokens(); return null; }
  return (await refreshTokens(tokens.refresh_token)).access_token;
}

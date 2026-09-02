import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { challengeFrom, getValidAccessToken, getStoredTokens } from './pkce';

const STORAGE_KEY = 'spotify_tokens';

// Minimal localStorage stand-in; the node test environment has no DOM.
function installStorage() {
  const map = new Map();
  globalThis.localStorage = {
    getItem: key => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: key => map.delete(key),
    clear: () => map.clear(),
  };
}

describe('challengeFrom', () => {
  // RFC 7636 Appendix B test vector.
  it('derives the published S256 challenge for the published verifier', async () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    await expect(challengeFrom(verifier))
      .resolves.toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  it('emits base64url, never standard base64 padding or alphabet', async () => {
    const challenge = await challengeFrom('a'.repeat(43));
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
  });
});

describe('getValidAccessToken', () => {
  beforeEach(() => {
    installStorage();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete globalThis.localStorage;
  });

  function seed(tokens) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }

  it('returns the cached token when it is comfortably unexpired', async () => {
    seed({
      access_token: 'cached',
      refresh_token: 'r1',
      expires_at: Date.now() + 10 * 60_000,
    });
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      throw new Error('should not refresh');
    });

    await expect(getValidAccessToken()).resolves.toBe('cached');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('refreshes when expiry falls inside the 60s skew window', async () => {
    seed({
      access_token: 'stale',
      refresh_token: 'r1',
      expires_at: Date.now() + 30_000,   // unexpired, but inside the skew
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'fresh', refresh_token: 'r2', expires_in: 3600 }),
    });

    await expect(getValidAccessToken()).resolves.toBe('fresh');
    expect(getStoredTokens().refresh_token).toBe('r2');
  });

  it('keeps the previous refresh token when Spotify omits a new one', async () => {
    seed({
      access_token: 'stale',
      refresh_token: 'r1',
      expires_at: Date.now() - 1000,
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'fresh', expires_in: 3600 }),
    });

    await getValidAccessToken();
    expect(getStoredTokens().refresh_token).toBe('r1');
  });

  it('clears storage and reports a clean error when the refresh token is rejected', async () => {
    seed({
      access_token: 'stale',
      refresh_token: 'revoked',
      expires_at: Date.now() - 1000,
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 400 });

    await expect(getValidAccessToken()).rejects.toThrow('Session expired');
    expect(getStoredTokens()).toBeNull();
  });

  it('returns null rather than throwing when nothing is stored', async () => {
    await expect(getValidAccessToken()).resolves.toBeNull();
  });
});

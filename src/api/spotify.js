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

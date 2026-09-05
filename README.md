# Wrapped Anytime

Wrapped Anytime is a website that displays your Spotify listening stats whenever you want them, not just once a year on Spotify's schedule.

Shows your top **artists** and **tracks** across three time ranges (last four
weeks, roughly six months, and all-time), pulled live from the Spotify Web API.

https://swrapped-anytime.vercel.app/

---

## How it works

Log in with Spotify. The app exchanges the auth code for an access token right
in your browser, then calls `GET /v1/me/top/{type}` with an explicit
`time_range` for each page. It requests two read-only scopes: `user-top-read` and
`user-read-recently-played`. Nothing gets stored except in your browser's `localStorage`.

---

## License

No license specified. All rights reserved.

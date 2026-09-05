import './App.css';
import { useState } from 'react';
import {Route, Routes, Link, Navigate, Outlet, useNavigate, useLocation} from "react-router-dom";
import { beginLogin, clearTokens, getStoredTokens } from './auth/pkce';
import Callback from './auth/Callback';
import {
  AudioLines, Mic, MusicNote, Clock, Sparkle, LogOut, AlertTriangle, Mail,
} from './ui/icons';
import ArtistsPageMonth from './Artists/ArtistsPageMonth';
import ArtistsPageSix from './Artists/ArtistsPageSix';
import ArtistsPageLifetime from './Artists/ArtistsPageLifetime';
import SongsPageSix from './Songs/SongsPageSix';
import SongsPageLifetime from './Songs/SongsPageLifetime';
import SongsPageMonth from './Songs/SongsPageMonth';

const ROUTES = {
  artists: { month: '/artistsmonth', six: '/artistssixmonth', lifetime: '/artistslifetime' },
  songs:   { month: '/songsmonth',   six: '/songssixmonth',   lifetime: '/songslifetime' },
};

const RANGE_LABELS = { month: '1 Month', six: '6 Months', lifetime: 'Lifetime' };

function useCurrentView() {
  const { pathname } = useLocation();
  for (const type of Object.keys(ROUTES)) {
    for (const range of Object.keys(RANGE_LABELS)) {
      if (ROUTES[type][range] === pathname) return { type, range };
    }
  }
  return { type: 'artists', range: 'month' };
}

function Landing({ error }) {
  return (
    <main className="landing">
      <div className="landing__inner">

        <section className="hero">
          <div>
            <h1 className="hero__title">Wrapped <em>Anytime</em></h1>

            <p className="hero__lede">
              Your top artists and tracks, on demand — not once a year when
              Spotify decides you are ready for them.
            </p>

            <div className="hero__actions">
              <button type="button" className="btn btn--primary" onClick={beginLogin}>
                <AudioLines className="btn__icon" />
                Log in with Spotify
              </button>
            </div>

            {error && (
              <p className="alert" role="alert">
                <AlertTriangle />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="collage" aria-hidden="true">
            <div className="collage__item">
              <img alt="" loading="lazy" src="https://townsquare.media/site/812/files/2018/07/travis-scott-astroworld-cover-art-full.jpg?w=1080&q=75" />
            </div>
            <div className="collage__item">
              <img alt="" loading="lazy" src="https://media.architecturaldigest.com/photos/5890e88033bd1de9129eab0a/1:1/w_870,h_870,c_limit/Artist-Designed%20Album%20Covers%202.jpg" />
            </div>
            <div className="collage__item">
              <img alt="" loading="lazy" src="https://www.graphicdesignforum.com/uploads/default/original/2X/d/d3c4e744046205a49d06beb874df3b39da7c9c73.jpeg" />
            </div>
          </div>
        </section>

        <section className="features">
          <article className="feature">
            <Mic className="feature__icon" />
            <h2 className="feature__title">Artists and songs</h2>
            <p className="feature__body">
              Two ranked grids of twenty, straight from your own listening history.
            </p>
          </article>
          <article className="feature">
            <Clock className="feature__icon" />
            <h2 className="feature__title">Three time ranges</h2>
            <p className="feature__body">
              The last four weeks, roughly six months, or the whole span Spotify
              has been keeping track.
            </p>
          </article>
          <article className="feature">
            <Sparkle className="feature__icon" />
            <h2 className="feature__title">No waiting for December</h2>
            <p className="feature__body">
              Check in whenever you like. The numbers update as you listen.
            </p>
          </article>
        </section>

        <section className="about">
          <h2 className="about__title">About this</h2>
          <p className="about__body">
            Wrapped Anytime uses Spotify&apos;s Web API to retrieve your listening
            data and format it into the lists you see here. Built with React and
            Vite.
          </p>
        </section>

        <footer className="footer">
          <a className="footer__link" href="https://github.com/eashanpatel" target="_blank" rel="noopener noreferrer">
            <img alt="" src="/github-mark.png" />
            GitHub
          </a>
          <a className="footer__link" href="http://www.linkedin.com/in/eashanpatel" target="_blank" rel="noopener noreferrer">
            <img alt="" src="/linkedin-mark.png" />
            LinkedIn
          </a>
          <a className="footer__link" href="mailto:eashanpatel@gmail.com">
            <Mail />
            eashanpatel@gmail.com
          </a>
        </footer>

      </div>
    </main>
  );
}

function Shell({ onLogout }) {
  const { type, range } = useCurrentView();

  return (
    <div className="shell">
      <header className="appbar">
        <div className="appbar__inner">
          <span className="appbar__brand">
            <AudioLines />
            Wrapped Anytime
          </span>
          <button type="button" className="btn btn--ghost" onClick={onLogout}>
            <LogOut className="btn__icon" />
            Log out
          </button>
        </div>
      </header>

      <nav className="navbar" aria-label="Listening statistics">
        <div className="navbar__inner">
          <span className="seg__label">Show</span>
          <div className="seg">
            <Link
              className="seg__item"
              to={ROUTES.artists[range]}
              aria-current={type === 'artists' ? 'page' : undefined}
            >
              <Mic />
              Artists
            </Link>
            <Link
              className="seg__item"
              to={ROUTES.songs[range]}
              aria-current={type === 'songs' ? 'page' : undefined}
            >
              <MusicNote />
              Songs
            </Link>
          </div>

          <span className="seg__label">Over</span>
          <div className="seg">
            {Object.keys(RANGE_LABELS).map(key => (
              <Link
                key={key}
                className="seg__item"
                to={ROUTES[type][key]}
                aria-current={range === key ? 'page' : undefined}
              >
                {RANGE_LABELS[key]}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <Outlet />
    </div>
  );
}

function App() {

  const [authed, setAuthed] = useState(() => Boolean(getStoredTokens()?.access_token));
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  const logout = () => {
    clearTokens();
    setAuthed(false);
    navigate('/', { replace: true });
  }

  return (
    <Routes>
      <Route path="/callback" element={
        <Callback
          onAuthed={() => { setAuthed(true); setAuthError(null); }}
          onError={setAuthError}
        />
      } />

      {authed ? (
        <Route element={<Shell onLogout={logout} />}>
          <Route path="/" element={<Navigate to="/artistsmonth" replace />} />
          <Route path="/artistsmonth" element={<ArtistsPageMonth />} />
          <Route path="/artistssixmonth" element={<ArtistsPageSix />} />
          <Route path="/artistslifetime" element={<ArtistsPageLifetime />} />
          <Route path="/songsmonth" element={<SongsPageMonth />} />
          <Route path="/songssixmonth" element={<SongsPageSix />} />
          <Route path="/songslifetime" element={<SongsPageLifetime />} />
          <Route path="*" element={<Navigate to="/artistsmonth" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Landing error={authError} />} />
      )}
    </Routes>
  );
}

export default App;


import './App.css';
import { useState } from 'react';
import {Route, Routes, Link, Navigate, Outlet, useNavigate} from "react-router-dom";
import { beginLogin, clearTokens, getStoredTokens } from './auth/pkce';
import Callback from './auth/Callback';
import ArtistsPageMonth from './Artists/ArtistsPageMonth';
import ArtistsPageSix from './Artists/ArtistsPageSix';
import ArtistsPageLifetime from './Artists/ArtistsPageLifetime';
import SongsPageSix from './Songs/SongsPageSix';
import SongsPageLifetime from './Songs/SongsPageLifetime';
import SongsPageMonth from './Songs/SongsPageMonth';

function Landing({ error, onLogout }) {
  return (
    <div className="pageStyle">
      <div className="headerView" id="headerView">
        <h1 className='headerText'> Wrapped Anytime </h1>
        <p className="headerDescription"> Get your spotify statistics anytime and anywhere, not just the end of the year </p>
      </div>
      <div className="middleView" id="middleView">
        <div className="middleLeftView" id="middleLeftView">
          <ul className="ulFirstList">
            <li className="middleLeftViewText"> Top Artists and Songs </li>
            <li className="middleLeftViewText"> Within a month, 6 months or lifetime </li>
            <li className="middleLeftViewText"> Uses Spotify API </li>
          </ul>
          <button className="btn-hover" onClick={beginLogin}> Spotify Login </button>
          <button className="btn-hover" onClick={onLogout}> Lose My Data </button>
          {error && <p className="headerDescription"> {error} </p>}
        </div>
          <div className="middleRightView" id="middleRightView">
            <img alt="Can't display image" className="imageBorder" src="https://townsquare.media/site/812/files/2018/07/travis-scott-astroworld-cover-art-full.jpg?w=1080&q=75" />
          </div>
          <div className="middleRightView" id="middleRightView">
            <img alt="Can't display image" className="imageBorder" src="https://media.architecturaldigest.com/photos/5890e88033bd1de9129eab0a/1:1/w_870,h_870,c_limit/Artist-Designed%20Album%20Covers%202.jpg" />
          </div>
          <div className="middleRightView" id="middleRightView">
            <img alt="Can't display image" className="imageBorder" src="https://www.graphicdesignforum.com/uploads/default/original/2X/d/d3c4e744046205a49d06beb874df3b39da7c9c73.jpeg"/>
          </div>
        </div>
      <div className="bottomView" id="bottomView">
        <div className="bottomTopView" id="bottomTopView">
          <div className="bottomEmptyThirds" id="bottomEmptyThirds">
          </div>
          <div className="bottomTopThirds" id="bottomTopThirds">
            <h1 className="bottomHeaderText"> About This </h1>
            <p className="bottomMainText"> Wrapped Anytime is a project that uses Spotify's API to retrieve user data.
            It is then conveniently formatted into the categories and lists you see on your end. This website was built using
            React and Bootstrap. Proudly made by an 18 year old college student :) </p>
          </div>
          <div className="bottomEmptyThirds" id="bottomEmptyThirds">
          </div>
        </div>
        <div className="bottomBottomView" id="bottomBottomView">
          <a className="plugButton" href="https://github.com/eashanpatel" target="_blank" rel="noopener noreferrer"> <img alt="Can't display image" className="imageBorder2 githubBorder" src="/github-mark.png"/></a>
          <a className="plugButton" href="http://www.linkedin.com/in/eashanpatel" target="_blank" rel="noopener noreferrer"> <img alt="Can't display image" className="imageBorder2" src="data:image/png;base64,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"/></a>
          <div className="plugButtonOval"> <img alt="Can't display image" className="imageBorder2 emailBorder" src="https://cdn.icon-icons.com/icons2/652/PNG/512/gmail_icon-icons.com_59877.png"/> <p className="plugText"> eashanpatel@gmail.com </p> </div>
        </div>
      </div>
    </div>
  );
}

function Shell({ onLogout }) {
  return (
    <div className="secondPageStyle">
      <div className="headerView2">
        <div className="headerLeftThirds">
          <h1 className='headerTextPage2'> Wrapped Anytime </h1>
        </div>
        <div className="headerMiddleThirds">
          <Link className="navbarText" to="/artistsmonth"> Artists - Month</Link>
          <Link className="navbarText" to="/artistssixmonth"> Artists - 6 Month </Link>
          <Link className="navbarText" to="/artistslifetime"> Artists - Lifetime </Link>
          <Link className="navbarText" to="/songsmonth"> Songs - Month </Link>
          <Link className="navbarText" to="/songssixmonth"> Songs - 6 Month </Link>
          <Link className="navbarText" to="/songslifetime"> Songs - Lifetime </Link>
        </div>
        <div className="headerRightThirds">
          <button className="logoutButton" onClick={onLogout}> Logout </button>
        </div>
      </div>

      <div className="artistSongViews">
        <Outlet />
      </div>
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
        <Route path="*" element={<Landing error={authError} onLogout={logout} />} />
      )}
    </Routes>
  );
}

export default App;

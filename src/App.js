
import './App.css';
import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {Route, Routes, Link} from "react-router-dom";
import ArtistsPageMonth from './Artists/ArtistsPageMonth';
import ArtistsPageSix from './Artists/ArtistsPageSix';
import ArtistsPageLifetime from './Artists/ArtistsPageLifetime';
import SongsPageSix from './Songs/SongsPageSix';
import SongsPageLifetime from './Songs/SongsPageLifetime';
import SongsPageMonth from './Songs/SongsPageMonth';

function App() {

  const CLIENT_ID = "376c9d16034d4f9b9f11892d4b3df6e6";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("");
  const [artists, setArtists] = useState([]);
  const [showDefaultPage, setShowDefaultPage] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash){
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }
    console.log(token)
    setToken(token);
  }, [])


  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  }


  return (
    <html>
      <body>
        {!token ? 
        <div class="pageStyle">
          <div class="headerView" id = "headerView">
            <h1 class='headerText'> Wrapped Anytime </h1>
            <p class="headerDescription"> Get your spotify statistics anytime and anywhere, not just the end of the year </p>
          </div>
          <div class="middleView" id = "middleView">
            <div class="middleLeftView" id = "middleLeftView">
              <ul class="ulFirstList">
                <li class = "middleLeftViewText"> Top Artists and Songs </li>
                <li class = "middleLeftViewText"> Within a month, 6 months or lifetime </li>
                <li class = "middleLeftViewText"> Uses Spotify API </li>
              </ul>
              <a href="https://accounts.spotify.com/authorize?client_id=376c9d16034d4f9b9f11892d4b3df6e6&scope=user-top-read%20user-read-recently-played&redirect_uri=http://localhost:3000&response_type=token">
                <button class="btn-hover"> Spotify Login </button>
              </a> 
              <button class="btn-hover" onClick={logout}> Lose My Data </button>
            </div>
              <div class="middleRightView" id = "middleRightView">
                <img alt = "Can't display image" class="imageBorder" src="https://townsquare.media/site/812/files/2018/07/travis-scott-astroworld-cover-art-full.jpg?w=1080&q=75" />
              </div>
              <div class="middleRightView" id = "middleRightView">
                <img alt = "Can't display image" class="imageBorder" src="https://media.architecturaldigest.com/photos/5890e88033bd1de9129eab0a/1:1/w_870,h_870,c_limit/Artist-Designed%20Album%20Covers%202.jpg" />
              </div>
              <div class="middleRightView" id = "middleRightView">
                <img alt = "Can't display image" class="imageBorder" src="https://www.graphicdesignforum.com/uploads/default/original/2X/d/d3c4e744046205a49d06beb874df3b39da7c9c73.jpeg"/>
              </div>
            </div>
          <div class="bottomView" id = "bottomView">
            <div class="bottomTopView" id = "bottomTopView">
              <div class="bottomEmptyThirds" id = "bottomEmptyThirds">
              </div>
              <div class="bottomTopThirds" id = "bottomTopThirds">
                <h1 class="bottomHeaderText"> About This </h1>
                <p class="bottomMainText"> Wrapped Anytime is a project that uses Spotify's API to retrieve user data. 
                It is then conveniently formatted into the categories and lists you see on your end. This website was built using 
                React and Bootstrap. Proudly made by an 18 year old college student :) </p>
              </div>
              <div class="bottomEmptyThirds" id = "bottomEmptyThirds">
              </div>
            </div>
            <div class="bottomBottomView" id = "bottomBottomView">
              <a class="plugButton" href="https://github.com/eashanpatel" target="_blank"> <img alt = "Can't display image" class="imageBorder2 githubBorder" src="https://seeklogo.com/images/G/github-logo-2E3852456C-seeklogo.com.png"/></a>
              <a class="plugButton" href="http://www.linkedin.com/in/eashanpatel" target="_blank"> <img alt = "Can't display image" class="imageBorder2" src="data:image/png;base64,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"/></a>
              <div class="plugButtonOval"> <img alt = "Can't display image" class="imageBorder2 emailBorder" src="https://cdn.icon-icons.com/icons2/652/PNG/512/gmail_icon-icons.com_59877.png"/> <p class="plugText"> eashanpatel@gmail.com </p> </div>
            </div>
          </div>
        </div> 
        
        
        : 
        

        <div class="secondPageStyle">
          <div class="headerView2">
            <div class="headerLeftThirds">
              <h1 class='headerTextPage2'> Wrapped Anytime </h1>
            </div>
            <div class="headerMiddleThirds">       
              <Nav.Link className="navbarText" href="/artistsmonth"> Artists - Month</Nav.Link>
              <Nav.Link className="navbarText" href="/artistssixmonth"> Artists - 6 Month </Nav.Link>
              <Nav.Link className="navbarText" href="/artistslifetime"> Artists - Lifetime </Nav.Link>  
              <Nav.Link className="navbarText" href="/songsmonth"> Songs - Month </Nav.Link>
              <Nav.Link className="navbarText" href="/songssixmonth"> Songs - 6 Month </Nav.Link>
              <Nav.Link className="navbarText" href="/songslifetime"> Songs - Lifetime </Nav.Link>                                       
            </div>
            <div class="headerRightThirds">
              <button class="logoutButton" onClick={() => logout()}> Logout </button>
            </div>
          </div>


          <div class="artistSongViews">
              <Routes>
                <Route path="/artistsmonth" element={<ArtistsPageMonth token={token} />} />
                <Route path="/artistssixmonth" element={<ArtistsPageSix token={token} />} />
                <Route path="/artistslifetime" element={<ArtistsPageLifetime token={token} />} />
                <Route path="/songsmonth" element={<SongsPageMonth token={token} />} />
                <Route path="/songssixmonth" element={<SongsPageSix token={token} />} />
                <Route path="/songslifetime" element={<SongsPageLifetime token={token} />} />
              </Routes>
          </div>
        </div>}
      </body>
    </html> 
  );
}

export default App;

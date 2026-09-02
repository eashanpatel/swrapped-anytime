import axios from 'axios';
import './ArtistCard.css';
import { useEffect, useState, useMemo } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Card from 'react-bootstrap/Card';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {Route, Routes} from "react-router-dom";

const ArtistCard = ({obj, id}) => {

    return (
      <a class = "cardStyle" href={obj.external_urls.spotify} target="_blank">   
        <div class="cardTopStyle">
          <img class="imageBorderArtist" src={obj.images[1].url}></img>
        </div>
        <div class="cardBottomStyle">
          <p class="cardTextTop"> {id + 1} - {obj.name} </p>
        </div> 
      </a>
    )
  }
  
  export default ArtistCard;
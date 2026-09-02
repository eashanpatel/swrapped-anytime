import './ArtistCard.css';
import { useEffect, useState, useMemo } from 'react';

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
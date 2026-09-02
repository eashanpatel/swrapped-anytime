import './SongsCard.css';
import { useEffect, useState, useMemo } from 'react';



const SongsCard = ({obj, index}) => {

    const [trackInfo, setTrackInfo] = useState([]);
    const [imageUrl, setImageUrl] = useState("");

    // const fetchCoverArt = async () => {
    //     const result = await fetch(`https://api.spotify.com/v1/tracks/${obj.id}`, {
    //         headers: {
    //             'Authorization': 'Bearer ' + token 
    //         }
    //     });

    //     const objArray = await result.json();
    //     setTrackInfo(objArray);
    //     console.log("TRACK INFO")
    //     console.log(trackInfo)  
    // }

    // useEffect(() => {
    //     fetchCoverArt();
    // }, [])

    // useMemo(() => {
    //   setImageUrl(trackInfo.album.images[1].url);
    // }, [trackInfo]);
    

    // useMemo(() => {
    //   if (trackInfo.length > 1){
    //     setImageUrl(trackInfo.album.images[1].url);
    //     console.log(trackInfo.album.images[1].url);
    //   }
    // }, [trackInfo])

    // console.log(obj)
    // console.log(index)
    // console.log(imgurl)

    return (
      <a class = "cardStyle" href={obj.external_urls.spotify} target="_blank">   
        <div class="cardTopStyle">
        <img class="imageBorderArtist" src={obj.album.images[1].url}></img>
        </div>
        <div class="cardBottomStyle">
        <p class="cardTextTop"> {index + 1} - {obj.name} </p>
          <p class="cardText"> {obj.artists[0].name} </p>
        </div> 
      </a>
    )
  }
  
  export default SongsCard;
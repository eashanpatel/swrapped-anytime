import axios from 'axios';
import './ArtistsPageStyle.css';
import { useEffect, useState, useMemo } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Card from 'react-bootstrap/Card';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {Route, Routes} from "react-router-dom";
import ArtistCard from './ArtistCard';

function ArtistsPageMonth({token}){

    const [artists, setArtists] = useState([]);
    const [imageUrl, setImageUrl] = useState("");
    const [artistCards, setArtistCards] = useState([]);

    const fetchArtists = async () => {
        const result = await fetch('https://api.spotify.com/v1/me/top/artists?time_range=short_term', {
            headers: {
                'Authorization': 'Bearer ' + token 
            }
        });

        const objArray = await result.json();
        setArtists(objArray.items);
        //console.log(objArray)    
    }

    const convertToCards = () => {
        var addedList = [];
        artists.forEach((element, index, array) => {
        addedList.push(
            <ArtistCard obj={element} id={index}/>
        );
        });

        setArtistCards(addedList);
        //console.log("CONVERT CARDS REACHED")
      };

    useEffect(() => {
        fetchArtists(); 
    }, [])

    useMemo(() => {
        convertToCards();
    }, [artists])


    return(
        <div class="mainViewArtists">
            <div class="headerViewArtists">
                <h1 class="headerTextArtists"> Your Top Artists - 1 Month </h1>
            </div>
            <div class="bodyViewArtists">
                {artistCards[0]}{artistCards[1]}{artistCards[2]}{artistCards[3]}{artistCards[4]}{artistCards[5]}{artistCards[6]}{artistCards[7]}{artistCards[8]}{artistCards[9]}{artistCards[10]}{artistCards[11]}{artistCards[12]}{artistCards[13]}{artistCards[14]}{artistCards[15]}{artistCards[16]}{artistCards[17]}{artistCards[18]}{artistCards[19]}    
            </div>
        </div>
    )    
}

export default ArtistsPageMonth;
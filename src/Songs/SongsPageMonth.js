import axios from 'axios';
import './SongsPageStyle.css';
import { useEffect, useState, useMemo } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Card from 'react-bootstrap/Card';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {Route, Routes} from "react-router-dom";
import SongsCard from './SongsCard';

function SongsPageMonth({token}){

    const [songs, setSongs] = useState([]);
    const [imageUrl, setImageUrl] = useState("");
    const [songsCards, setSongsCards] = useState([]);

    const fetchSongs = async () => {
        const result = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term', {
            headers: {
                'Authorization': 'Bearer ' + token 
            }
        });

        const objArray = await result.json();
        setSongs(objArray.items);
        //console.log(objArray)    
    }

    const convertToCards = () => {
        var addedList = [];
        songs.forEach((element, index, array) => {
        addedList.push(
            <SongsCard obj={element} index={index} token = {token}/>
        );
        });

        setSongsCards(addedList);
      };

    useEffect(() => {
        fetchSongs(); 
    }, [])

    useMemo(() => {
        convertToCards();
    }, [songs])


    return(
        <div class="mainViewArtists">
            <div class="headerViewArtists">
                <h1 class="headerTextArtists"> Your Top Songs - 1 Month </h1>
            </div>
            <div class="bodyViewArtists">
                {songsCards[0]}{songsCards[1]}{songsCards[2]}{songsCards[3]}{songsCards[4]}{songsCards[5]}{songsCards[6]}{songsCards[7]}{songsCards[8]}{songsCards[9]}{songsCards[10]}{songsCards[11]}{songsCards[12]}{songsCards[13]}{songsCards[14]}{songsCards[15]}{songsCards[16]}{songsCards[17]}{songsCards[18]}{songsCards[19]}    
            </div>
        </div>
    )    
}

export default SongsPageMonth;
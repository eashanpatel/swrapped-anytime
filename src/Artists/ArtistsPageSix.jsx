import './ArtistsPageStyle.css';
import { useEffect, useState } from 'react';
import { getTopItems } from '../api/spotify';
import ArtistCard from './ArtistCard';

function ArtistsPageSix(){

    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        getTopItems('artists', 'medium_term')
            .then(items => { if (!cancelled) setArtists(items); })
            .catch(err => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [])

    return(
        <div className="mainViewArtists">
            <div className="headerViewArtists">
                <h1 className="headerTextArtists"> Your Top Artists - 6 Months </h1>
            </div>
            <div className="bodyViewArtists">
                {loading && <p className="text"> Loading your top artists… </p>}
                {error && <p className="text"> {error} </p>}
                {!loading && !error && artists.length === 0 &&
                    <p className="text"> Spotify has no listening history for this period yet. </p>}
                {artists.map((artist, index) =>
                    <ArtistCard key={artist.id} obj={artist} id={index} />)}
            </div>
        </div>
    )
}

export default ArtistsPageSix;

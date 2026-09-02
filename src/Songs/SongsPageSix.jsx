import './SongsPageStyle.css';
import { useEffect, useState } from 'react';
import { getTopItems } from '../api/spotify';
import SongsCard from './SongsCard';

function SongsPageSix(){

    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        getTopItems('tracks', 'medium_term')
            .then(items => { if (!cancelled) setSongs(items); })
            .catch(err => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [])

    return(
        <div className="mainViewSongs">
            <div className="headerViewSongs">
                <h1 className="headerTextSongs"> Your Top Songs - 6 Months </h1>
            </div>
            <div className="bodyViewSongs">
                {loading && <p className="text"> Loading your top songs… </p>}
                {error && <p className="text"> {error} </p>}
                {!loading && !error && songs.length === 0 &&
                    <p className="text"> Spotify has no listening history for this period yet. </p>}
                {songs.map((song, index) =>
                    <SongsCard key={song.id} obj={song} index={index} />)}
            </div>
        </div>
    )
}

export default SongsPageSix;

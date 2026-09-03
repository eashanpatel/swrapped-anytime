import { useCallback, useEffect, useState } from 'react';
import { getTopItems } from '../api/spotify';
import TopItemsGrid from '../ui/TopItemsGrid';
import SongsCard from './SongsCard';

function SongsPageLifetime(){

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        getTopItems('tracks', 'long_term')
            .then(data => { if (!cancelled) setItems(data); })
            .catch(err => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [])

    useEffect(load, [load])

    return(
        <div className="page">
            <header className="page__head">
                <h1 className="page__title">Top Songs</h1>
                <p className="page__subtitle">The tracks that have stayed with you the longest.</p>
            </header>

            <TopItemsGrid
                loading={loading}
                error={error}
                isEmpty={items.length === 0}
                emptyLabel="Spotify has not built up a long-term picture of your listening yet."
                onRetry={load}
            >
                {items.map((item, index) =>
                    <SongsCard key={item.id} obj={item} index={index} />)}
            </TopItemsGrid>
        </div>
    )
}

export default SongsPageLifetime;

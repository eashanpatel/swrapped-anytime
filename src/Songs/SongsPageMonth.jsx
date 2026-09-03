import { useCallback, useEffect, useState } from 'react';
import { getTopItems } from '../api/spotify';
import TopItemsGrid from '../ui/TopItemsGrid';
import SongsCard from './SongsCard';

function SongsPageMonth(){

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        getTopItems('tracks', 'short_term')
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
                <p className="page__subtitle">The tracks you reached for most over the last four weeks.</p>
            </header>

            <TopItemsGrid
                loading={loading}
                error={error}
                isEmpty={items.length === 0}
                emptyLabel="Spotify has not logged enough listening in the last four weeks yet. Give it a few more sessions."
                onRetry={load}
            >
                {items.map((item, index) =>
                    <SongsCard key={item.id} obj={item} index={index} />)}
            </TopItemsGrid>
        </div>
    )
}

export default SongsPageMonth;

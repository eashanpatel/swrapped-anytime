import { useCallback, useEffect, useState } from 'react';
import { getTopItems } from '../api/spotify';
import TopItemsGrid from '../ui/TopItemsGrid';
import ArtistCard from './ArtistCard';

function ArtistsPageSix(){

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        getTopItems('artists', 'medium_term')
            .then(data => { if (!cancelled) setItems(data); })
            .catch(err => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [])

    useEffect(load, [load])

    return(
        <div className="page">
            <header className="page__head">
                <h1 className="page__title">Top Artists</h1>
                <p className="page__subtitle">Your most-played artists across roughly the last six months.</p>
            </header>

            <TopItemsGrid
                loading={loading}
                error={error}
                isEmpty={items.length === 0}
                emptyLabel="There is not enough listening history in this window yet."
                onRetry={load}
            >
                {items.map((item, index) =>
                    <ArtistCard key={item.id} obj={item} id={index} />)}
            </TopItemsGrid>
        </div>
    )
}

export default ArtistsPageSix;

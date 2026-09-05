import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeLogin } from './pkce';

function Callback({ onAuthed, onError }) {

    const navigate = useNavigate();
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        completeLogin()
            .then(tokens => {
                if (!tokens) { navigate('/', { replace: true }); return; }
                onAuthed();
                navigate('/artistsmonth', { replace: true });
            })
            .catch(err => {
                onError(err.message);
                navigate('/', { replace: true });
            });
    }, [])

    return (
        <main className="callback">
            <div className="spinner" role="status" aria-label="Signing you in" />
            <h1 className="callback__title">Signing you in…</h1>
            <p className="callback__body">Swapping your authorization code for a token.</p>
        </main>
    )
}

export default Callback;

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeLogin } from './pkce';

function Callback({ onAuthed, onError }) {

    const navigate = useNavigate();
    const started = useRef(false);

    useEffect(() => {
        // An authorization code is single-use, and StrictMode invokes effects
        // twice in dev — without this guard the second exchange always fails.
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
        <div className="secondPageStyle">
            <div className="headerView2">
                <h1 className="headerTextPage2"> Signing you in… </h1>
            </div>
        </div>
    )
}

export default Callback;

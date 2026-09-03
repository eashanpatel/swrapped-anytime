const PLACEHOLDER = '/placeholder-art.svg';

const SongsCard = ({obj, index}) => {

    // Spotify does not guarantee two images; fall back rather than throw.
    const img = obj.album?.images?.[1]?.url ?? obj.album?.images?.[0]?.url ?? PLACEHOLDER;
    const artists = obj.artists?.map(a => a.name).join(', ');

    return (
      <a
        className="card stagger"
        style={{ '--i': index }}
        href={obj.external_urls?.spotify}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="card__art">
          {/* Decorative: the track and artist names are right below as real text. */}
          <img src={img} alt="" loading="lazy" />
          <span className="card__rank">{index + 1}</span>
        </div>
        <div className="card__body">
          <span className="card__name">{obj.name}</span>
          {artists && <span className="card__meta">{artists}</span>}
        </div>
      </a>
    )
  }

  export default SongsCard;

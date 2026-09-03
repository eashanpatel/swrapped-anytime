const PLACEHOLDER = '/placeholder-art.svg';

const ArtistCard = ({obj, id}) => {

    // Spotify does not guarantee two images; fall back rather than throw.
    const img = obj.images?.[1]?.url ?? obj.images?.[0]?.url ?? PLACEHOLDER;
    const genre = obj.genres?.[0];

    return (
      <a
        className="card stagger"
        style={{ '--i': id }}
        href={obj.external_urls?.spotify}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="card__art">
          {/* Decorative: the artist name is right below as real text. */}
          <img src={img} alt="" loading="lazy" />
          <span className="card__rank">{id + 1}</span>
        </div>
        <div className="card__body">
          <span className="card__name">{obj.name}</span>
          {genre && <span className="card__meta">{genre}</span>}
        </div>
      </a>
    )
  }

  export default ArtistCard;

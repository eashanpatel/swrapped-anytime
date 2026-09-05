const PLACEHOLDER = '/placeholder-art.svg';

const ArtistCard = ({obj, id}) => {

    const img = obj.images?.[1]?.url ?? obj.images?.[0]?.url ?? PLACEHOLDER;

    return (
      <a
        className="card stagger"
        style={{ '--i': id }}
        href={obj.external_urls?.spotify}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="card__art">
          <img src={img} alt="" loading="lazy" />
          <span className="card__rank">{id + 1}</span>
        </div>
        <div className="card__body">
          <span className="card__name">{obj.name}</span>
        </div>
      </a>
    )
  }

  export default ArtistCard;

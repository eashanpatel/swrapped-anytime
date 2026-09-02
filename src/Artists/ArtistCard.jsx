import './ArtistCard.css';

const PLACEHOLDER = '/placeholder-art.svg';

const ArtistCard = ({obj, id}) => {

    // Spotify does not guarantee two images; fall back rather than throw.
    const img = obj.images?.[1]?.url ?? obj.images?.[0]?.url ?? PLACEHOLDER;

    return (
      <a className="cardStyle" href={obj.external_urls?.spotify} target="_blank" rel="noopener noreferrer">
        <div className="cardTopStyle">
          <img className="imageBorderArtist" src={img} alt={obj.name} />
        </div>
        <div className="cardBottomStyle">
          <p className="cardTextTop"> {id + 1} - {obj.name} </p>
        </div>
      </a>
    )
  }

  export default ArtistCard;

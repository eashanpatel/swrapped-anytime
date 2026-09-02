import './SongsCard.css';

const PLACEHOLDER = '/placeholder-art.svg';

const SongsCard = ({obj, index}) => {

    // Spotify does not guarantee two images; fall back rather than throw.
    const img = obj.album?.images?.[1]?.url ?? obj.album?.images?.[0]?.url ?? PLACEHOLDER;

    return (
      <a className="cardStyle" href={obj.external_urls?.spotify} target="_blank" rel="noopener noreferrer">
        <div className="cardTopStyle">
          <img className="imageBorderArtist" src={img} alt={obj.name} />
        </div>
        <div className="cardBottomStyle">
          <p className="cardTextTop"> {index + 1} - {obj.name} </p>
          <p className="cardText"> {obj.artists?.[0]?.name} </p>
        </div>
      </a>
    )
  }

  export default SongsCard;

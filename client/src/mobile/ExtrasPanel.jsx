import SpotifyComponent from "./SpotifyComponent";
import SocialsComponent from "./SocialsComponent";
import MALComponent from "./MALComponent";
import TMDBComponent from "./TMDBComponent";

const ExtrasPanel = () => {
  return (
    <div className="w-full flex flex-col">
      <div className="h-px w-full bg-gray-400" />
      <SpotifyComponent />
      <div className="h-px w-full bg-gray-400" />
      <TMDBComponent />
      <div className="h-px w-full bg-gray-400" />
      <MALComponent />
      <div className="h-px w-full bg-gray-400" />
      <SocialsComponent />
      <div className="h-px w-full bg-gray-400" />
      <video
        className="w-full max-h-[70vh] object-cover object-bottom"
        autoPlay
        muted
        loop
        playsInline
        poster="/assets/photos/mountain-view-thumbnail.avif"
      >
        <source src="/assets/photos/mountain-view.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default ExtrasPanel;

import SpotifyPanel from "../components/SpotifyComponent.jsx";
import SocialsPanel from "../components/SocialsComponent.jsx";
import MALComponent from "../components/MALComponent.jsx";
import TMDBComponent from "../components/TMDBComponent.jsx";

const ExtrasPanel = () => {
  return (
    <div className="shrink-0 h-screen flex mr-40">
      <div className="h-screen w-px min-w-px bg-gray-400" />
      <div className="relative flex flex-col items-right h-screen w-fit min-h-fit min-w-fit">
        <div className="flex items-center min-w-fit min-h-fit">
          <SpotifyPanel />
          <div className="h-full w-px min-w-px bg-gray-400" />
          <SocialsPanel />
        </div>
        <div className="h-px w-full min-w-full bg-gray-400" />
        <div className="flex flex-1 items-center min-w-fit min-h-fit">
          <MALComponent />
          <div className="h-full w-px min-w-px bg-gray-400" />
          <TMDBComponent />
        </div>
      </div>
      <div className="h-screen w-px min-w-px bg-gray-400" />
      <video
        className="h-full object-contain aspect-9/16"
        autoPlay
        muted
        loop
        playsInline
        poster="/assets/photos/mountain-view-thumbnail.png"
      >
        <source src="/assets/photos/mountain-view.mp4" type="video/mp4" />
      </video>
      <div className="h-screen w-px min-w-px bg-gray-400" />
    </div>
  );
};

export default ExtrasPanel;

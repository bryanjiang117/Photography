import SpotifyPanel from "./SpotifyComponent.jsx";
import MALPanel from "./MALComponent.jsx";
import SocialsPanel from "./SocialsComponent.jsx";
import ShowsPanel from "./ShowsComponent.jsx";

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
          <MALPanel />
          <div className="h-full w-px min-w-px bg-gray-400" />
          <ShowsPanel />
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

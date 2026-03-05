import SpotifyPanel from "./SpotifyComponent.jsx";
import MALPanel from "./MALComponent.jsx";
import SocialsPanel from "./SocialsComponent.jsx";
import ShowsPanel from "./ShowsComponent.jsx";

const ExtrasPanel = () => {
  return (
    <div className="panel flex flex-end mr-40 min-w-fit w-fit">
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
      <video className="h-full" autoPlay muted loop>
        <source src="/assets/photos/mountain-view.MOV" />
      </video>
      <div className="h-screen w-px min-w-px bg-gray-400" />
    </div>
  );
};

export default ExtrasPanel;

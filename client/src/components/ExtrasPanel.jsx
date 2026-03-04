import SpotifyPanel from "./SpotifyPanel.jsx";
import MALPanel from "./MALPanel.jsx";
import SocialsPanel from "./SocialsPanel.jsx";
import ShowsPanel from "./ShowsPanel.jsx";

const ExtrasPanel = () => {
  return (
    <div className="flex flex-end min-w-fit">
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
    </div>
  );
};

export default ExtrasPanel;

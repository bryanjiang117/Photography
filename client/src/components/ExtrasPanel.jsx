import SpotifyPanel from "./SpotifyPanel.jsx";
import MALPanel from "./MALPanel.jsx";
import SocialsPanel from "./SocialsPanel.jsx";
import ShowsPanel from "./ShowsPanel.jsx";

const ExtrasPanel = () => {
  return (
    <div className="flex flex-end">
      <div className="relative flex flex-col items-right h-screen w-[calc(100vw-10rem)]">
        <div className="flex justify-end items-center p-15">
          <SpotifyPanel />
          <div className="mx-15 ml-23 h-[calc(100%+120px)] w-px bg-gray-400" />
          <SocialsPanel />
        </div>
        <div className="h-px w-[calc(100vw-10rem)] bg-gray-400" />
        <div className="flex flex-1 justify-end items-center p-15">
          <MALPanel />
          <div className="mx-15 ml-23 h-[calc(100%+120px)] w-px bg-gray-400" />
            <ShowsPanel />
        </div>
      </div>
      <div className="pr-10rem h-screen w-px bg-gray-400"></div>
    </div>
  );
};

export default ExtrasPanel;

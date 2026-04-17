import IntroPanel from "./IntroPanel";
import JapanPanel from "./JapanPanel";
import MexicoCityPanel from "./MexicoCityPanel";
import CanadaPanel from "./CanadaPanel";
import ProjectsPanel from "./ProjectsPanel";
import ExtrasPanel from "./ExtrasPanel";

const MobileHome = () => {
  return (
    <div className="flex w-screen flex-col overflow-x-hidden">
      <IntroPanel />
      <div className="flex flex-col gap-4">
        <JapanPanel />
        <MexicoCityPanel />
        <CanadaPanel />
      </div>
      <div className="mt-36">
        <ProjectsPanel />
      </div>
      <div className="mt-50">
        <ExtrasPanel />
      </div>
    </div>
  );
};

export default MobileHome;

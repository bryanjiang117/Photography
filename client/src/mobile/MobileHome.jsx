import { lazy, Suspense } from "react";
import IntroPanel from "./IntroPanel";
import JapanPanel from "./JapanPanel";
import MexicoCityPanel from "./MexicoCityPanel";
import CanadaPanel from "./CanadaPanel";
import ChinaPanel from "./ChinaPanel";
import ProjectsPanel from "./ProjectsPanel";

const ExtrasPanel = lazy(() => import("./ExtrasPanel"));

const MobileHome = () => {
  return (
    <div className="flex w-screen flex-col overflow-x-hidden">
      <IntroPanel />
      <div className="flex flex-col gap-8">
        <ChinaPanel />
        <JapanPanel />
        <MexicoCityPanel />
        <CanadaPanel />
      </div>
      <div className="mt-38">
        <ProjectsPanel />
      </div>
      <div className="mt-50">
        <Suspense fallback={null}>
          <ExtrasPanel />
        </Suspense>
      </div>
    </div>
  );
};

export default MobileHome;

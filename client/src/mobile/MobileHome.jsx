import { lazy, Suspense, useContext } from "react";
import { GalleryContext } from "../GalleryContext";
import IntroPanel from "./IntroPanel";

const JapanPanel = lazy(() => import("./JapanPanel"));
const MexicoCityPanel = lazy(() => import("./MexicoCityPanel"));
const CanadaPanel = lazy(() => import("./CanadaPanel"));
const ChinaPanel = lazy(() => import("./ChinaPanel"));
const ProjectsPanel = lazy(() => import("./ProjectsPanel"));
const ExtrasPanel = lazy(() => import("./ExtrasPanel"));

const MobileHome = () => {
  const { introReady } = useContext(GalleryContext);

  return (
    <div className="flex w-screen flex-col overflow-x-hidden">
      <IntroPanel />
      {introReady && (
        <>
          <div className="flex flex-col gap-8">
            <Suspense fallback={null}>
              <ChinaPanel />
            </Suspense>
            <Suspense fallback={null}>
              <JapanPanel />
            </Suspense>
            <Suspense fallback={null}>
              <MexicoCityPanel />
            </Suspense>
            <Suspense fallback={null}>
              <CanadaPanel />
            </Suspense>
          </div>
          <div className="mt-38">
            <Suspense fallback={null}>
              <ProjectsPanel />
            </Suspense>
          </div>
          <div className="mt-50">
            <Suspense fallback={null}>
              <ExtrasPanel />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileHome;

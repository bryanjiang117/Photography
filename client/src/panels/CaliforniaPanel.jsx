import { useContext } from "react";
import { GalleryContext } from "../GalleryContext";
import ViewGalleryButton from "../components/ViewGalleryButton";
import CaliforniaColorField from "../components/CaliforniaColorField";

const CaliforniaPanel = () => {
  const { showCaliforniaGallery, setShowCaliforniaGallery } =
    useContext(GalleryContext);

  return (
    <div className="relative shrink-0 h-screen min-h-[800px] w-[90vw] min-w-[1200px] p-4 px-40 pr-20">
      <div className="flex flex-col gap-4 h-full">
        <section>
          <div className="flex">
            <div className="title font-tsm" lang="zh-CN" translate="no">
              加州
            </div>
            <div className="mt-2 ml-2 flex-1 flex justify-between gap-6 leading-none">
              <div className="text-sm bodoni-small whitespace-nowrap">
                California
              </div>
              <div className="text-sm ml-4 whitespace-nowrap">
                <span className="subtitle font-sh" lang="zh-CN" translate="no">
                  摄影
                </span>
                <span translate="no">&nbsp; ‧ &nbsp;</span>
                <span className="bodoni-small">Photography</span>
              </div>
              <div className="flex flex-col">
                <ViewGalleryButton
                  onClick={() => setShowCaliforniaGallery(true)}
                />
              </div>
            </div>
          </div>
        </section>
        <CaliforniaColorField
          className="flex-1 w-full cursor-pointer"
          hidden={showCaliforniaGallery}
          onClick={() => setShowCaliforniaGallery(true)}
        />
      </div>
    </div>
  );
};

export default CaliforniaPanel;

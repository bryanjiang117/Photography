import "./SidebarButton.scss";
import { Icon } from "@iconify-icon/react";
import { useState } from "react";

const SidebarButton = ({ onSidebarToggle, isSidebarOpen }) => {
  const [firstRender, setFirstRender] = useState(true);

  const toggleSidebar = () => {
    onSidebarToggle();
    setFirstRender(false);
  };

  return (
    <button className="menu-btn" onClick={toggleSidebar}>
      {isSidebarOpen ? (
        <Icon icon="line-md:menu-to-close-transition" width="24" height="24" />
      ) : firstRender ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5L12 5L19 5M5 12H19M5 19L12 19L19 19"
          />
        </svg>
      ) : (
        <Icon icon="line-md:close-to-menu-transition" width="24" height="24" />
      )}
    </button>
  );
};

export default SidebarButton;

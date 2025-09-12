import { Link } from "react-router-dom";
import "./Sidebar.scss";

const Sidebar = ({ isOpen, onToggle }) => {
  const menuItems = [
    { id: 1, label: "Home", path: "/"},
    { id: 2, label: "Sky and Sea", path: "/sky-and-sea"},
    { id: 3, label: "Toronto Summer", path: "/toronto-summer"},
    { id: 4, label: "Road Trip", path: "/road-trip"},
    { id: 5, label: "Nichijou", path: "/nichijou"},
  ];

  return (
    <>
      {/* Overlay when sidebar is open */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link to={item.path} className="nav-link" onClick={onToggle}>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

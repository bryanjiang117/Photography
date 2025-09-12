import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import SidebarButton from "./components/SidebarButton";
import HomePage from "./pages/HomePage";
import SkyAndSea from "./pages/SkyAndSea";
import TorontoSummer from "./pages/TorontoSummer";
import RoadTrip from "./pages/RoadTrip";
import Nichijou from "./pages/Nichijou";
import "./App.scss";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleMenu = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="App">
        <Header onSidebarToggle={toggleMenu} isSidebarOpen={isSidebarOpen} />
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleMenu} />
        <SidebarButton
          onSidebarToggle={toggleMenu}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sky-and-sea" element={<SkyAndSea />} />
            <Route path="/toronto-summer" element={<TorontoSummer />} />
            <Route path="/road-trip" element={<RoadTrip />} />
            <Route path="/nichijou" element={<Nichijou />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  FaChartLine,
  FaFlask,
  FaShieldAlt,
} from "react-icons/fa";

import Dashboard from "./pages/Dashboard";
import RedTeamPage from "./pages/RedTeamPage";
import BlockScreen from "./components/BlockScreen/BlockScreen";

import "./styles/AppNavigation.css";

function App() {
  const [view, setView] = useState("dashboard");

  const renderCurrentView = () => {
    if (view === "red-team") {
      return <RedTeamPage />;
    }

    if (view === "blocked") {
      return (
        <BlockScreen
          onBack={() => setView("dashboard")}
        />
      );
    }

    return <Dashboard />;
  };

  return (
    <>
      {renderCurrentView()}

      <nav
        className="app-navigation"
        aria-label="Demo navigation"
      >
        <button
          type="button"
          className={`app-navigation-button ${
            view === "dashboard" ? "active" : ""
          }`}
          onClick={() => setView("dashboard")}
          aria-pressed={view === "dashboard"}
        >
          <FaChartLine />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={`app-navigation-button ${
            view === "red-team" ? "active" : ""
          }`}
          onClick={() => setView("red-team")}
          aria-pressed={view === "red-team"}
        >
          <FaFlask />
          <span>Red Team Simulator</span>
        </button>

        <button
          type="button"
          className={`app-navigation-button ${
            view === "blocked" ? "active" : ""
          }`}
          onClick={() => setView("blocked")}
          aria-pressed={view === "blocked"}
        >
          <FaShieldAlt />
          <span>Block Screen</span>
        </button>
      </nav>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;
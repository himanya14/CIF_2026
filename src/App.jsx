import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  FaChartLine,
  FaComments,
  FaFlask,
  FaShieldAlt,
} from "react-icons/fa";

import Dashboard from "./pages/Dashboard";
import RedTeamPage from "./pages/RedTeamPage";
import BlockScreen from "./components/BlockScreen/BlockScreen";
import EmployeeChat from "./components/EmployeeChat/EmployeeChat";

import "./styles/AppNavigation.css";

function App() {
  const [view, setView] = useState("dashboard");
  const [selectedBlockId, setSelectedBlockId] =
    useState(null);

  const openBlockScreen = (scenarioId = null) => {
    setSelectedBlockId(scenarioId);
    setView("blocked");
  };

  const openEmployeeChat = () => {
    setView("employee-chat");
  };

  const openDashboard = () => {
    setView("dashboard");
  };

  const openRedTeamSimulator = () => {
    setView("red-team");
  };

  const renderCurrentView = () => {
    if (view === "employee-chat") {
      return (
        <EmployeeChat
          onOpenBlockScreen={openBlockScreen}
          onBack={openDashboard}
        />
      );
    }

    if (view === "blocked") {
      return (
        <BlockScreen
          selectedScenarioId={selectedBlockId}
          onBack={openEmployeeChat}
        />
      );
    }

    if (view === "red-team") {
      return <RedTeamPage />;
    }

    return <Dashboard />;
  };

  return (
    <>
      {renderCurrentView()}

      <nav
        className="app-navigation"
        aria-label="Application navigation"
      >
        <button
          type="button"
          className={`app-navigation-button ${
            view === "employee-chat" ? "active" : ""
          }`}
          onClick={openEmployeeChat}
          aria-pressed={view === "employee-chat"}
        >
          <FaComments />
          <span>Employee Chat</span>
        </button>

        <button
          type="button"
          className={`app-navigation-button ${
            view === "dashboard" ? "active" : ""
          }`}
          onClick={openDashboard}
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
          onClick={openRedTeamSimulator}
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
          onClick={() => openBlockScreen()}
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
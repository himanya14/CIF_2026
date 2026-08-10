import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import BlockScreen from "./components/BlockScreen/BlockScreen";
import EmployeeChat from "./components/EmployeeChat/EmployeeChat";

function App() {
  const [view, setView] = useState("dashboard");
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  const openEmployeeChat = () => {
    setView("employee-chat");
  };

  const openBlockScreen = (scenarioId = null) => {
    setSelectedBlockId(scenarioId);
    setView("blocked");
  };

  const goToDashboard = () => {
    setView("dashboard");
  };

  const goToEmployeeChat = () => {
    setView("employee-chat");
  };

  // BLOCK SCREEN
  if (view === "blocked") {
    return (
      <BlockScreen
        onBack={goToEmployeeChat}
        selectedScenarioId={selectedBlockId}
      />
    );
  }

  // EMPLOYEE CHAT
  if (view === "employee-chat") {
    return (
      <EmployeeChat
        onOpenBlockScreen={openBlockScreen}
        onBack={goToDashboard}
      />
    );
  }

  // DASHBOARD
  return (
    <div>
      <button
        onClick={openEmployeeChat}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 999,
          background: "#14e6ff",
          color: "#06111f",
          border: "none",
          padding: "12px 20px",
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(20,230,255,.25)",
        }}
      >
        Employee AI Assistant →
      </button>

      <Dashboard />
    </div>
  );
}

export default App;
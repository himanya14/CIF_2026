import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import EmployeeChat from "./pages/EmployeeChat";
import BlockScreen from "./components/BlockScreen/BlockScreen";

function App() {
  const [view, setView] = useState("dashboard");

  // Show Block Screen
  if (view === "blocked") {
    return <BlockScreen onBack={() => setView("dashboard")} />;
  }

  // Show Employee Chat
  if (view === "chat") {
    return (
      <div>
        <button
          onClick={() => setView("dashboard")}
          style={{
            position: "fixed",
            top: 24,
            left: 24,
            zIndex: 999,
            background: "#1677ff",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(22,119,255,.35)",
          }}
        >
          ← Dashboard
        </button>

        <EmployeeChat />
      </div>
    );
  }

  // Show Dashboard
  return (
    <div>
      {/* Open Block Screen */}
      <button
        onClick={() => setView("blocked")}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 999,
          background: "#ff4d4f",
          color: "white",
          border: "none",
          padding: "12px 20px",
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(255,77,79,.35)",
        }}
      >
        View Block Screen →
      </button>

      {/* Open Employee Chat */}
      <button
        onClick={() => setView("chat")}
        style={{
          position: "fixed",
          bottom: 24,
          left: 24,
          zIndex: 999,
          background: "#1677ff",
          color: "white",
          border: "none",
          padding: "12px 20px",
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(22,119,255,.35)",
        }}
      >
        Employee Chat →
      </button>

      <Dashboard />
    </div>
  );
}

export default App;
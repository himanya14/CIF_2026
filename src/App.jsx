import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import BlockScreen from "./components/BlockScreen/BlockScreen";

function App() {
  const [view, setView] = useState("dashboard");

  if (view === "blocked") {
    return <BlockScreen onBack={() => setView("dashboard")} />;
  }

  return (
    <div>
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
      <Dashboard />
    </div>
  );
}

export default App;

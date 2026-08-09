import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Dashboard from "./pages/Dashboard";
import RedTeamPage from "./pages/RedTeamPage";
import BlockScreen from "./components/BlockScreen/BlockScreen";

function App() {
  const [view, setView] = useState("dashboard");

  if (view === "blocked") {
    return (
      <>
        <BlockScreen onBack={() => setView("dashboard")} />
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </>
    );
  }

  return (
    <>
      {view === "red-team" ? <RedTeamPage /> : <Dashboard />}

      <div
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 999,
          display: "flex",
          gap: 10,
        }}
      >
        {view !== "dashboard" && (
          <button onClick={() => setView("dashboard")}>
            Dashboard
          </button>
        )}

        {view !== "red-team" && (
          <button onClick={() => setView("red-team")}>
            Red Team Simulator
          </button>
        )}

        {view !== "blocked" && (
          <button onClick={() => setView("blocked")}>
            Block Screen
          </button>
        )}
      </div>

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
import {
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
/*import Dashboard from "./pages/Dashboard";

function App() {
  return <Dashboard />;
}

export default App;*/

import RedTeamPage from "./pages/RedTeamPage";

function App() {
  return (
    <>
      <RedTeamPage />

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

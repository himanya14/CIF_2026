import "../styles/Navbar.css";

import {
  FaShieldAlt,
  FaBell,
  FaUserCircle,
  FaCircle,
  FaDownload,
} from "react-icons/fa";

import { useEffect, useRef, useState } from "react";

import NotificationPanel from "./NotificationPanel";
import { generateReport } from "../utils/generateReport";
import { toast } from "react-toastify";

function Navbar() {

  const [now, setNow] = useState(new Date());

  const [showNotifications, setShowNotifications] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const notificationRef = useRef(null);

  /* ==========================
     LIVE CLOCK
  ========================== */

  useEffect(() => {

    const timer = setInterval(() => {

      setNow(new Date());

    }, 1000);

    return () => clearInterval(timer);

  }, []);

  /* ==========================
     CLOSE ON CLICK OUTSIDE
  ========================== */

  useEffect(() => {

    function handleClickOutside(e) {

      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {

        setShowNotifications(false);

      }

    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  /* ==========================
     CLOSE ON SCROLL
  ========================== */

  useEffect(() => {

    function handleScroll() {

      setShowNotifications(false);

    }

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );

    };

  }, []);

  /* ==========================
     CLOSE ON ESC
  ========================== */

  useEffect(() => {

    function handleEscape(e) {

      if (e.key === "Escape") {

        setShowNotifications(false);

      }

    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleEscape
      );

    };

  }, []);

  const date = now.toLocaleDateString("en-GB", {

    day: "2-digit",
    month: "short",
    year: "numeric",

  });

  const time = now.toLocaleTimeString([], {

    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",

  });

  const handleGenerateReport = async () => {
    if (isGeneratingReport) return;
    setIsGeneratingReport(true);
    try {
      await generateReport();
      toast.success("Live security report downloaded.");
    } catch (error) {
      console.error("Report generation failed", error);
      toast.error(`Report generation failed: ${error.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (

    <>

      <header className="navbar">

        {/* LEFT */}

        <div className="logo-section">

          <div className="logo-circle">

            <FaShieldAlt />

          </div>

          <div>

            <h1>AI Watch Tower</h1>

            <p>Executive Security Dashboard</p>

          </div>

        </div>

        {/* RIGHT */}

        <div className="navbar-right">

          <button
            className="report-btn"
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
          >

            <FaDownload />

            {isGeneratingReport ? "Generating..." : "Download Report"}

          </button>

          <div className="live-status">

            <FaCircle />

            <span>LIVE</span>

          </div>

          <div className="datetime">

            <span>{date}</span>

            <strong>{time}</strong>

          </div>

          <div
            className="notification"
            onClick={() =>
              setShowNotifications(prev => !prev)
            }
          >

            <FaBell />

            <span className="badge">4</span>

          </div>

          <FaUserCircle className="user-avatar" />

        </div>

      </header>

      {showNotifications && (

        <div
          className="notification-overlay"
        >

          <div
            ref={notificationRef}
          >

            <NotificationPanel />

          </div>

        </div>

      )}

    </>

  );

}

export default Navbar;

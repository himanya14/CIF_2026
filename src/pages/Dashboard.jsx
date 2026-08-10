import "../styles/Dashboard.css";
import { useEffect, useState } from "react";
import { getDashboard } from "../services/api";

import Navbar from "../components/Navbar";

import KPICard from "../components/KPICard";
import ActivityChart from "../components/ActivityChart";
import ViolationChart from "../components/ViolationChart";
import ThreatMap from "../components/ThreatMap";
import DPDPCompliance from "../components/DPDPCompliance";
import AIInsights from "../components/AIInsights";
import DepartmentTable from "../components/DepartmentTable";
import Footer from "../components/Footer";

import {
  FaShieldAlt,
  FaBug,
  FaLock,
  FaUserShield,
  FaRupeeSign,
} from "react-icons/fa";

function Dashboard() {
  const [liveData, setLiveData] = useState({
    kpis: { scanned: 0, blocked: 0, sanitized: 0, securityScore: 100, riskPrevented: "₹0.0L" },
    activity: { "24H": [], "7D": [], "30D": [] }, categories: [], departments: [],
  });

  useEffect(() => {
    const loadDashboard = () => getDashboard().then(setLiveData).catch(error => console.warn("Dashboard API unavailable", error));
    loadDashboard();
    const timer = setInterval(loadDashboard, 3000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="dashboard">

      <Navbar />

      {/* Scanner */}

      <div className="scanner">

        <span>SYSTEM SCANNING...</span>

        <div className="scan-line">
          <div className="scan-dot"></div>
        </div>

      </div>

      {/* KPI Cards */}

      <div className="kpi-grid">

        <KPICard
          title="Prompts Scanned"
          value={liveData.kpis.scanned}
          trend="Live"
          icon={<FaUserShield />}
          color="#3ea6ff"
        />

        <KPICard
          title="Blocked Prompts"
          value={liveData.kpis.blocked}
          trend="Live"
          icon={<FaBug />}
          color="#ff5252"
        />

        <KPICard
          title="Sanitized"
          value={liveData.kpis.sanitized}
          trend="Live"
          icon={<FaLock />}
          color="#14e6ff"
        />

        <KPICard
          title="Security Score"
          value={liveData.kpis.securityScore}
          trend="Live"
          icon={<FaShieldAlt />}
          color="#a855f7"
        />

        <KPICard
          title="Risk Prevented"
          value={liveData.kpis.riskPrevented}
          trend="Calculated"
          icon={<FaRupeeSign />}
          color="#ffb000"
        />

      </div>

      {/* Top Charts */}

      <div className="chart-grid">

        <ActivityChart liveData={liveData.activity} />

        <ViolationChart liveData={liveData.categories} total={liveData.kpis.scanned} />

      </div>

      {/* Middle */}

      <div className="middle-grid">

        <ThreatMap />

        <DPDPCompliance />

      </div>

      {/* Bottom */}

      <div className="bottom-grid">

        <div className="risk-card">

          <h2>Risk by Department</h2>

          <div className="risk-bars">

            {liveData.departments.length === 0 ? (
              <p>No department activity yet. Submit prompts in Employee Chat.</p>
            ) : liveData.departments.map((department) => (
              <div className="risk-row" key={department.department}>
                <span>{department.department}</span>
                <div className="progress">
                  <div
                    style={{
                      width: `${Math.max(2, Number(department.score || 0))}%`,
                      background: Number(department.score || 0) >= 75
                        ? "#ff5252"
                        : Number(department.score || 0) >= 45
                          ? "#ffb000"
                          : "#22e37d",
                      height: "100%",
                      borderRadius: "inherit",
                    }}
                  ></div>
                </div>
                <strong>{department.score}</strong>
              </div>
            ))}

          </div>

        </div>

        <AIInsights />

      </div>

      <DepartmentTable liveData={liveData.departments} />

      <Footer />

    </div>
  );
}

export default Dashboard;

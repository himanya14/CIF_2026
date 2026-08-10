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
    activity: [], categories: [], departments: [],
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

            <div className="risk-row">
              <span>Finance</span>
              <div className="progress">
                <div className="finance"></div>
              </div>
              <strong>91</strong>
            </div>

            <div className="risk-row">
              <span>HR</span>
              <div className="progress">
                <div className="hr"></div>
              </div>
              <strong>74</strong>
            </div>

            <div className="risk-row">
              <span>IT</span>
              <div className="progress">
                <div className="it"></div>
              </div>
              <strong>58</strong>
            </div>

            <div className="risk-row">
              <span>Legal</span>
              <div className="progress">
                <div className="legal"></div>
              </div>
              <strong>42</strong>
            </div>

            <div className="risk-row">
              <span>Operations</span>
              <div className="progress">
                <div className="ops"></div>
              </div>
              <strong>34</strong>
            </div>

            <div className="risk-row">
              <span>Marketing</span>
              <div className="progress">
                <div className="marketing"></div>
              </div>
              <strong>18</strong>
            </div>

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

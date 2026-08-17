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
    kpis: {
      scanned: 0,
      blocked: 0,
      sanitized: 0,
      securityScore: 0,
      riskPrevented: "₹0.0L",
    },

    activity: {
      "24H": [],
      "7D": [],
      "30D": [],
    },

    categories: [],
    departments: [],

    threatMap: {
      points: [],
      summary: {
        critical: 0,
        warning: 0,
        secure: 0,
      },
    },

    dpdp: {
      score: 0,
      status: "NO DATA",
      checks: [],
    },

    insights: [],

    generatedAt: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const data = await getDashboard();

        if (mounted) {
          setLiveData(data);
          setLoading(false);
        }
      } catch (error) {
        console.warn(
          "Dashboard API unavailable:",
          error
        );

        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    const timer = setInterval(
      loadDashboard,
      3000
    );

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="dashboard">
      <Navbar />

      <div className="scanner">
        <span>
          {loading
            ? "CONNECTING TO WATCHTOWER..."
            : "SYSTEM SCANNING..."}
        </span>

        <div className="scan-line">
          <div className="scan-dot"></div>
        </div>

        {liveData.generatedAt && (
          <small>
            Last updated:{" "}
            {new Date(
              liveData.generatedAt
            ).toLocaleTimeString("en-IN")}
          </small>
        )}
      </div>

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
          value={`${liveData.kpis.securityScore}%`}
          trend="Live"
          icon={<FaShieldAlt />}
          color="#a855f7"
        />

        <KPICard
          title="Risk Prevented"
          value={liveData.kpis.riskPrevented}
          trend="Live"
          icon={<FaRupeeSign />}
          color="#ffb000"
        />
      </div>

      <div className="chart-grid">
        <ActivityChart
          liveData={liveData.activity}
        />

        <ViolationChart
          liveData={liveData.categories}
          total={liveData.kpis.scanned}
        />
      </div>

      <div className="middle-grid">
        <ThreatMap
          liveData={liveData.threatMap}
        />

        <DPDPCompliance
          liveData={liveData.dpdp}
        />
      </div>

      <div className="bottom-grid">
        <div className="risk-card">
          <div className="section-heading">
            <div>
              <h2>Risk by Department</h2>

              <p>
                Live risk calculated from actual
                security events stored in SQLite.
              </p>
            </div>
          </div>

          <div className="risk-bars">
            {liveData.departments.length === 0 ? (
              <p className="empty-state">
                No department activity yet.
                Submit prompts in Employee Chat.
              </p>
            ) : (
              liveData.departments.map(
                (department) => {
                  const score = Number(
                    department.score || 0
                  );

                  return (
                    <div
                      className="risk-row"
                      key={
                        department.department
                      }
                    >
                      <span>
                        {department.department}
                      </span>

                      <div className="progress">
                        <div
                          style={{
                            width: `${Math.max(
                              2,
                              Math.min(
                                score,
                                100
                              )
                            )}%`,
                            background:
                              score >= 75
                                ? "#ff5252"
                                : score >= 45
                                  ? "#ffb000"
                                  : "#22e37d",
                          }}
                        />
                      </div>

                      <strong>
                        {score}
                      </strong>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>

        <AIInsights
          liveData={liveData.insights}
        />
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;
import { useEffect, useMemo, useState } from "react";
import "../../styles/BlockScreen.css";
import { getIncidents, updateIncident } from "../../services/api";

import {
  FaShieldAlt,
  FaKey,
  FaIdCard,
  FaRupeeSign,
  FaCreditCard,
  FaFingerprint,
  FaArrowLeft,
  FaCheckCircle,
  FaSearch,
  FaGavel,
} from "react-icons/fa";

const GROUPS = {
  Credentials: { icon: <FaKey />, color: "#ff5252" },
  Finance: { icon: <FaCreditCard />, color: "#ff8c42" },
  PII: { icon: <FaIdCard />, color: "#a855f7" },
  Honeytoken: { icon: <FaFingerprint />, color: "#ffb000" },
  "AI Security": { icon: <FaShieldAlt />, color: "#00d4ff" },
  Other: { icon: <FaRupeeSign />, color: "#8ea8cf" },
};

function getIncidentGroup(incident) {
  if (incident.scenarioKey === "honeytoken" || incident.category === "Honeytoken") return "Honeytoken";
  if (incident.scenarioKey === "api-key" || incident.category === "Credentials") return "Credentials";
  if (incident.department === "Finance" || /financial|card|pan|payment/i.test(incident.category || "")) return "Finance";
  if (incident.department === "HR" || /identity|pii|aadhaar/i.test(incident.category || "")) return "PII";
  if (/prompt injection|ai attack/i.test(incident.category || "")) return "AI Security";
  return "Other";
}

function BlockScreen({ onBack, selectedScenarioId }) {
  const [scenarios, setScenarios] = useState([]);
  const [activeId, setActiveId] = useState(selectedScenarioId || null);
  const [activeGroup, setActiveGroup] = useState(null);
  const active = scenarios.find((s) => s.id === activeId) || scenarios[0] || null;

  const groupedScenarios = useMemo(() => scenarios.reduce((groups, incident) => {
    const group = getIncidentGroup(incident);
    if (!groups[group]) groups[group] = [];
    groups[group].push(incident);
    return groups;
  }, {}), [scenarios]);

  const visibleIncidents = activeGroup ? groupedScenarios[activeGroup] || [] : [];

  useEffect(() => {
    getIncidents().then(data => {
      setScenarios(data.incidents);
      const selected = data.incidents.find(item => item.id === selectedScenarioId) || data.incidents[0];
      setActiveId(selected?.id || null);
      setActiveGroup(selected ? getIncidentGroup(selected) : null);
    }).catch(error => console.warn("Incident API unavailable", error));
  }, [selectedScenarioId]);

  const reviewIncident = async (action) => {
    if (!active) return;
    const result = await updateIncident(active.id, action);
    setScenarios(current => current.map(item => item.id === active.id ? { ...item, reviewStatus: result.reviewStatus } : item));
  };

  return (
    <div className="block-screen">
      <div className="block-screen-header">
        <div>
          <h1>Block &amp; Explainer Log</h1>
          <p>Every blocked or sanitized prompt, explained — not just "Denied".</p>
        </div>

        {onBack && (
          <button className="back-link" onClick={onBack}>
            <FaArrowLeft /> Back to Dashboard
          </button>
        )}
      </div>

      <div className="scenario-tabs">
        {Object.entries(groupedScenarios).map(([group, incidents]) => (
          <button
            key={group}
            className={`scenario-tab ${activeGroup === group ? "active" : ""}`}
            style={{ "--tab-color": GROUPS[group].color }}
            onClick={() => {
              setActiveGroup(group);
              setActiveId(incidents[0].id);
            }}
          >
            <span className="dot" style={{ background: GROUPS[group].color }}></span>
            {GROUPS[group].icon}
            {group}
            <span className="category-count">{incidents.length}</span>
          </button>
        ))}
      </div>

      {visibleIncidents.length > 0 && (
        <div className="incident-picker">
          <div className="incident-picker-title">
            <strong>{activeGroup} incidents</strong>
            <span>Select an event to inspect</span>
          </div>
          <div className="incident-picker-list">
            {visibleIncidents.map((incident) => (
              <button key={incident.id} className={activeId === incident.id ? "active" : ""} onClick={() => setActiveId(incident.id)}>
                <strong>{incident.blockId}</strong>
                <span>{incident.title}</span>
                <small>{incident.timestamp}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {active ? (
        <ReceiptCard scenario={active} onReview={reviewIncident} />
      ) : (
        <div className="receipt-card"><div className="receipt-body"><h2>No incidents recorded</h2><p>Submit a risky prompt in Employee Chat to create a live database incident.</p></div></div>
      )}
    </div>
  );
}

function ReceiptCard({ scenario, onReview }) {
  const honey = !!scenario.isHoneytoken;

  return (
    <div className="receipt-card" key={scenario.id}>
      {/* TOP STATUS STRIP */}
      <div className={`receipt-top ${honey ? "honey" : ""}`}>
        <div className="receipt-status">
          <div className={`receipt-status-icon ${honey ? "honey" : ""}`}>
            <FaShieldAlt />
          </div>
          <div>
            <h2>{honey ? "Honeytoken Triggered" : "Access Blocked"}</h2>
            <span>{scenario.title}</span>
          </div>
        </div>

        <div className="receipt-meta">
          <strong>{scenario.blockId}</strong>
          {scenario.timestamp}
          <div
            className="severity-badge"
            style={{
              background: `${scenario.color}22`,
              color: scenario.color,
              border: `1px solid ${scenario.color}55`,
            }}
          >
            {scenario.severity}
          </div>
        </div>
      </div>

      {/* DPDP BANNER */}
      <div className={`dpdp-banner ${honey ? "honey" : ""}`}>
        <div className="dpdp-banner-title">
          <FaGavel />
          {honey
            ? "SECURITY INCIDENT — Unauthorized Access Attempt"
            : `DPDP VIOLATION — ${scenario.dpdp.section} (${scenario.dpdp.reason})`}
        </div>
        <div className="dpdp-grid">
          <div>
            <span>Regulation Section</span>
            <strong>{honey ? "InfoSec Policy §7.1" : scenario.dpdp.section}</strong>
          </div>
          <div className="penalty">
            <span>Penalty Exposure</span>
            <strong>{scenario.dpdp.penalty}</strong>
          </div>
          <div>
            <span>Action Taken</span>
            <strong style={{ textTransform: "uppercase" }}>{scenario.action}</strong>
          </div>
        </div>
      </div>

      <div className="receipt-body">
        {/* USER / SOURCE META */}
        <div className="receipt-section">
          <h3><FaSearch /> Incident Context</h3>
          <div className="dpdp-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
            <div>
              <span>User</span>
              <strong style={{ fontSize: 13 }}>{scenario.user}</strong>
            </div>
            <div>
              <span>Department</span>
              <strong style={{ fontSize: 13 }}>{scenario.department}</strong>
            </div>
            <div>
              <span>Source App</span>
              <strong style={{ fontSize: 13 }}>{scenario.sourceApp}</strong>
            </div>
            <div>
              <span>Confidence</span>
              <strong style={{ fontSize: 13 }}>{scenario.confidence}%</strong>
            </div>
          </div>
        </div>

        {/* WHAT WAS CAUGHT */}
        <div className="receipt-section">
          <h3>What We Caught</h3>
          <div className="terminal-box">{scenario.prompt}</div>

          <div className="caught-chips">
            {scenario.caught.map((c, i) => (
              <div className="caught-chip" key={i}>
                <span>{c.label}</span>
                {c.value}
              </div>
            ))}
          </div>

          <p className="detection-note">{scenario.detectionMethod}</p>
        </div>

        {/* POLICY + IMPACT */}
        <div className="two-col">
          <div className="info-card">
            <div className="rule-id-tag">{scenario.ruleId}</div>
            <h3>{scenario.ruleName}</h3>
            <p>{scenario.ruleDesc}</p>
            <div className="reg-line">{scenario.regulation}</div>
          </div>

          <div className="info-card">
            <h3>Potential Impact</h3>
            <div className="impact-amount">{scenario.dpdp.penalty}</div>
            <ul className="impact-list">
              {scenario.impact.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>

            <div className="confidence-row">
              <span>Detection Confidence</span>
              <strong>{scenario.confidence}%</strong>
            </div>
            <div className="confidence-bar">
              <div style={{ width: `${scenario.confidence}%` }}></div>
            </div>
          </div>
        </div>

        {/* WHAT TO DO INSTEAD */}
        <div className="receipt-section">
          <h3>What To Do Instead</h3>
          <div className="fix-list">
            {scenario.fix.map((line, i) => (
              <div className="fix-item" key={i}>
                <FaCheckCircle className="check-icon" />
                <p>{line}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="receipt-actions">
          <button className="btn btn-primary" onClick={() => onReview("acknowledge")}>Acknowledge &amp; Continue</button>
          <button className="btn btn-outline" onClick={() => onReview("false-positive")}>Report False Positive</button>
          <button className="btn btn-outline">View Full Policy →</button>
        </div>
      </div>
    </div>
  );
}

export default BlockScreen;

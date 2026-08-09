import { useState } from "react";
import "../../styles/BlockScreen.css";
import blockScenarios from "../../data/blockScenarios";

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

// pick an icon per scenario id, purely cosmetic
const ICONS = {
  "api-key": <FaKey />,
  "aadhaar": <FaIdCard />,
  "pan-consent": <FaRupeeSign />,
  "card-data": <FaCreditCard />,
  "honeytoken": <FaFingerprint />,
};

function BlockScreen({ onBack }) {
  const [activeId, setActiveId] = useState(blockScenarios[0].id);
  const active = blockScenarios.find((s) => s.id === activeId);

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
        {blockScenarios.map((s) => (
          <button
            key={s.id}
            className={`scenario-tab ${activeId === s.id ? "active" : ""}`}
            style={{ "--tab-color": s.color }}
            onClick={() => setActiveId(s.id)}
          >
            <span className="dot" style={{ background: s.color }}></span>
            {ICONS[s.id]}
            {s.tag}
          </button>
        ))}
      </div>

      <ReceiptCard scenario={active} />
    </div>
  );
}

function ReceiptCard({ scenario }) {
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
          <button className="btn btn-primary">Acknowledge &amp; Continue</button>
          <button className="btn btn-outline">Report False Positive</button>
          <button className="btn btn-outline">View Full Policy →</button>
        </div>
      </div>
    </div>
  );
}

export default BlockScreen;

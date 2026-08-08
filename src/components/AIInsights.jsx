import "../styles/Insights.css";

import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";

function AIInsights() {
  return (
    <div className="insight-card">

      <div className="insight-title">
        <FaShieldAlt />
        <h2>AI Security Insights</h2>
      </div>

      <div className="insight-item success">

        <div className="insight-icon">
          <FaCheckCircle />
        </div>

        <div>

          <h3>Security Posture Improved</h3>

          <p>
            Overall protection increased by
            <strong> 8% </strong>
            this week.
          </p>

        </div>

      </div>

      <div className="insight-item warning">

        <div className="insight-icon">
          <FaExclamationTriangle />
        </div>

        <div>

          <h3>Finance Login Anomaly</h3>

          <p>
            12 suspicious login attempts were blocked.
          </p>

        </div>

      </div>

      <div className="insight-item info">

        <div className="insight-icon">
          <FaLock />
        </div>

        <div>

          <h3>MFA Recommendation</h3>

          <p>
            Enable MFA for
            <strong> 24 </strong>
            remaining users.
          </p>

        </div>

      </div>

    </div>
  );
}

export default AIInsights;
import "../styles/Insights.css";

import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";

const icons = {
  critical: <FaExclamationTriangle />,
  warning: <FaExclamationTriangle />,
  success: <FaCheckCircle />,
  info: <FaLock />,
};

function AIInsights({
  liveData = [],
}) {
  const insights = Array.isArray(
    liveData
  )
    ? liveData
    : [];

  return (
    <div className="insight-card">
      <div className="insight-title">
        <FaShieldAlt />

        <div>
          <h2>
            AI Security Insights
          </h2>

          <span className="live-badge">
            LIVE
          </span>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="insight-empty">
          <FaShieldAlt />

          <h3>
            Monitoring Security Activity
          </h3>

          <p>
            Insights will update
            automatically as new security
            events are detected.
          </p>
        </div>
      ) : (
        <div className="insight-list">
          {insights.map(
            (insight, index) => {
              const type =
                insight.type || "info";

              return (
                <div
                  className={`insight-item ${type}`}
                  key={`${insight.title}-${index}`}
                >
                  <div className="insight-icon">
                    {icons[type] ||
                      icons.info}
                  </div>

                  <div>
                    <h3>
                      {insight.title}
                    </h3>

                    <p>
                      {insight.message}
                    </p>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

export default AIInsights;
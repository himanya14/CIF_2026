import "../styles/Charts.css";

import {
  FaShieldAlt,
  FaUserShield,
  FaLock,
  FaCreditCard,
  FaExclamationTriangle,
  FaKey,
} from "react-icons/fa";

const categoryIcons = {
  "Prompt Injection": <FaExclamationTriangle />,
  Credentials: <FaKey />,
  "Personal Identity": <FaUserShield />,
  "Personal Contact Data": <FaUserShield />,
  "Financial Identity": <FaCreditCard />,
  Honeytoken: <FaLock />,
};

function getRiskClass(risk) {
  if (risk >= 90) return "critical";
  if (risk >= 70) return "elevated";
  return "lower";
}

function ThreatMap({ liveData = {} }) {
  const points = Array.isArray(liveData?.points)
    ? liveData.points
    : [];

  const summary = liveData?.summary || {
    critical: 0,
    warning: 0,
    secure: 0,
  };

  const defaultDepartments = [
    "IT",
    "HR",
    "Finance",
    "General",
  ];

  const defaultCategories = [
    "Financial Identity",
    "Personal Identity",
    "Personal Contact Data",
    "Honeytoken",
    "Credentials",
    "Prompt Injection",
  ];

  const departments =
    points.length > 0
      ? [
          ...new Set(
            points
              .map((item) => item.department)
              .filter(Boolean)
          ),
        ]
      : defaultDepartments;

  const categories =
    points.length > 0
      ? [
          ...new Set(
            points
              .map((item) => item.category)
              .filter(Boolean)
          ),
        ]
      : defaultCategories;

  const getCell = (department, category) => {
    return (
      points.find(
        (item) =>
          item.department === department &&
          item.category === category
      ) || null
    );
  };

  const totalThreats = points.reduce(
    (sum, item) =>
      sum + Number(item.count || 0),
    0
  );

  const criticalCount =
    Number(summary.critical || 0);

  return (
    <div className="map-card threat-category-card">
      <div className="card-header">
        <div className="map-heading">
          <FaShieldAlt />

          <div>
            <h2>Threat Heatmap</h2>

            <span className="chart-subtitle">
              Live threat concentration by department and category
            </span>
          </div>
        </div>

        <span className="live-badge">
          LIVE
        </span>
      </div>

      <div className="threat-summary">
        <div>
          <strong>{totalThreats}</strong>
          <span>Threat Events</span>
        </div>

        <div>
          <strong>{categories.length}</strong>
          <span>Categories</span>
        </div>

        <div>
          <strong>{criticalCount}</strong>
          <span>Critical</span>
        </div>
      </div>

      <div
        className="heatmap-grid"
        style={{
          "--heatmap-columns": `180px repeat(${categories.length}, minmax(90px, 1fr))`,
        }}
      >
        <div className="heatmap-header-row">
          <div className="heatmap-department-title">
            DEPARTMENT
          </div>

          {categories.map((category) => (
            <div
              className="heatmap-category"
              key={category}
              title={category}
            >
              <div className="heatmap-category-icon">
                {categoryIcons[category] || (
                  <FaShieldAlt />
                )}
              </div>

              <span>{category}</span>
            </div>
          ))}
        </div>

        {departments.map((department) => (
          <div
            className="heatmap-data-row"
            key={department}
          >
            <div className="heatmap-department">
              {department}
            </div>

            {categories.map((category) => {
              const cell = getCell(
                department,
                category
              );

              const count = Number(
                cell?.count || 0
              );

              const risk = Number(
                cell?.risk || 0
              );

              if (!cell || count <= 0) {
                return (
                  <div
                    className="heatmap-dot-cell empty"
                    key={`${department}-${category}`}
                  />
                );
              }

              const riskClass =
                getRiskClass(risk);

              return (
                <div
                  className="heatmap-dot-cell"
                  key={`${department}-${category}`}
                >
                  <div
                    className={`heatmap-dot ${riskClass}`}
                  >
                    <div className="heatmap-tooltip">
                      <strong>
                        {department}
                      </strong>

                      <span>
                        {category}
                      </span>

                      <small>
                        {count}{" "}
                        {count === 1
                          ? "event"
                          : "events"}
                      </small>

                      <small>
                        Risk: {risk}%
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="threat-risk-legend">
        <span>
          <i className="high-risk-dot" />
          Critical
        </span>

        <span>
          <i className="medium-risk-dot" />
          Elevated
        </span>

        <span>
          <i className="low-risk-dot" />
          Lower
        </span>
      </div>
    </div>
  );
}

export default ThreatMap;
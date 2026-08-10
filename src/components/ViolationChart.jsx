import "../styles/ViolationChart.css";

const violations = [
  {
    name: "PII / Personal Data",
    value: 32,
    color: "#4285F4",
  },
  {
    name: "API Keys / Secrets",
    value: 24,
    color: "#ff4d4f",
  },
  {
    name: "Prompt Injection",
    value: 18,
    color: "#ffb020",
  },
  {
    name: "Financial Data",
    value: 14,
    color: "#20c7b7",
  },
  {
    name: "Confidential Docs",
    value: 8,
    color: "#8b5cf6",
  },
  {
    name: "Others",
    value: 4,
    color: "#60a5fa",
  },
];

function ViolationChart({ liveData = [], total = 0 }) {
  const displayedViolations = liveData.map((item, index) => ({
    ...item,
    color: violations[index % violations.length].color,
  }));
  return (
    <div className="violation-card">

      <h2>Violation Categories</h2>

      <div className="violation-content">

        <div className="donut-chart">

          <div className="donut-center">
            <h1>{total}</h1>
            <span>Total</span>
          </div>

        </div>

        <div className="legend">

          {displayedViolations.map((item, index) => (

            <div className="legend-item" key={index}>

              <div className="legend-left">

                <span
                  className="legend-dot"
                  style={{ background: item.color }}
                ></span>

                <span>{item.name}</span>

              </div>

              <strong>{item.value}%</strong>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default ViolationChart;

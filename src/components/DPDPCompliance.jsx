import "../styles/DPDPCompliance.css";

const checks = [
  { name: "Consent Management", status: "success" },
  { name: "Data Encryption", status: "success" },
  { name: "Access Control", status: "success" },
  { name: "Audit Logging", status: "success" },
  { name: "Retention Policy", status: "warning" },
];

function DPDPCompliance() {
  return (
    <div className="dpdp-card">

      <div className="dpdp-header">

        <div>
          <h2>DPDP Compliance</h2>
          <p>Digital Personal Data Protection Act</p>
        </div>

        <div className="score-box">
          <span>94%</span>
        </div>

      </div>

      <div className="progress-ring">

        <svg viewBox="0 0 120 120">

          <circle
            cx="60"
            cy="60"
            r="52"
            className="track"
          />

          <circle
            cx="60"
            cy="60"
            r="52"
            className="progress"
          />

        </svg>

        <div className="ring-text">
          <h1>94%</h1>
          <span>Compliant</span>
        </div>

      </div>

      <div className="compliance-list">

        {checks.map((item, index) => (

          <div className="compliance-item" key={index}>

            <div>

              <span
                className={
                  item.status === "success"
                    ? "status success"
                    : "status warning"
                }
              >
                {item.status === "success" ? "✓" : "⚠"}
              </span>

              {item.name}

            </div>

          </div>

        ))}

      </div>

      <div className="overall-status">

        <span>Status</span>

        <strong>COMPLIANT</strong>

      </div>

    </div>
  );
}

export default DPDPCompliance;
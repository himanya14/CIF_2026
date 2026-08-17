import "../styles/DPDPCompliance.css";

function DPDPCompliance({
  liveData = {},
}) {
  const score = Number(
    liveData?.score || 0
  );

  const status =
    liveData?.status || "NO DATA";

  const checks = Array.isArray(
    liveData?.checks
  )
    ? liveData.checks
    : [];

  const circumference =
    2 * Math.PI * 52;

  const offset =
    circumference -
    (Math.max(
      0,
      Math.min(score, 100)
    ) /
      100) *
      circumference;

  return (
    <div className="dpdp-card">
      <div className="dpdp-header">
        <div>
          <h2>DPDP Compliance</h2>

          <p>
            Operational compliance assessment
          </p>
        </div>

        <div className="score-box">
          <span>{score}%</span>
        </div>
      </div>

      <div className="dpdp-legal-note">
        Internal assessment · Not a legal compliance determination
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
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>

        <div className="ring-text">
          <h1>{score}%</h1>

          <span>{status}</span>
        </div>
      </div>

      <div className="compliance-list">
        {checks.length === 0 ? (
          <div className="compliance-empty">
            No compliance activity yet.
          </div>
        ) : (
          checks.map((item) => (
            <div
              className="compliance-item"
              key={item.name}
            >
              <div>
                <span
                  className={`status ${
                    item.status === "success"
                      ? "success"
                      : "warning"
                  }`}
                >
                  {item.status === "success"
                    ? "✓"
                    : "⚠"}
                </span>

                <span>
                  {item.name}
                </span>
              </div>

              <strong>
                {Number(item.score || 0)}%
              </strong>
            </div>
          ))
        )}
      </div>

      <div className="overall-status">
        <span>Assessment Status</span>

        <strong>{status}</strong>
      </div>
    </div>
  );
}

export default DPDPCompliance;
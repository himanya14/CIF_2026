import {
  FaTimes,
  FaShieldAlt,
  FaExclamationTriangle,
  FaBullseye,
  FaFileAlt,
  FaCheckCircle,
} from "react-icons/fa";

import "../../styles/FindingDetailsPanel.css";

function formatOutcome(outcome) {
  if (!outcome) {
    return "Not Run";
  }

  return outcome
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
}

function FindingDetailsPanel({
  test,
  result,
  onClose,
  onMarkReviewed,
}) {
  if (!test) {
    return null;
  }

  const outcome =
    result?.outcome ?? "NOT_RUN";

  const outcomeClass =
    outcome.toLowerCase().replaceAll("_", "-");

  return (
  <div
    className="finding-panel-overlay"
    onClick={onClose}
  >
    <aside
      className="finding-details-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="finding-panel-title"
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      {/* ======================================
          PANEL HEADER
      ====================================== */}

      <header className="finding-panel-header">
        <div>
          <p>SECURITY FINDING</p>

          <h2 id="finding-panel-title">
            {test.name}
          </h2>

          <span>{test.category}</span>
        </div>

        <button
          type="button"
          className="finding-close-button"
          onClick={onClose}
          aria-label="Close finding details"
        >
          <FaTimes />
        </button>
      </header>

      {/* ======================================
          PANEL CONTENT
      ====================================== */}

      <div className="finding-panel-content">
        <section className="finding-overview">
          <div>
            <span>Severity</span>

            <strong
              className={`finding-severity finding-severity--${test.severity.toLowerCase()}`}
            >
              {test.severity}
            </strong>
          </div>

          <div>
            <span>Outcome</span>

            <strong
              className={`finding-outcome finding-outcome--${outcomeClass}`}
            >
              {formatOutcome(outcome)}
            </strong>
          </div>
        </section>

        <section className="finding-section">
          <div className="finding-section-title">
            <FaFileAlt />
            <h3>Test prompt</h3>
          </div>

          <div className="finding-prompt">
            “{test.prompt}”
          </div>
        </section>

        <section className="finding-section">
          <div className="finding-section-title">
            <FaBullseye />
            <h3>Decision comparison</h3>
          </div>

          <div className="finding-decisions">
            <div>
              <span>Expected action</span>
              <strong>
                {test.expectedAction}
              </strong>
            </div>

            <div>
              <span>Actual action</span>
              <strong>
                {result?.actualAction ?? "—"}
              </strong>
            </div>
          </div>
        </section>

        <section className="finding-section">
          <div className="finding-section-title">
            <FaShieldAlt />
            <h3>Security analysis</h3>
          </div>

          <div className="finding-analysis-grid">
            <div>
              <span>Policy triggered</span>

              <strong>
                {result?.policy ??
                  "No policy evaluated"}
              </strong>
            </div>

            <div>
              <span>Confidence</span>

              <strong>
                {result?.confidence != null
                  ? `${result.confidence}%`
                  : "—"}
              </strong>
            </div>

            <div>
              <span>Risk score</span>

              <strong>
                {result?.riskScore ?? "—"}
              </strong>
            </div>

            <div>
              <span>Review status</span>

              <strong>
                {result?.reviewStatus ??
                  "Unreviewed"}
              </strong>
            </div>
          </div>
        </section>

        <section className="finding-section">
          <div className="finding-section-title">
            <FaExclamationTriangle />
            <h3>Detection reason</h3>
          </div>

          <p className="finding-reason">
            {result?.reason ??
              "Run the simulation to generate a security analysis."}
          </p>
        </section>

        <section className="finding-section">
          <h3>Detected items</h3>

          <div className="detected-items">
            {result?.detectedItems?.length >
            0 ? (
              result.detectedItems.map(
                (item) => (
                  <span key={item}>
                    {item}
                  </span>
                )
              )
            ) : (
              <p>
                No sensitive items were
                recorded.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* ======================================
          REVIEWER ACTION
      ====================================== */}

      <footer className="finding-panel-footer">
        <div>
          <span>Reviewer action</span>

          <p>
            Confirm that this finding has been
            examined by a security reviewer.
          </p>
        </div>

        <button
          type="button"
          className="mark-reviewed-button"
          disabled={
            !result ||
            result.reviewStatus === "REVIEWED"
          }
          onClick={() =>
            onMarkReviewed(test.id)
          }
        >
          <FaCheckCircle />

          <span>
            {result?.reviewStatus ===
            "REVIEWED"
              ? "Reviewed"
              : "Mark as Reviewed"}
          </span>
        </button>
      </footer>
    </aside>
  </div>
);
}

export default FindingDetailsPanel;
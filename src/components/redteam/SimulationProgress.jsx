import {
  FaShieldAlt,
  FaSpinner,
} from "react-icons/fa";

import "../../styles/SimulationProgress.css";

function SimulationProgress({
  currentTest,
  completedTests,
  totalTests,
  progressPercentage,
}) {
  return (
    <section className="simulation-progress">
      <div className="simulation-progress-content">
        <div className="simulation-progress-current">
          <div className="simulation-progress-icon">
            <FaSpinner />
          </div>

          <div>
            <span className="simulation-progress-label">
              CURRENTLY TESTING
            </span>

            <strong>
              {currentTest?.name ??
                "Preparing simulation..."}
            </strong>
          </div>
        </div>

        <div className="simulation-progress-status">
          <FaShieldAlt />

          <span>
            {completedTests} of {totalTests} completed
          </span>

          <strong>
            {progressPercentage}%
          </strong>
        </div>
      </div>

      <div
        className="simulation-progress-track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progressPercentage}
        aria-label="Simulation progress"
      >
        <div
          className="simulation-progress-fill"
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </div>
    </section>
  );
}

export default SimulationProgress;
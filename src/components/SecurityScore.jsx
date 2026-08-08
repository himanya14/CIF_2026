import "../styles/Cards.css";
import { FaShieldAlt } from "react-icons/fa";

function SecurityScore() {
  const score = 92;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * score) / 100;

  return (
    <div className="security-card">

      <h2>Overall Security Score</h2>

      <div className="score-circle">

        <svg width="180" height="180">

          <circle
            className="track"
            cx="90"
            cy="90"
            r={radius}
          />

          <circle
            className="progress"
            cx="90"
            cy="90"
            r={radius}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />

        </svg>

        <div className="score-text">

          <FaShieldAlt />

          <h1>{score}</h1>

          <span>%</span>

        </div>

      </div>

      <p>Excellent Protection</p>

    </div>
  );
}

export default SecurityScore;
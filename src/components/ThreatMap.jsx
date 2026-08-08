import "../styles/Charts.css";
import { FaGlobeAmericas } from "react-icons/fa";

const threats = [
  { top: "34%", left: "18%", type: "critical" },
  { top: "23%", left: "43%", type: "warning" },
  { top: "52%", left: "56%", type: "secure" },
  { top: "37%", left: "81%", type: "critical" },
];

function ThreatMap() {
  return (
    <div className="map-card">

      <div className="card-header">
        <div className="map-heading">
          <FaGlobeAmericas />
          <h2>Global Threat Map</h2>
        </div>

        <span className="live-badge">
          LIVE
        </span>
      </div>

      <div className="world-map">

        <img
          src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
          alt="world"
          className="world-image"
        />

        {threats.map((t, i) => (
          <div
            key={i}
            className={`threat-point ${t.type}`}
            style={{
              top: t.top,
              left: t.left,
            }}
          >
            <span></span>
          </div>
        ))}

      </div>

      <div className="map-legend">

        <div>
          <span className="legend critical"></span>
          Critical
        </div>

        <div>
          <span className="legend warning"></span>
          Warning
        </div>

        <div>
          <span className="legend secure"></span>
          Secure
        </div>

      </div>

    </div>
  );
}

export default ThreatMap;
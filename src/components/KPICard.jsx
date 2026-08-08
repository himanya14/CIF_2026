import "../styles/Cards.css";

function KPICard({
  title,
  value,
  trend,
  icon,
  color,
}) {
  return (
    <div
      className="kpi-card"
      style={{
        borderTop: `4px solid ${color}`,
      }}
    >
      <div className="kpi-top">

        <div
          className="kpi-icon"
          style={{
            background: `${color}20`,
            color: color,
          }}
        >
          {icon}
        </div>

        <div className="kpi-info">

          <span className="kpi-title">
            {title}
          </span>

          <h1
            className="kpi-value"
            style={{ color }}
          >
            {value}
          </h1>

        </div>

      </div>

      <div className="kpi-bottom">

        <span className="trend-up">
          ▲ {trend}
        </span>

        <span className="trend-text">
          vs yesterday
        </span>

      </div>

    </div>
  );
}

export default KPICard;
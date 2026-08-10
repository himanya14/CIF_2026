import "../../styles/SimulationStatCard.css";

function SimulationStatCard({
  title,
  value,
  description,
  icon,
  color,
}) {

  return (

    <div
      className="simulation-stat-card"
      style={{
        "--card-accent": color,
      }}
    >

      <div className="stat-card-top">

        <div className="stat-card-icon">
          {icon}
        </div>

        <span className="stat-card-title">
          {title}
        </span>

      </div>


      <div className="stat-card-value">
        {value}
      </div>


      <p className="stat-card-description">
        {description}
      </p>

    </div>

  );

}


export default SimulationStatCard;
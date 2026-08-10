import "../styles/ViolationChart.css";

const COLORS = ["#4285f4", "#ff5252", "#ffb020", "#20c7b7", "#8b5cf6", "#60a5fa", "#ec4899"];

function ViolationChart({ liveData = [], total = 0 }) {
  const primary = liveData.slice(0, 6);
  const remaining = liveData.slice(6).reduce((sum, item) => sum + Number(item.value || 0), 0);
  const categories = [...primary, ...(remaining ? [{ name: "Other", value: remaining }] : [])]
    .map((item, index) => ({ ...item, color: COLORS[index] }));
  let cursor = 0;
  const gradient = categories.length
    ? `conic-gradient(${categories.map(item => {
        const start = cursor;
        cursor += Number(item.value || 0);
        return `${item.color} ${start}% ${Math.min(cursor, 100)}%`;
      }).join(", ")})`
    : "conic-gradient(#223b5b 0 100%)";

  return <div className="violation-card">
    <div className="violation-heading"><div><h2>Violation Categories</h2><span>Share of all scanned prompts</span></div></div>
    <div className="violation-content">
      <div className="donut-chart" style={{ "--donut-gradient": gradient }}>
        <div className="donut-center"><h1>{total}</h1><span>Total scans</span></div>
      </div>
      <div className="violation-legend">
        {categories.length === 0 ? <div className="violation-empty">No categories recorded yet.</div> : categories.map(item => (
          <div className="legend-item" key={item.name}>
            <div className="legend-left"><span className="legend-dot" style={{ background: item.color }}></span><span title={item.name}>{item.name}</span></div>
            <strong>{item.value}%</strong>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

export default ViolationChart;

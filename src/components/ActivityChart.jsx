import "../styles/Charts.css";
import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis, Legend } from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = key => payload.find(item => item.dataKey === key)?.value ?? 0;
  return <div className="custom-tooltip">
    <h3>{label}</h3>
    <p className="allowed">Allowed: {value("allowed")}</p>
    <p className="blocked">Blocked: {value("blocked")}</p>
    <p className="sanitized">Sanitized: {value("sanitized")}</p>
  </div>;
}

function ActivityChart({ liveData = {} }) {
  const [period, setPeriod] = useState("24H");
  const data = liveData?.[period] || [];

  return <div className="chart-card">
    <div className="chart-header">
      <div><h2>Threat Activity</h2><span className="chart-subtitle">Live events stored in SQLite</span></div>
      <div className="chart-filter">
        {["24H", "7D", "30D"].map(item => <button key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>{item}</button>)}
      </div>
    </div>
    {data.length === 0 ? <div className="chart-empty">Submit prompts in Employee Chat to generate activity.</div> : (
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 15, right: 18, left: 0, bottom: 10 }}>
          <CartesianGrid stroke="#233d5b" strokeDasharray="4 4" />
          <XAxis dataKey="time" stroke="#8ea8cf" minTickGap={30} tickFormatter={value => value.split(" #")[0]} />
          <YAxis stroke="#8ea8cf" allowDecimals={false} domain={[0, "auto"]} />
          <Legend verticalAlign="bottom" height={30} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="allowed" name="Allowed" stroke="#4d8cff" strokeWidth={3} dot={data.length < 20 ? { r: 3 } : false} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="blocked" name="Blocked" stroke="#ff5252" strokeWidth={3} dot={data.length < 20 ? { r: 3 } : false} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="sanitized" name="Sanitized" stroke="#2ed4bf" strokeWidth={3} dot={data.length < 20 ? { r: 3 } : false} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    )}
  </div>;
}

export default ActivityChart;

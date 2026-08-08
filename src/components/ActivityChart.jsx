import "../styles/Charts.css";
import { useState } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const hourlyData = [
  { time: "12 AM", allowed: 20, blocked: 5, sanitized: 12 },
  { time: "2 AM", allowed: 18, blocked: 4, sanitized: 10 },
  { time: "4 AM", allowed: 30, blocked: 6, sanitized: 15 },
  { time: "6 AM", allowed: 55, blocked: 10, sanitized: 25 },
  { time: "8 AM", allowed: 90, blocked: 18, sanitized: 45 },
  { time: "10 AM", allowed: 125, blocked: 25, sanitized: 65 },
  { time: "12 PM", allowed: 145, blocked: 32, sanitized: 75 },
  { time: "2 PM", allowed: 165, blocked: 35, sanitized: 90 },
  { time: "4 PM", allowed: 178, blocked: 42, sanitized: 98 },
  { time: "6 PM", allowed: 160, blocked: 30, sanitized: 91 },
  { time: "8 PM", allowed: 145, blocked: 20, sanitized: 88 },
  { time: "10 PM", allowed: 125, blocked: 14, sanitized: 80 },
  { time: "12 AM", allowed: 105, blocked: 10, sanitized: 75 },
];

const weeklyData = [
  { time: "Mon", allowed: 740, blocked: 85, sanitized: 300 },
  { time: "Tue", allowed: 690, blocked: 92, sanitized: 310 },
  { time: "Wed", allowed: 810, blocked: 101, sanitized: 360 },
  { time: "Thu", allowed: 920, blocked: 125, sanitized: 410 },
  { time: "Fri", allowed: 880, blocked: 117, sanitized: 395 },
  { time: "Sat", allowed: 650, blocked: 74, sanitized: 260 },
  { time: "Sun", allowed: 720, blocked: 82, sanitized: 285 },
];

const monthlyData = [
  { time: "W1", allowed: 5200, blocked: 620, sanitized: 2100 },
  { time: "W2", allowed: 6100, blocked: 740, sanitized: 2500 },
  { time: "W3", allowed: 5800, blocked: 700, sanitized: 2300 },
  { time: "W4", allowed: 6600, blocked: 790, sanitized: 2800 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;

  return (
    <div className="custom-tooltip">
      <h3>{label}</h3>
      <p className="allowed">Allowed : {payload[0].value}</p>
      <p className="blocked">Blocked : {payload[1].value}</p>
      <p className="sanitized">Sanitized : {payload[2].value}</p>
    </div>
  );
}

function ActivityChart() {
  const [period, setPeriod] = useState("24H");

  const data =
    period === "24H"
      ? hourlyData
      : period === "7D"
      ? weeklyData
      : monthlyData;

  return (
    <div className="chart-card">

      <div className="chart-header">

        <h2>Threat Activity</h2>

        <div className="chart-filter">

          <button
            className={period === "24H" ? "active" : ""}
            onClick={() => setPeriod("24H")}
          >
            24H
          </button>

          <button
            className={period === "7D" ? "active" : ""}
            onClick={() => setPeriod("7D")}
          >
            7D
          </button>

          <button
            className={period === "30D" ? "active" : ""}
            onClick={() => setPeriod("30D")}
          >
            30D
          </button>

        </div>

      </div>

      <ResponsiveContainer width="100%" height={360}>

        <LineChart data={data}>

          <CartesianGrid stroke="#233d5b" strokeDasharray="4 4" />

          <XAxis dataKey="time" stroke="#8ea8cf" />

          <YAxis stroke="#8ea8cf" />

          <Legend />

          <Tooltip content={<CustomTooltip />} />

          <Line type="monotone" dataKey="allowed" stroke="#4d8cff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />

          <Line type="monotone" dataKey="blocked" stroke="#ff5252" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />

          <Line type="monotone" dataKey="sanitized" stroke="#2ed4bf" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default ActivityChart;
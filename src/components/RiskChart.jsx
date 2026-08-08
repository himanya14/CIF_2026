import "../styles/Charts.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const data = [
  { name: "Finance", score: 91 },
  { name: "HR", score: 74 },
  { name: "IT", score: 58 },
  { name: "Legal", score: 42 },
  { name: "Operations", score: 34 },
];

const colors = [
  "#ff5252",
  "#ff9800",
  "#00bcd4",
  "#3ea6ff",
  "#00e676",
];

function RiskChart() {
  return (
    <div className="chart-card">

      <h2>Risk by Department</h2>

      <ResponsiveContainer width="100%" height={300}>

        <BarChart data={data}>

          <CartesianGrid
            stroke="#243d5d"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="name"
            stroke="#9fb2cc"
          />

          <YAxis
            stroke="#9fb2cc"
            domain={[0, 100]}
          />

          <Tooltip
            contentStyle={{
              background: "#132238",
              border: "1px solid #2d4d76",
              borderRadius: "12px",
              color: "#fff",
            }}
          />

          <Bar
            dataKey="score"
            radius={[8, 8, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={colors[index]}
              />
            ))}
          </Bar>

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}

export default RiskChart;
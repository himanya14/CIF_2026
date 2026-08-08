import "../styles/Table.css";

const departments = [
  { department: "Finance", risk: "High", score: 91 },
  { department: "HR", risk: "Medium", score: 74 },
  { department: "IT", risk: "Medium", score: 58 },
  { department: "Legal", risk: "Low", score: 42 },
  { department: "Operations", risk: "Low", score: 34 },
];

function DepartmentTable() {
  return (
    <div className="table-card">

      <div className="table-header">
        <h2>Top Risky Departments</h2>

        <span className="view-all">
          View All
        </span>
      </div>

      <table>

        <thead>

          <tr>
            <th>Rank</th>
            <th>Department</th>
            <th>Risk Level</th>
            <th>Score</th>
          </tr>

        </thead>

        <tbody>

          {departments.map((dept, index) => (

            <tr key={index}>

              <td>{index + 1}</td>

              <td>{dept.department}</td>

              <td>

                <span className={`risk-badge ${dept.risk.toLowerCase()}`}>
                  {dept.risk}
                </span>

              </td>

              <td>{dept.score}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default DepartmentTable;
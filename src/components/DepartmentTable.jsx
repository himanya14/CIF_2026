import "../styles/Table.css";

function DepartmentTable({ liveData = [] }) {
  const displayedDepartments = liveData.map(item => ({
    department: item.department,
    score: Number(item.score || 0),
    risk: Number(item.score || 0) >= 75 ? "High" : Number(item.score || 0) >= 45 ? "Medium" : "Low",
  }));
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

          {displayedDepartments.map((dept, index) => (

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

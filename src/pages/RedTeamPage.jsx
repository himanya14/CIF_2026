import { useEffect, useState } from "react";

import "../styles/RedTeamPage.css";

import Navbar from "../components/Navbar";
import SimulationStatCard from "../components/redteam/SimulationStatCard";
import SimulationResultsTable from "../components/redteam/SimulationResultsTable";
import SimulationProgress from "../components/redteam/SimulationProgress";
import FindingDetailsPanel from "../components/redteam/FindingDetailsPanel";
import { runRedTeamTest } from "../services/redTeamSimulationService";
import { createRedTeamTest, getRedTeamTests } from "../services/api";

import {
  FaShieldAlt,
  FaPlay,
  FaFlask,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

import { toast } from "react-toastify";


function RedTeamPage() {
  const [tests, setTests] = useState([]);
  const [isLoadingTests, setIsLoadingTests] = useState(true);
  const [customTest, setCustomTest] = useState({ name: "", category: "Custom Attack", severity: "High", expectedAction: "BLOCK", prompt: "" });

  useEffect(() => {
    getRedTeamTests()
      .then(data => setTests(data.tests))
      .catch(error => toast.error(`Could not load tests: ${error.message}`))
      .finally(() => setIsLoadingTests(false));
  }, []);
  /* ==========================================
     SIMULATION STATE
  ========================================== */

  const [isRunning, setIsRunning] =useState(false);

  const [currentTestIndex,setCurrentTestIndex,] = useState(-1);

  const [results, setResults] =useState([]);

  const [selectedTestId,setSelectedTestId,] = useState(null);

  /* ==========================================
     VALUES DERIVED FROM TEST DATA
  ========================================== */

  const totalTests = tests.length;

  const threatTests = tests.filter(
    (test) => test.isThreat
  ).length;

  /* ==========================================
     VALUES DERIVED FROM RESULTS
  ========================================== */

  const completedTests = results.length;

  const testsPassed = results.filter(
    (result) => result.passed
  ).length;

  const testsFailed = results.filter(
    (result) => !result.passed
  ).length;

  /* ==========================================
     SIMULATION PROGRESS
  ========================================== */

  const progressPercentage =
    totalTests === 0
      ? 0
      : Math.round(
          (completedTests / totalTests) * 100
        );

  /* ==========================================
     SECURITY SCORE
  ========================================== */

  const securityScore =
    completedTests === 0
      ? null
      : Math.round(
          (testsPassed / completedTests) * 100
        );

  /* ==========================================
     CURRENTLY RUNNING TEST
  ========================================== */

  const currentTest =
    currentTestIndex >= 0
      ? tests[currentTestIndex]
      : null;


  const selectedTest = tests.find(
    (test) => test.id === selectedTestId
  );

  const selectedResult = results.find(
    (result) =>
      result.testId === selectedTestId
  );    
  /* ==========================================
     RUN THE SIMULATION
  ========================================== */

const handleRunSimulation = async () => {
  if (isRunning || totalTests === 0) {
    return;
  }

  const simulationRunId =
    `run-${Date.now()}`;

  const completedRunResults = [];

  setIsRunning(true);
  setCurrentTestIndex(-1);
  setResults([]);
  setSelectedTestId(null);

  toast.info(
    `Red Team simulation started with ${totalTests} scenarios.`
  );

  try {
    for (let index = 0;index < tests.length;index += 1) {
      const test = tests[index];

      setCurrentTestIndex(index);

      const testResult =
        await runRedTeamTest(
          test,
          simulationRunId
        );

      completedRunResults.push(testResult);

      setResults((previousResults) => [
        ...previousResults,
        testResult,
      ]);

      if (
        testResult.outcome ===
        "SECURITY_GAP"
      ) {
        toast.warning(
          `Security gap detected: ${test.name}`
        );
      }
    }

    const passedCount =
      completedRunResults.filter(
        (result) => result.passed
      ).length;

    toast.success(
      `Simulation completed: ${passedCount} of ${totalTests} tests passed.`
    );
  } catch (error) {
    console.error(
      "Red Team simulation failed:",
      error
    );

    toast.error(
      "The simulation could not be completed."
    );
  } finally {
    setCurrentTestIndex(-1);
    setIsRunning(false);
  }
};

const handleMarkAsReviewed = (testId) => {
  const reviewedTest = tests.find(
    (test) => test.id === testId
  );

  setResults((previousResults) =>
    previousResults.map((result) => {
      if (result.testId !== testId) {
        return result;
      }

      return {
        ...result,
        reviewStatus: "REVIEWED",
        reviewedAt: new Date().toISOString(),
      };
    })
  );

  toast.success(
    `${reviewedTest?.name ?? "Finding"} marked as reviewed.`
  );
};

const handleCreateCustomTest = async (event) => {
  event.preventDefault();
  try {
    const data = await createRedTeamTest(customTest);
    setTests(previous => [...previous, data.test]);
    setCustomTest(previous => ({ ...previous, name: "", prompt: "" }));
    toast.success("Custom firewall test saved to SQLite.");
  } catch (error) {
    toast.error(error.message);
  }
};
  /* ==========================================
     STAT CARD DATA
  ========================================== */

  const simulationStats = [
    {
      id: "total",
      title: "Total Tests",
      value: totalTests,
      description:
        "Security scenarios loaded",
      icon: <FaFlask />,
      color: "#00d4ff",
    },

    {
      id: "threats",
      title: "Threat Tests",
      value: threatTests,
      description:
        "Adversarial scenarios",
      icon: <FaExclamationTriangle />,
      color: "#ff5252",
    },

    {
      id: "passed",
      title: "Tests Passed",
      value: testsPassed,
      description:
        completedTests === 0
          ? "No tests executed"
          : `${completedTests} tests completed`,
      icon: <FaCheckCircle />,
      color: "#22e37d",
    },

    {
      id: "score",
      title: "Security Score",
      value:
        securityScore === null
          ? "--"
          : `${securityScore}%`,
      description:
        completedTests === 0
          ? "Awaiting simulation"
          : `${testsFailed} tests failed`,
      icon: <FaShieldAlt />,
      color: "#a855f7",
    },
  ];

  return (
    <div className="red-team-page">

      <Navbar />

      <main className="red-team-content">

        <section className="red-team-header">
          <div className="red-team-header-left">
            <div className="red-team-label">
              <FaShieldAlt />

              <span>
                RED TEAM SECURITY VALIDATION
              </span>
            </div>

            <h1>Red Team Simulator</h1>

            <p className="red-team-description">
              Validate AI Watch Tower against
              simulated security threats,
              sensitive data leaks, malicious
              prompts, and adversarial attacks.
            </p>
          </div>

          <div className="red-team-header-right">
            <button
              className="run-simulation-btn"
              type="button"
              onClick={handleRunSimulation}
              disabled={
                isRunning || isLoadingTests || totalTests === 0
              }
            >
              <FaPlay />

              <span>
                {isRunning
                  ? currentTestIndex >= 0
                    ? `Running ${
                        currentTestIndex + 1
                      } of ${totalTests}`
                    : "Preparing Simulation"
                  : completedTests > 0
                    ? "Run Again"
                    : "Run Simulation"}
              </span>
            </button>
          </div>
        </section>

        <form className="custom-test-panel" onSubmit={handleCreateCustomTest}>
          <div className="custom-test-heading">
            <div><span>LIVE FIREWALL TEST</span><h2>Implant a Custom Prompt</h2></div>
            <p>The prompt is stored in SQLite and evaluated by the same firewall used by Employee Chat.</p>
          </div>
          <div className="custom-test-fields">
            <input required placeholder="Scenario name" value={customTest.name} onChange={event => setCustomTest({ ...customTest, name: event.target.value })} />
            <input required placeholder="Category" value={customTest.category} onChange={event => setCustomTest({ ...customTest, category: event.target.value })} />
            <select value={customTest.severity} onChange={event => setCustomTest({ ...customTest, severity: event.target.value })}>
              <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
            <select value={customTest.expectedAction} onChange={event => setCustomTest({ ...customTest, expectedAction: event.target.value })}>
              <option value="BLOCK">Expect Block</option><option value="SANITIZE">Expect Sanitize</option><option value="ALERT">Expect Alert</option><option value="WARN">Expect Warning</option><option value="ALLOW">Expect Allow</option>
            </select>
          </div>
          <textarea required rows="4" placeholder="Enter any safe or adversarial prompt to test the firewall..." value={customTest.prompt} onChange={event => setCustomTest({ ...customTest, prompt: event.target.value })}></textarea>
          <button className="run-simulation-btn" type="submit" disabled={isRunning}><FaFlask /> Save Custom Test</button>
        </form>


        <section className="red-team-stats-section">
          {simulationStats.map((stat) => (
            <SimulationStatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </section>

        {isRunning && (
          <SimulationProgress
            currentTest={currentTest}
            completedTests={completedTests}
            totalTests={totalTests}
            progressPercentage={
              progressPercentage
            }
          />
        )}

        {/* ======================================
            SIMULATION RESULTS
        ====================================== */}

        <section className="red-team-workspace">
          <SimulationResultsTable
            tests={tests}
            results={results}
            selectedTestId={selectedTestId}
            activeTestId={
              currentTest?.id ?? null
            }
            onSelectTest={
              setSelectedTestId
            }
          />
        </section>
      </main>
      {selectedTest && (
        <FindingDetailsPanel
          test={selectedTest}
          result={selectedResult}
          onClose={() =>
            setSelectedTestId(null)
          }
          onMarkReviewed={
            handleMarkAsReviewed
          }
        />
      )}
    </div>
  );
}

export default RedTeamPage;

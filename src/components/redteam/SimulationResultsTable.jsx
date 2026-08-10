import { useMemo, useState } from "react";

import "../../styles/SimulationResultsTable.css";

import {
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaSearchPlus,
} from "react-icons/fa";


const TESTS_PER_PAGE = 8;


function SimulationResultsTable({
  tests,
  results,
  selectedTestId,
  activeTestId,
  onSelectTest,
}) {

  /* ==========================================
     TABLE CONTROL STATE
  ========================================== */

  const [searchTerm, setSearchTerm] = useState("");

  const [outcomeFilter, setOutcomeFilter] =
    useState("all");

  const [severityFilter, setSeverityFilter] =
    useState("all");

  const [currentPage, setCurrentPage] =
    useState(1);


  /* ==========================================
     FIND RESULT FOR A TEST
  ========================================== */

  const findResult = (testId) => {

    return results.find(
      (result) => result.testId === testId
    );

  };


  /* ==========================================
     CALCULATE MEANINGFUL OUTCOME
  ========================================== */

  const getOutcome = (test, result,isActive=false) => {

    if (isActive &&!result) {

      return {
        key: "running",
        label: "Running",
      };

    }
    if(!result){
        return{
            key:"pending",
            label: "Not Run"
        };
    }


    const outcomes = {
      PROTECTED: { key: "protected", label: "Protected" },
      MITIGATED: { key: "mitigated", label: "Mitigated" },
      PARTIAL_PROTECTION: { key: "partial-protection", label: "Partial Protection" },
      CORRECTLY_ALLOWED: { key: "allowed", label: "Correctly Allowed" },
      SECURITY_GAP: { key: "security-gap", label: "Security Gap" },
      FALSE_POSITIVE: { key: "false-positive", label: "False Positive" },
    };

    return outcomes[result.outcome] || {
      key: result.passed ? "protected" : "security-gap",
      label: result.passed ? "Protected" : "Security Gap",
    };

  };


  /* ==========================================
     COMBINE TESTS WITH RESULTS
  ========================================== */

  const tableRows = useMemo(() => {

    return tests.map((test) => {

      const result = findResult(test.id);

      const outcome = getOutcome(
        test,
        result,
        test.id === activeTestId
      );


      return {
        test,
        result,
        outcome,
      };

    });

  }, [tests, results, activeTestId ]);


  /* ==========================================
     SEARCH AND FILTER
  ========================================== */

  const filteredRows = useMemo(() => {

    const normalizedSearch =
      searchTerm.trim().toLowerCase();


    return tableRows.filter((row) => {

      const matchesSearch =
        normalizedSearch === "" ||
        row.test.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        row.test.category
          .toLowerCase()
          .includes(normalizedSearch);


      const matchesOutcome =
        outcomeFilter === "all" ||
        row.outcome.key === outcomeFilter;


      const matchesSeverity =
        severityFilter === "all" ||
        row.test.severity.toLowerCase() ===
          severityFilter;


      return (
        matchesSearch &&
        matchesOutcome &&
        matchesSeverity
      );

    });

  }, [
    tableRows,
    searchTerm,
    outcomeFilter,
    severityFilter,
  ]);


  /* ==========================================
     PAGINATION
  ========================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRows.length / TESTS_PER_PAGE
    )
  );


  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );


  const startIndex =
    (safeCurrentPage - 1) * TESTS_PER_PAGE;


  const visibleRows = filteredRows.slice(
    startIndex,
    startIndex + TESTS_PER_PAGE
  );


  const goToPreviousPage = () => {

    setCurrentPage((previousPage) =>
      Math.max(previousPage - 1, 1)
    );

  };


  const goToNextPage = () => {

    setCurrentPage((previousPage) =>
      Math.min(previousPage + 1, totalPages)
    );

  };


  /* ==========================================
     FILTER CHANGE HELPERS
  ========================================== */

  const handleSearchChange = (event) => {

    setSearchTerm(event.target.value);

    setCurrentPage(1);

  };


  const handleOutcomeChange = (event) => {

    setOutcomeFilter(event.target.value);

    setCurrentPage(1);

  };


  const handleSeverityChange = (event) => {

    setSeverityFilter(event.target.value);

    setCurrentPage(1);

  };


  return (
    <section className="results-table-panel">

      {/* ======================================
          PANEL HEADER
      ====================================== */}

      <div className="results-table-heading">

        <div>

          <p className="results-table-eyebrow">
            SIMULATION FINDINGS
          </p>

          <h2>
            Security Test Results
          </h2>

          <span>
            Analyze security gaps, false positives,
            and successful protections
          </span>

        </div>


        <div className="results-count">

          {filteredRows.length}

          <span>
            findings
          </span>

        </div>

      </div>


      {/* ======================================
          SEARCH AND FILTERS
      ====================================== */}

      <div className="results-toolbar">

        <label className="results-search">

          <FaSearch />

          <input
            type="search"
            placeholder="Search scenarios or categories..."
            value={searchTerm}
            onChange={handleSearchChange}
          />

        </label>


        <div className="results-filters">

          <div className="filter-label">

            <FaFilter />

            <span>
              Filters
            </span>

          </div>


          <select
            value={outcomeFilter}
            onChange={handleOutcomeChange}
            aria-label="Filter by outcome"
          >
            <option value="all">
              All outcomes
            </option>

            <option value="pending">
              Not run
            </option>

            <option value="protected">
              Protected
            </option>

            <option value="mitigated">
              Mitigated
            </option>

            <option value="partial-protection">
              Partial protection
            </option>

            <option value="allowed">
              Correctly allowed
            </option>

            <option value="security-gap">
              Security gaps
            </option>

            <option value="false-positive">
              False positives
            </option>
          </select>


          <select
            value={severityFilter}
            onChange={handleSeverityChange}
            aria-label="Filter by severity"
          >
            <option value="all">
              All severities
            </option>

            <option value="critical">
              Critical
            </option>

            <option value="high">
              High
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="low">
              Low
            </option>
          </select>

        </div>

      </div>


      {/* ======================================
          TABLE
      ====================================== */}

      <div className="results-table-wrapper">

        <table className="results-table">

          <thead>

            <tr>
              <th>Scenario</th>
              <th>Severity</th>
              <th>Expected</th>
              <th>Actual</th>
              <th>Outcome</th>
              <th>Confidence</th>
              <th>Review</th>
              <th aria-label="Actions"></th>
            </tr>

          </thead>


          <tbody>

            {visibleRows.length === 0 ? (

              <tr>

                <td
                  colSpan="8"
                  className="results-empty"
                >
                  No security tests match the
                  selected filters.
                </td>

              </tr>

            ) : (

              visibleRows.map((row) => {

                const {
                  test,
                  result,
                  outcome,
                } = row;


                const isSelected =
                  test.id === selectedTestId;
                const isActive =
                  test.id === activeTestId;

                return (

                  <tr
                    key={test.id}
                    className={[
                        "result-row",
                        isSelected ? "result-row--selected" : "",
                        isActive ? "result-row--running" : "",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                    onClick={() => onSelectTest(test.id)}
                    >

                    <td>

                      <div className="scenario-cell">

                        <strong>
                          {test.name}
                        </strong>

                        <span>
                          {test.category}
                        </span>

                      </div>

                    </td>


                    <td>

                      <span
                        className={`
                          severity-badge
                          severity-badge--${test.severity.toLowerCase()}
                        `}
                      >
                        {test.severity}
                      </span>

                    </td>


                    <td>

                      <span className="decision-value">
                        {test.expectedAction}
                      </span>

                    </td>


                    <td>

                      <span className="decision-value">

                        {result?.actualAction ?? "—"}

                      </span>

                    </td>


                    <td>

                      <span
                        className={`
                          outcome-badge
                          outcome-badge--${outcome.key}
                        `}
                      >
                        {outcome.label}
                      </span>

                    </td>


                    <td>

                      <span className="confidence-value">

                        {result?.confidence != null
                          ? `${result.confidence}%`
                          : "—"}

                      </span>

                    </td>


                    <td>

                      <span
                        className={`
                          review-badge
                          review-badge--${(
                            result?.reviewStatus ??
                            "unreviewed"
                          ).toLowerCase()}
                        `}
                      >

                        {result?.reviewStatus ??
                          "Unreviewed"}

                      </span>

                    </td>


                    <td>

                      <button
                        type="button"
                        className="investigate-button"
                        onClick={(event) => {

                          event.stopPropagation();

                          onSelectTest(test.id);

                        }}
                        aria-label={
                          `Investigate ${test.name}`
                        }
                      >
                        <FaSearchPlus />

                        <span>
                          Investigate
                        </span>
                      </button>

                    </td>

                  </tr>

                );

              })

            )}

          </tbody>

        </table>

      </div>


      {/* ======================================
          PAGINATION
      ====================================== */}

      <div className="results-pagination">

        <span>

          {filteredRows.length === 0
            ? "No results"
            : `Showing ${startIndex + 1}–${Math.min(
                startIndex + TESTS_PER_PAGE,
                filteredRows.length
              )} of ${filteredRows.length}`}

        </span>


        <div className="pagination-controls">

          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={safeCurrentPage === 1}
          >
            <FaChevronLeft />

            <span>
              Previous
            </span>
          </button>


          <span className="page-indicator">

            Page {safeCurrentPage} of {totalPages}

          </span>


          <button
            type="button"
            onClick={goToNextPage}
            disabled={
              safeCurrentPage === totalPages
            }
          >
            <span>
              Next
            </span>

            <FaChevronRight />
          </button>

        </div>

      </div>

    </section>
  );

}


export default SimulationResultsTable;

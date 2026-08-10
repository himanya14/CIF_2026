import { apiRequest } from "./api";

export function runRedTeamTest(test, simulationRunId) {
  return apiRequest("/red-team/test", {
    method: "POST",
    body: JSON.stringify({ test, simulationRunId }),
  });
}

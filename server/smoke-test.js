import process from "node:process";

const port = 4010;
process.env.PORT = String(port);
await import("./index.js");

await new Promise(resolve => setTimeout(resolve, 250));

const health = await fetch(`http://localhost:${port}/api/health`).then(response => response.json());
const inspection = await fetch(`http://localhost:${port}/api/inspect`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: "My Aadhaar is 1234 5678 9012" }),
}).then(response => response.json());
const simulation = await fetch(`http://localhost:${port}/api/red-team/test`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ simulationRunId: "smoke-test", test: { id: "api-key-exposure", name: "API Key Exposure", category: "Credentials", severity: "Critical", expectedAction: "BLOCK", isThreat: true } }),
}).then(response => response.json());

if (health.status !== "ok" || inspection.status !== "cleaned" || !simulation.passed) {
  throw new Error("Backend smoke test failed");
}

console.log(JSON.stringify({ health: health.status, inspection: inspection.status, simulation: simulation.outcome }));
process.exit(0);

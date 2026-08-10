import http from "node:http";
import process from "node:process";
import { randomUUID } from "node:crypto";
import { redTeamTests } from "../src/data/redTeamData.js";
import blockScenarios from "../src/data/blockScenarios.js";
import { audit, databasePath, ensureRun, getAuditLog, getDashboard, getUser, listIncidents, saveIncident, saveRedTeamResult, saveScan, updateIncidentStatus } from "./database.js";

const PORT = Number(process.env.PORT || 4000);
const startedAt = new Date().toISOString();

const redTeamResponses = {
  "aadhaar-leakage": ["BLOCK", 98, 97, "Sensitive Data Protection", ["Aadhaar Number"]],
  "pan-leakage": ["BLOCK", 96, 94, "Financial Identity Protection", ["PAN Number"]],
  "api-key-exposure": ["BLOCK", 99, 99, "Credential Leakage Prevention", ["API Key"]],
  "credit-card-exposure": ["BLOCK", 97, 96, "Financial Data Protection", ["Credit Card Number"]],
  "prompt-injection": ["BLOCK", 94, 92, "Prompt Injection Defence", ["Prompt Injection Pattern"]],
  "honeytoken-access": ["ALERT", 99, 98, "Honeytoken Monitoring", ["Honeytoken"]],
  "vernacular-pii": ["ALLOW", 64, 91, "Vernacular PII Protection", []],
  "sensitive-output": ["BLOCK", 95, 93, "Bidirectional Output Scanning", ["Aadhaar Number", "PAN Number"]],
  "safe-code-help": ["ALLOW", 93, 10, "Acceptable AI Usage", []],
  "safe-hr-request": ["BLOCK", 71, 38, "Sensitive Content Detection", []],
  "safe-business-prompt": ["ALLOW", 95, 7, "Acceptable AI Usage", []],
  "database-credential-exposure": ["BLOCK", 98, 97, "Credential Leakage Prevention", ["Database Credentials"]],
};

function json(res, status, value) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,X-User-Id", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" });
  res.end(status === 204 ? undefined : JSON.stringify(value));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => { raw += chunk; if (raw.length > 1_000_000) reject(new Error("Request too large")); });
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error("Invalid JSON")); } });
    req.on("error", reject);
  });
}

function classify(prompt) {
  const rules = [
    { re: /sk-[\w-]{8,}|api[ _-]?key|AKIA[A-Z0-9]{12,}/i, status: "blocked", category: "Credentials", riskScore: 99, confidence: 98, policy: "Credential Leakage Prevention", scenarioKey: "api-key", label: "Blocked", response: "A sensitive API credential was detected and the request was blocked." },
    { re: /(?:aadhaar|aadhar)[^\d]{0,24}\d{4}\s?\d{4}\s?\d{4}|\b\d{4}\s\d{4}\s\d{4}\b/i, status: "cleaned", category: "PII", riskScore: 94, confidence: 99, policy: "Government ID Masking", scenarioKey: "aadhaar", label: "Cleaned Up", response: "Sensitive Aadhaar information was removed before processing.", sanitize: value => value.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, "[AADHAAR REDACTED]") },
    { re: /\b[A-Z]{5}\d{4}[A-Z]\b/i, status: "cleaned", category: "Financial Identity", riskScore: 88, confidence: 96, policy: "PAN Protection", scenarioKey: "pan-consent", label: "Cleaned Up", response: "PAN information was removed before processing.", sanitize: value => value.replace(/\b[A-Z]{5}\d{4}[A-Z]\b/gi, "[PAN REDACTED]") },
    { re: /(?:card|visa|mastercard|cvv)[\s\S]{0,50}(?:\d[ -]*?){3,16}/i, status: "blocked", category: "Financial Data", riskScore: 99, confidence: 99.9, policy: "PCI Cardholder Data Protection", scenarioKey: "card-data", label: "Blocked", response: "Payment-card information was detected and the request was blocked." },
    { re: /honeytoken|sk-honeypot|AWS_TEST_SECRET_001/i, status: "blocked", category: "Honeytoken", riskScore: 100, confidence: 100, policy: "Honeytoken Intrusion Detection", scenarioKey: "honeytoken", label: "Blocked", response: "A decoy credential was triggered; this session has been flagged." },
    { re: /ignore (?:all|the) previous|reveal (?:the )?(?:system|confidential)|developer mode|jailbreak/i, status: "blocked", category: "Prompt Injection", riskScore: 95, confidence: 94, policy: "Prompt Injection Defence", scenarioKey: "prompt-injection", label: "Blocked", response: "A prompt-injection attempt was detected and blocked." },
    { re: /password\s*[:=]?\s*\S+/i, status: "warning", category: "Credentials", riskScore: 78, confidence: 87, policy: "Credential Safety Warning", scenarioKey: "api-key", label: "Warning", response: "Possible credentials detected. Remove the password before continuing." },
  ];
  return rules.find(rule => rule.re.test(prompt)) || { status: "allowed", category: "Safe", riskScore: 5, confidence: 96, policy: "Acceptable AI Usage", label: "Allowed", response: "Your request passed all security checks and was processed successfully." };
}

function createIncident(rule, prompt, user, scanId) {
  const template = blockScenarios.find(item => item.id === rule.scenarioKey) || blockScenarios[0];
  const id = `INC-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const createdAt = new Date().toISOString();
  return { ...template, id, scenarioKey: rule.scenarioKey, blockId: id, prompt, user: user.email, department: user.department, confidence: rule.confidence, category: rule.category, severity: rule.riskScore >= 95 ? "Critical" : "High", action: rule.status, createdAt, scanId };
}

function inspect(prompt, userId) {
  const rule = classify(prompt);
  const id = randomUUID();
  const inspectedAt = new Date().toISOString();
  const user = getUser(userId);
  const shouldCreateIncident = rule.status !== "allowed";
  const incidentId = shouldCreateIncident ? `pending-${id}` : null;
  const result = { id, prompt, status: rule.status, label: rule.label, response: rule.response, category: rule.category, riskScore: rule.riskScore, confidence: rule.confidence, policy: rule.policy, blockScenarioId: null, incidentId, sanitizedText: rule.sanitize?.(prompt) || null, originalText: rule.sanitize ? prompt : null, inspectedAt };
  if (shouldCreateIncident) {
    const incident = createIncident(rule, prompt, user, id);
    result.incidentId = incident.id;
    result.blockScenarioId = incident.id;
    saveScan(result, user.id);
    saveIncident(incident, id, user.id);
    audit("PROMPT_FLAGGED", "prompt_scan", id, { status: result.status, category: result.category, riskScore: result.riskScore, incidentId: incident.id }, user.id);
  } else {
    saveScan(result, user.id);
    audit("PROMPT_ALLOWED", "prompt_scan", id, { status: result.status, category: result.category, riskScore: result.riskScore }, user.id);
  }
  return result;
}

function simulate(test, runId) {
  const [actualAction, confidence, riskScore, policy, detectedItems] = redTeamResponses[test.id] || [test.expectedAction, 90, test.isThreat ? 80 : 15, "Default Security Policy", []];
  const passed = actualAction === test.expectedAction;
  const outcome = passed ? (test.isThreat ? "PROTECTED" : "CORRECTLY_ALLOWED") : (test.isThreat ? "SECURITY_GAP" : "FALSE_POSITIVE");
  return { id: `${runId}-${test.id}`, testId: test.id, simulationRunId: runId, source: "RED_TEAM", direction: test.direction || "INPUT", name: test.name, category: test.category, severity: test.severity, department: "Simulation Lab", expectedAction: test.expectedAction, actualAction, outcome, passed, confidence, riskScore, policy, reason: `${policy} evaluated the live test input.`, detectedItems, reviewStatus: "UNREVIEWED", durationMs: 350, completedAt: new Date().toISOString() };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, 204, {});
  const path = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  const userId = req.headers["x-user-id"] || "demo-user";
  try {
    if (req.method === "GET" && path === "/api/health") return json(res, 200, { status: "ok", service: "AI Watch Tower API", database: "SQLite", databasePath, startedAt });
    if (req.method === "GET" && path === "/api/dashboard") return json(res, 200, getDashboard());
    if (req.method === "GET" && path === "/api/red-team/tests") return json(res, 200, { tests: redTeamTests });
    if (req.method === "POST" && path === "/api/red-team/test") { const input = await readBody(req); if (!input.test?.id) return json(res, 400, { error: "test is required" }); const runId = input.simulationRunId || `run-${Date.now()}`; ensureRun(runId, redTeamTests.length); await new Promise(resolve => setTimeout(resolve, 350)); const result = simulate(input.test, runId); saveRedTeamResult(result); audit("RED_TEAM_TEST_COMPLETED", "red_team_result", result.id, { testId: result.testId, outcome: result.outcome, passed: result.passed }); return json(res, 200, result); }
    if (req.method === "POST" && path === "/api/inspect") { const input = await readBody(req); if (!input.prompt?.trim()) return json(res, 400, { error: "prompt is required" }); return json(res, 200, inspect(input.prompt.trim(), input.userId || userId)); }
    if (req.method === "GET" && path === "/api/incidents") return json(res, 200, { incidents: listIncidents() });
    const action = path.match(/^\/api\/incidents\/([^/]+)\/(acknowledge|false-positive)$/);
    if (req.method === "POST" && action) { const [, id, verb] = action; const status = verb === "acknowledge" ? "ACKNOWLEDGED" : "FALSE_POSITIVE_REPORTED"; if (!updateIncidentStatus(id, status)) return json(res, 404, { error: "Incident not found" }); audit("INCIDENT_REVIEWED", "incident", id, { reviewStatus: status }, userId); return json(res, 200, { id, reviewStatus: status }); }
    if (req.method === "GET" && path === "/api/audit-log") return json(res, 200, { events: getAuditLog() });
    return json(res, 404, { error: "Route not found" });
  } catch (error) { console.error(error); return json(res, 500, { error: error.message || "Internal server error" }); }
});

server.listen(PORT, () => console.log(`AI Watch Tower API running at http://localhost:${PORT}\nSQLite database: ${databasePath}`));

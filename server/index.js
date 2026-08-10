import http from "node:http";
import process from "node:process";
import { randomUUID } from "node:crypto";
import blockScenarios from "../src/data/blockScenarios.js";
import { audit, createRedTeamTest, databasePath, ensureRun, getAuditLog, getDashboard, getUser, listIncidents, listRedTeamTests, saveIncident, saveRedTeamResult, saveScan, updateIncidentStatus } from "./database.js";

const PORT = Number(process.env.PORT || 4000);
const startedAt = new Date().toISOString();

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
  const departmentRules = [
    { department: "Finance", re: /\b(cvv|card number|credit card|debit card|pan|bank|account number|ifsc|upi|payment|salary|payroll|tax|invoice|refund|transaction|loan|investment)\b/i },
    { department: "IT", re: /\b(api key|access key|secret key|password|credential|token|aws|azure|database|server|source code|github|gitlab|ssh|private key|deployment|devops|cloud|jailbreak|prompt injection)\b/i },
    { department: "HR", re: /\b(aadhaar|aadhar|employee|candidate|resume|recruitment|leave|attendance|onboarding|date of birth|dob|offer letter|performance review)\b/i },
    { department: "Legal", re: /\b(contract|nda|legal|lawsuit|litigation|agreement|clause|compliance|regulation|consent|policy violation)\b/i },
    { department: "Operations", re: /\b(vendor|supplier|inventory|logistics|shipment|warehouse|procurement|operations|supply chain)\b/i },
    { department: "Marketing", re: /\b(campaign|marketing|advertisement|customer list|lead list|social media|brand|promotion|seo)\b/i },
  ];
  const detectedDepartment = departmentRules.find(item => item.re.test(prompt))?.department || "General";
  const containsAadhaar = /(?:aadhaar|aadhar)[^\d]{0,24}\d{4}\s?\d{4}\s?\d{4}/i.test(prompt);
  const containsPan = /\b[A-Z]{5}\d{4}[A-Z]\b/i.test(prompt);
  const containsPhone = /(?:\+91[\s-]?)?[6-9]\d{9}\b/.test(prompt);
  const containsEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(prompt);

  if (containsAadhaar || containsPan || containsPhone || containsEmail) {
    const detectedItems = [
      containsAadhaar && "Aadhaar Number",
      containsPan && "PAN Number",
      containsPhone && "Phone Number",
      containsEmail && "Email Address",
    ].filter(Boolean);
    const category = detectedItems.length > 1
      ? "Sensitive Personal Data"
      : containsPan
        ? "Financial Identity"
        : containsAadhaar
          ? "Personal Identity"
          : "Personal Contact Data";
    return {
      department: containsAadhaar ? "HR" : containsPan ? "Finance" : detectedDepartment === "General" ? "HR" : detectedDepartment,
      status: "cleaned",
      category,
      riskScore: containsAadhaar || containsPan ? 94 : 82,
      confidence: 99,
      policy: "Multi-field Personal Data Protection",
      scenarioKey: containsPan && !containsAadhaar ? "pan-consent" : "aadhaar",
      label: "Cleaned Up",
      response: `${detectedItems.join(", ")} ${detectedItems.length === 1 ? "was" : "were"} removed before processing.`,
      sanitize: value => value
        .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, "[AADHAAR REDACTED]")
        .replace(/\b[A-Z]{5}\d{4}[A-Z]\b/gi, "[PAN REDACTED]")
        .replace(/(?:\+91[\s-]?)?[6-9]\d{9}\b/g, "[PHONE REDACTED]")
        .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[EMAIL REDACTED]"),
    };
  }
  const rules = [
    { re: /honeytoken|sk-honeypot|AWS_TEST_SECRET_001/i, department: "IT", status: "blocked", category: "Honeytoken", riskScore: 100, confidence: 100, policy: "Honeytoken Intrusion Detection", scenarioKey: "honeytoken", label: "Blocked", response: "A decoy credential was triggered; this session has been flagged." },
    { re: /(?:card|visa|mastercard|cvv)[\s\S]{0,60}(?:\d[ -]*?){3,16}|\b(?:\d[ -]*?){13,19}\b[\s\S]{0,30}\bcvv\b/i, department: "Finance", status: "blocked", category: "Financial Data", riskScore: 99, confidence: 99.9, policy: "PCI Cardholder Data Protection", scenarioKey: "card-data", label: "Blocked", response: "Payment-card information was detected and the request was blocked." },
    { re: /sk-[\w-]{8,}|AKIA[A-Z0-9]{12,}|gh[pousr]_[A-Za-z0-9_]{8,}|github_pat_[A-Za-z0-9_]{8,}|xox[baprs]-[A-Za-z0-9-]{8,}|AIza[A-Za-z0-9_-]{20,}|sk_(?:live|test)_[A-Za-z0-9]{8,}|eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}|(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[^\s:]+:[^\s@]+@|api[ _-]?key\s*(?:[:=]|is)\s*\S+|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/i, department: "IT", status: "blocked", category: "Credentials", riskScore: 99, confidence: 98, policy: "Credential Leakage Prevention", scenarioKey: "api-key", label: "Blocked", response: "A sensitive technical credential or access token was detected and the request was blocked." },
    { re: /ignore (?:all|the) previous|reveal (?:the )?(?:system|confidential)|developer mode|jailbreak/i, department: "IT", status: "blocked", category: "Prompt Injection", riskScore: 95, confidence: 94, policy: "Prompt Injection Defence", scenarioKey: "prompt-injection", label: "Blocked", response: "A prompt-injection attempt was detected and blocked." },
    { re: /password\s*(?:[:=]|is)\s*\S+|(?:username|user)\s*[:=]\s*\S+[\s\S]{0,40}password\s*(?:[:=]|is)\s*\S+/i, department: "IT", status: "blocked", category: "Credentials", riskScore: 97, confidence: 96, policy: "Database Credential Protection", scenarioKey: "api-key", label: "Blocked", response: "A password value was detected and the request was blocked." },
  ];
  const matchedRule = rules.find(rule => rule.re.test(prompt));
  return matchedRule || { department: detectedDepartment, status: "allowed", category: "Safe Business Request", riskScore: 5, confidence: 96, policy: "Acceptable AI Usage", label: "Allowed", response: "Your request passed all security checks and was processed successfully." };
}

function createIncident(rule, prompt, user, scanId) {
  const template = blockScenarios.find(item => item.id === rule.scenarioKey) || blockScenarios[0];
  const templateData = { ...template };
  delete templateData.user;
  delete templateData.sourceApp;
  const id = `INC-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const createdAt = new Date().toISOString();
  return { ...templateData, id, scenarioKey: rule.scenarioKey, blockId: id, prompt, department: rule.department, confidence: rule.confidence, category: rule.category, severity: rule.riskScore >= 95 ? "Critical" : "High", action: rule.status, createdAt, scanId };
}

function inspect(prompt, userId) {
  const rule = classify(prompt);
  const id = randomUUID();
  const inspectedAt = new Date().toISOString();
  const user = getUser(userId);
  const shouldCreateIncident = rule.status !== "allowed";
  const incidentId = shouldCreateIncident ? `pending-${id}` : null;
  const result = { id, prompt, status: rule.status, label: rule.label, response: rule.response, category: rule.category, department: rule.department, riskScore: rule.riskScore, confidence: rule.confidence, policy: rule.policy, blockScenarioId: null, incidentId, sanitizedText: rule.sanitize?.(prompt) || null, originalText: rule.sanitize ? prompt : null, inspectedAt };
  if (shouldCreateIncident) {
    const incident = createIncident(rule, prompt, user, id);
    result.incidentId = incident.id;
    result.blockScenarioId = incident.id;
    saveScan(result, user.id);
    saveIncident(incident, id, user.id);
    audit("PROMPT_FLAGGED", "prompt_scan", id, { status: result.status, category: result.category, department: result.department, riskScore: result.riskScore, incidentId: incident.id }, user.id);
  } else {
    saveScan(result, user.id);
    audit("PROMPT_ALLOWED", "prompt_scan", id, { status: result.status, category: result.category, department: result.department, riskScore: result.riskScore }, user.id);
  }
  return result;
}

function simulate(test, runId) {
  const decision = classify(test.prompt);
  const actualAction = decision.category === "Honeytoken"
    ? "ALERT"
    : decision.status === "blocked"
      ? "BLOCK"
      : decision.status === "cleaned"
        ? "SANITIZE"
        : decision.status === "warning"
          ? "WARN"
          : "ALLOW";
  const { confidence, riskScore, policy } = decision;
  const detectedItems = decision.category === "Safe Business Request" ? [] : [decision.category];
  let passed = false;
  let outcome;
  if (test.expectedAction === "ALLOW") {
    passed = actualAction === "ALLOW";
    outcome = passed ? "CORRECTLY_ALLOWED" : "FALSE_POSITIVE";
  } else if (actualAction === test.expectedAction) {
    passed = true;
    outcome = "PROTECTED";
  } else if (test.expectedAction === "BLOCK" && actualAction === "SANITIZE") {
    passed = true;
    outcome = "MITIGATED";
  } else if (test.expectedAction === "BLOCK" && actualAction === "WARN") {
    outcome = "PARTIAL_PROTECTION";
  } else if (actualAction === "ALLOW") {
    outcome = "SECURITY_GAP";
  } else {
    outcome = "PARTIAL_PROTECTION";
  }
  return { id: `${runId}-${test.id}`, testId: test.id, simulationRunId: runId, source: "RED_TEAM", direction: test.direction || "INPUT", name: test.name, category: decision.category, severity: test.severity, department: decision.department, expectedAction: test.expectedAction, actualAction, outcome, passed, confidence, riskScore, policy, reason: `${policy} evaluated the custom prompt through the live firewall.`, detectedItems, reviewStatus: "UNREVIEWED", durationMs: 350, completedAt: new Date().toISOString() };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, 204, {});
  const path = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  const userId = req.headers["x-user-id"] || "demo-user";
  try {
    if (req.method === "GET" && path === "/api/health") return json(res, 200, { status: "ok", service: "AI Watch Tower API", database: "SQLite", databasePath, startedAt });
    if (req.method === "GET" && path === "/api/dashboard") return json(res, 200, getDashboard());
    if (req.method === "GET" && path === "/api/red-team/tests") return json(res, 200, { tests: listRedTeamTests() });
    if (req.method === "POST" && path === "/api/red-team/tests") { const input = await readBody(req); if (!input.name?.trim() || !input.prompt?.trim() || !input.category?.trim() || !["ALLOW","BLOCK","SANITIZE","ALERT","WARN"].includes(input.expectedAction)) return json(res, 400, { error: "name, prompt, category and a valid expectedAction are required" }); return json(res, 201, { test: createRedTeamTest(input) }); }
    if (req.method === "POST" && path === "/api/red-team/test") { const input = await readBody(req); if (!input.test?.id) return json(res, 400, { error: "test is required" }); const runId = input.simulationRunId || `run-${Date.now()}`; ensureRun(runId, listRedTeamTests().length); await new Promise(resolve => setTimeout(resolve, 350)); const result = simulate(input.test, runId); saveRedTeamResult(result); audit("RED_TEAM_TEST_COMPLETED", "red_team_result", result.id, { testId: result.testId, outcome: result.outcome, passed: result.passed, department: result.department }); return json(res, 200, result); }
    if (req.method === "POST" && path === "/api/inspect") { const input = await readBody(req); if (!input.prompt?.trim()) return json(res, 400, { error: "prompt is required" }); return json(res, 200, inspect(input.prompt.trim(), input.userId || userId)); }
    if (req.method === "GET" && path === "/api/incidents") return json(res, 200, { incidents: listIncidents() });
    const action = path.match(/^\/api\/incidents\/([^/]+)\/(acknowledge|false-positive)$/);
    if (req.method === "POST" && action) { const [, id, verb] = action; const status = verb === "acknowledge" ? "ACKNOWLEDGED" : "FALSE_POSITIVE_REPORTED"; if (!updateIncidentStatus(id, status)) return json(res, 404, { error: "Incident not found" }); audit("INCIDENT_REVIEWED", "incident", id, { reviewStatus: status }, userId); return json(res, 200, { id, reviewStatus: status }); }
    if (req.method === "GET" && path === "/api/audit-log") return json(res, 200, { events: getAuditLog() });
    return json(res, 404, { error: "Route not found" });
  } catch (error) { console.error(error); return json(res, 500, { error: error.message || "Internal server error" }); }
});

server.listen(PORT, () => console.log(`AI Watch Tower API running at http://localhost:${PORT}\nSQLite database: ${databasePath}`));

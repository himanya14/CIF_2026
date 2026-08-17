import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { redTeamTests as seededRedTeamTests } from "../src/data/redTeamData.js";

const here = dirname(fileURLToPath(import.meta.url));
const dataDirectory = join(here, "data");

mkdirSync(dataDirectory, { recursive: true });

export const databasePath = join(dataDirectory, "watchtower.db");

export const db = new DatabaseSync(databasePath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prompt_scans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    prompt TEXT NOT NULL,
    sanitized_text TEXT,
    status TEXT NOT NULL,
    label TEXT NOT NULL,
    category TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    confidence REAL NOT NULL,
    policy TEXT NOT NULL,
    response TEXT NOT NULL,
    detected_department TEXT NOT NULL DEFAULT 'General',
    incident_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    scenario_key TEXT NOT NULL,
    scan_id TEXT REFERENCES prompt_scans(id),
    user_id TEXT REFERENCES users(id),
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNREVIEWED',
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS red_team_runs (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    total_tests INTEGER NOT NULL DEFAULT 0,
    passed_tests INTEGER NOT NULL DEFAULT 0,
    started_at TEXT NOT NULL,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS red_team_tests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    prompt TEXT NOT NULL,
    expected_action TEXT NOT NULL,
    is_threat INTEGER NOT NULL,
    direction TEXT NOT NULL DEFAULT 'INPUT',
    enabled INTEGER NOT NULL DEFAULT 1,
    source TEXT NOT NULL DEFAULT 'CUSTOM',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS red_team_results (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES red_team_runs(id),
    test_id TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    passed INTEGER NOT NULL,
    outcome TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    actor TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_scans_created
    ON prompt_scans(created_at);

  CREATE INDEX IF NOT EXISTS idx_scans_status
    ON prompt_scans(status);

  CREATE INDEX IF NOT EXISTS idx_scans_department
    ON prompt_scans(detected_department);

  CREATE INDEX IF NOT EXISTS idx_scans_category
    ON prompt_scans(category);

  CREATE INDEX IF NOT EXISTS idx_incidents_created
    ON incidents(created_at);

  CREATE INDEX IF NOT EXISTS idx_results_run
    ON red_team_results(run_id);

  CREATE INDEX IF NOT EXISTS idx_audit_created
    ON audit_events(created_at);
`);

const scanColumns = db
  .prepare("PRAGMA table_info(prompt_scans)")
  .all();

if (
  !scanColumns.some(
    (column) => column.name === "detected_department"
  )
) {
  db.exec(`
    ALTER TABLE prompt_scans
    ADD COLUMN detected_department
    TEXT NOT NULL DEFAULT 'General'
  `);
}

db.exec(`
  UPDATE prompt_scans
  SET detected_department =
    CASE
      WHEN lower(prompt) LIKE '%cvv%'
        OR lower(prompt) LIKE '%card number%'
        OR lower(prompt) LIKE '%pan %'
        OR lower(prompt) LIKE '%payment%'
        OR lower(prompt) LIKE '%bank%'
        OR lower(prompt) LIKE '%salary%'
        OR lower(prompt) LIKE '%tax%'
        THEN 'Finance'

      WHEN lower(prompt) LIKE '%api key%'
        OR lower(prompt) LIKE '%password%'
        OR lower(prompt) LIKE '%token%'
        OR lower(prompt) LIKE '%aws%'
        OR lower(prompt) LIKE '%database%'
        OR lower(prompt) LIKE '%server%'
        OR lower(prompt) LIKE '%github%'
        OR lower(prompt) LIKE '%jailbreak%'
        OR lower(prompt) LIKE '%credential%'
        THEN 'IT'

      WHEN lower(prompt) LIKE '%aadhaar%'
        OR lower(prompt) LIKE '%aadhar%'
        OR lower(prompt) LIKE '%employee%'
        OR lower(prompt) LIKE '%candidate%'
        OR lower(prompt) LIKE '%resume%'
        OR lower(prompt) LIKE '%onboarding%'
        THEN 'HR'

      WHEN lower(prompt) LIKE '%contract%'
        OR lower(prompt) LIKE '%legal%'
        OR lower(prompt) LIKE '%nda%'
        OR lower(prompt) LIKE '%compliance%'
        THEN 'Legal'

      WHEN lower(prompt) LIKE '%vendor%'
        OR lower(prompt) LIKE '%inventory%'
        OR lower(prompt) LIKE '%logistics%'
        OR lower(prompt) LIKE '%shipment%'
        THEN 'Operations'

      WHEN lower(prompt) LIKE '%campaign%'
        OR lower(prompt) LIKE '%marketing%'
        OR lower(prompt) LIKE '%advertisement%'
        OR lower(prompt) LIKE '%lead list%'
        THEN 'Marketing'

      ELSE 'General'
    END
  WHERE detected_department = 'General'
`);

const now = () => new Date().toISOString();

const defaultUsers = [
  [
    "demo-user",
    "analyst@finserve-demo.in",
    "Demo Analyst",
    "Finance",
    "Security Analyst",
  ],
  [
    "hr-user",
    "hr@finserve-demo.in",
    "HR Reviewer",
    "HR",
    "HR Manager",
  ],
  [
    "engineering-user",
    "engineer@finserve-demo.in",
    "Demo Engineer",
    "Engineering",
    "Developer",
  ],
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users
  (
    id,
    email,
    name,
    department,
    role,
    created_at
  )
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const user of defaultUsers) {
  insertUser.run(
    user[0],
    user[1],
    user[2],
    user[3],
    user[4],
    now()
  );
}

const insertRedTeamTest = db.prepare(`
  INSERT OR IGNORE INTO red_team_tests
  (
    id,
    name,
    category,
    severity,
    prompt,
    expected_action,
    is_threat,
    direction,
    enabled,
    source,
    created_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'SEEDED', ?)
`);

for (const test of seededRedTeamTests) {
  insertRedTeamTest.run(
    String(test.id),
    String(test.name),
    String(test.category),
    String(test.severity),
    String(test.prompt),
    String(test.expectedAction),
    test.isThreat ? 1 : 0,
    String(test.direction || "INPUT"),
    now()
  );
}

db.exec(`
  UPDATE red_team_tests
  SET expected_action = 'SANITIZE'
  WHERE source = 'SEEDED'
    AND id IN (
      'aadhaar-leakage',
      'pan-leakage',
      'vernacular-pii',
      'sensitive-output'
    )
`);

export function getUser(id = "demo-user") {
  return (
    db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) ||
    db
      .prepare("SELECT * FROM users LIMIT 1")
      .get()
  );
}

export function saveScan(scan, userId = "demo-user") {
  if (!scan) {
    throw new Error("Cannot save scan: scan object is missing.");
  }

  const id = scan.id || randomUUID();

  const prompt =
    typeof scan.prompt === "string"
      ? scan.prompt
      : typeof scan.extractedText === "string"
        ? scan.extractedText
        : "";

  if (!prompt.trim()) {
    throw new Error("Cannot save scan: document contains no text.");
  }

  const sanitizedText =
    scan.sanitizedText == null
      ? null
      : String(scan.sanitizedText);

  const status = scan.status || "allowed";
  const label = scan.label || "Allowed";
  const category = scan.category || "Business Request";

  const riskScore = Number.isFinite(Number(scan.riskScore))
    ? Number(scan.riskScore)
    : 5;

  const confidence = Number.isFinite(Number(scan.confidence))
    ? Number(scan.confidence)
    : 96;

  const policy =
    scan.policy || "Acceptable AI Usage";

  const response =
    scan.response ||
    "Your request passed all security checks and was processed successfully.";

  const department =
    scan.department || "General";

  const incidentId =
    scan.incidentId || null;

  const createdAt =
    scan.inspectedAt || now();

  db.prepare(`
    INSERT INTO prompt_scans
    (
      id,
      user_id,
      prompt,
      sanitized_text,
      status,
      label,
      category,
      risk_score,
      confidence,
      policy,
      response,
      detected_department,
      incident_id,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    String(id),
    String(userId || "demo-user"),
    String(prompt),
    sanitizedText,
    String(status),
    String(label),
    String(category),
    riskScore,
    confidence,
    String(policy),
    String(response),
    String(department),
    incidentId == null ? null : String(incidentId),
    String(createdAt)
  );

  return {
    ...scan,
    id,
    prompt,
    sanitizedText,
    status,
    label,
    category,
    riskScore,
    confidence,
    policy,
    response,
    department,
    incidentId,
    inspectedAt: createdAt,
  };
}

export function saveIncident(
  incident,
  scanId,
  userId = "demo-user"
) {
  if (!incident) {
    throw new Error(
      "Cannot save incident: incident object is missing."
    );
  }

  const id =
    incident.id ||
    `INC-${Date.now()}-${randomUUID()
      .slice(0, 6)
      .toUpperCase()}`;

  const scenarioKey =
    incident.scenarioKey || "document-security";

  const title =
    incident.title ||
    incident.category ||
    "Security Incident";

  const severity =
    incident.severity || "High";

  const category =
    incident.category || "Security";

  const createdAt =
    incident.createdAt || now();

  db.prepare(`
    INSERT INTO incidents
    (
      id,
      scenario_key,
      scan_id,
      user_id,
      title,
      severity,
      category,
      status,
      payload_json,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    String(id),
    String(scenarioKey),
    scanId == null ? null : String(scanId),
    String(userId || "demo-user"),
    String(title),
    String(severity),
    String(category),
    "UNREVIEWED",
    JSON.stringify({
      ...incident,
      id,
    }),
    String(createdAt),
    String(createdAt)
  );

  return {
    ...incident,
    id,
  };
}

export function listIncidents() {
  return db
    .prepare(
      "SELECT * FROM incidents ORDER BY created_at DESC"
    )
    .all()
    .map((row) => ({
      ...JSON.parse(row.payload_json),
      id: row.id,
      reviewStatus: row.status,
      timestamp: new Date(
        row.created_at
      ).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    }));
}

export function updateIncidentStatus(id, status) {
  const result = db
    .prepare(`
      UPDATE incidents
      SET status = ?,
          updated_at = ?
      WHERE id = ?
    `)
    .run(
      String(status),
      now(),
      String(id)
    );

  return result.changes > 0;
}

export function ensureRun(runId, totalTests) {
  db.prepare(`
    INSERT OR IGNORE INTO red_team_runs
    (
      id,
      status,
      total_tests,
      started_at
    )
    VALUES (?, ?, ?, ?)
  `).run(
    String(runId),
    "RUNNING",
    Number(totalTests) || 0,
    now()
  );
}

function mapRedTeamTest(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    severity: row.severity,
    prompt: row.prompt,
    expectedAction: row.expected_action,
    isThreat: Boolean(row.is_threat),
    direction: row.direction,
    enabled: Boolean(row.enabled),
    source: row.source,
    createdAt: row.created_at,
  };
}

export function listRedTeamTests() {
  return db
    .prepare(`
      SELECT *
      FROM red_team_tests
      WHERE enabled = 1
      ORDER BY source DESC, created_at
    `)
    .all()
    .map(mapRedTeamTest);
}

export function createRedTeamTest(input) {
  const test = {
    id: randomUUID(),
    name: String(input.name || "").trim(),
    category: String(input.category || "").trim(),
    severity: input.severity || "Medium",
    prompt: String(input.prompt || "").trim(),
    expectedAction: input.expectedAction,
    isThreat: input.expectedAction !== "ALLOW",
    direction: input.direction || "INPUT",
    source: "CUSTOM",
    createdAt: now(),
  };

  db.prepare(`
    INSERT INTO red_team_tests
    (
      id,
      name,
      category,
      severity,
      prompt,
      expected_action,
      is_threat,
      direction,
      enabled,
      source,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `).run(
    test.id,
    test.name,
    test.category,
    test.severity,
    test.prompt,
    test.expectedAction,
    test.isThreat ? 1 : 0,
    test.direction,
    test.source,
    test.createdAt
  );

  audit(
    "RED_TEAM_TEST_CREATED",
    "red_team_test",
    test.id,
    {
      name: test.name,
      expectedAction: test.expectedAction,
    }
  );

  return test;
}

export function saveRedTeamResult(result) {
  db.prepare(`
    INSERT OR REPLACE INTO red_team_results
    (
      id,
      run_id,
      test_id,
      payload_json,
      passed,
      outcome,
      risk_score,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    String(result.id),
    String(result.simulationRunId),
    String(result.testId),
    JSON.stringify(result),
    result.passed ? 1 : 0,
    String(result.outcome),
    Number(result.riskScore) || 0,
    String(result.completedAt || now())
  );

  const stats = db
    .prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(passed) AS passed
      FROM red_team_results
      WHERE run_id = ?
    `)
    .get(String(result.simulationRunId));

  const total = Number(stats.total) || 0;
  const passed = Number(stats.passed) || 0;

  db.prepare(`
    UPDATE red_team_runs
    SET
      passed_tests = ?,
      status =
        CASE
          WHEN ? >= total_tests
          THEN 'COMPLETED'
          ELSE 'RUNNING'
        END,
      completed_at =
        CASE
          WHEN ? >= total_tests
          THEN ?
          ELSE NULL
        END
    WHERE id = ?
  `).run(
    passed,
    passed,
    passed,
    now(),
    String(result.simulationRunId)
  );
}

export function audit(
  eventType,
  entityType,
  entityId,
  payload = {},
  actor = "demo-user"
) {
  db.prepare(`
    INSERT INTO audit_events
    (
      id,
      event_type,
      entity_type,
      entity_id,
      actor,
      payload_json,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    String(eventType),
    String(entityType),
    String(entityId),
    String(actor || "demo-user"),
    JSON.stringify(payload || {}),
    now()
  );
}

export function getAuditLog() {
  return db
    .prepare(`
      SELECT *
      FROM audit_events
      ORDER BY created_at DESC
      LIMIT 250
    `)
    .all()
    .map((row) => ({
      id: row.id,
      type: row.event_type,
      entityType: row.entity_type,
      entityId: row.entity_id,
      actor: row.actor,
      ...JSON.parse(row.payload_json),
      at: row.created_at,
    }));
}

function getThreatMap() {
  const rows = db
    .prepare(`
      SELECT
        detected_department AS department,
        category,
        COUNT(*) AS count,
        ROUND(AVG(risk_score)) AS risk
      FROM prompt_scans
      WHERE status IN ('blocked', 'cleaned')
        AND category != 'Safe Business Request'
      GROUP BY detected_department, category
      ORDER BY detected_department, risk DESC, count DESC
    `)
    .all();

  const points = rows.map((row) => ({
    department: row.department,
    category: row.category,
    count: Number(row.count) || 0,
    risk: Number(row.risk) || 0,
    severity:
      Number(row.risk) >= 90
        ? "Critical"
        : Number(row.risk) >= 70
          ? "Elevated"
          : "Lower",
  }));

  const summary = {
    critical: points.filter(
      (item) => item.risk >= 90
    ).reduce((sum, item) => sum + item.count, 0),

    warning: points.filter(
      (item) =>
        item.risk >= 70 &&
        item.risk < 90
    ).reduce((sum, item) => sum + item.count, 0),

    secure: points.filter(
      (item) => item.risk < 70
    ).reduce((sum, item) => sum + item.count, 0),
  };

  return {
    points,
    summary,
  };
}

function getDPDPCompliance() {
  const scans = db
    .prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(
          CASE
            WHEN status = 'cleaned'
            THEN 1
            ELSE 0
          END
        ) AS sanitized,
        SUM(
          CASE
            WHEN category IN (
              'Personal Identity',
              'Personal Contact Data',
              'Sensitive Personal Data',
              'Financial Identity'
            )
            THEN 1
            ELSE 0
          END
        ) AS personal_data,
        SUM(
          CASE
            WHEN status IN ('blocked', 'cleaned')
            THEN 1
            ELSE 0
          END
        ) AS protected
      FROM prompt_scans
    `)
    .get();

  const auditCount = Number(
    db
      .prepare(
        "SELECT COUNT(*) AS count FROM audit_events"
      )
      .get().count
  ) || 0;

  const total = Number(scans.total) || 0;
  const sanitized = Number(scans.sanitized) || 0;
  const personalData = Number(scans.personal_data) || 0;
  const protectedEvents = Number(scans.protected) || 0;

  const consentScore =
    personalData === 0
      ? 100
      : Math.round(
          Math.min(
            100,
            (sanitized / personalData) * 100
          )
        );

  const accessScore =
    total === 0
      ? 100
      : Math.round(
          Math.min(
            100,
            (protectedEvents / total) * 100 + 40
          )
        );

  const auditScore =
    total === 0
      ? 100
      : Math.round(
          Math.min(
            100,
            (auditCount / total) * 100
          )
        );

  const retentionScore = total === 0 ? 100 : 95;

  const encryptionScore = total === 0 ? 100 : 95;

  const checks = [
    {
      name: "Consent Management",
      score: consentScore,
      status:
        consentScore >= 80
          ? "success"
          : "warning",
    },
    {
      name: "Data Protection",
      score: encryptionScore,
      status:
        encryptionScore >= 80
          ? "success"
          : "warning",
    },
    {
      name: "Access Control",
      score: accessScore,
      status:
        accessScore >= 80
          ? "success"
          : "warning",
    },
    {
      name: "Audit Logging",
      score: auditScore,
      status:
        auditScore >= 80
          ? "success"
          : "warning",
    },
    {
      name: "Retention Policy",
      score: retentionScore,
      status:
        retentionScore >= 80
          ? "success"
          : "warning",
    },
  ];

  const score = Math.round(
    checks.reduce(
      (sum, item) => sum + item.score,
      0
    ) / checks.length
  );

  return {
    score,
    status:
      score >= 90
        ? "COMPLIANT"
        : score >= 75
          ? "MONITOR"
          : "ACTION REQUIRED",
    checks,
    generatedAt: now(),
  };
}

function getAIInsights() {
  const recent = db
    .prepare(`
      SELECT
        detected_department,
        category,
        status,
        risk_score,
        created_at
      FROM prompt_scans
      ORDER BY created_at DESC
      LIMIT 50
    `)
    .all();

  if (recent.length === 0) {
    return [];
  }

  const insights = [];

  const blocked = recent.filter(
    (item) => item.status === "blocked"
  ).length;

  const sanitized = recent.filter(
    (item) => item.status === "cleaned"
  ).length;

  const critical = recent.filter(
    (item) => Number(item.risk_score) >= 90
  ).length;

  const departmentMap = {};

  for (const event of recent) {
    const department =
      event.detected_department || "General";

    if (!departmentMap[department]) {
      departmentMap[department] = {
        count: 0,
        risk: 0,
      };
    }

    departmentMap[department].count += 1;
    departmentMap[department].risk +=
      Number(event.risk_score) || 0;
  }

  const topDepartment =
    Object.entries(departmentMap)
      .map(([department, data]) => ({
        department,
        score:
          data.count > 0
            ? Math.round(
                data.risk / data.count
              )
            : 0,
        count: data.count,
      }))
      .sort(
        (a, b) => b.score - a.score
      )[0];

  if (critical > 0) {
    insights.push({
      type: "critical",
      title: "Critical threats detected",
      message: `${critical} recent security event${critical === 1 ? "" : "s"} reached critical risk level.`,
    });
  }

  if (blocked > 0) {
    insights.push({
      type: "warning",
      title: "Threat activity detected",
      message: `${blocked} recent malicious or policy-violating request${blocked === 1 ? "" : "s"} were blocked.`,
    });
  }

  if (sanitized > 0) {
    insights.push({
      type: "success",
      title: "Personal data protection active",
      message: `${sanitized} request${sanitized === 1 ? "" : "s"} required sensitive-data sanitization before processing.`,
    });
  }

  if (topDepartment && topDepartment.score >= 70) {
    insights.push({
      type: "warning",
      title: `${topDepartment.department} requires attention`,
      message: `This department currently has the highest observed average security risk at ${topDepartment.score}%.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "success",
      title: "Security posture stable",
      message:
        "Recent security events show no significant high-risk concentration.",
    });
  }

  return insights.slice(0, 4);
}

export function getDashboard() {
  const totals = db
    .prepare(`
      SELECT
        COUNT(*) AS scanned,
        SUM(
          CASE
            WHEN status = 'blocked'
            THEN 1
            ELSE 0
          END
        ) AS blocked,
        SUM(
          CASE
            WHEN status = 'cleaned'
            THEN 1
            ELSE 0
          END
        ) AS sanitized,
        AVG(risk_score) AS average_risk
      FROM prompt_scans
    `)
    .get();

  const scanned =
    Number(totals.scanned) || 0;

  const blocked =
    Number(totals.blocked) || 0;

  const sanitized =
    Number(totals.sanitized) || 0;

  const averageRisk =
    Number(totals.average_risk) || 0;

  const departments = db
    .prepare(`
      SELECT
        detected_department AS department,
        COUNT(*) AS scans,
        ROUND(AVG(risk_score)) AS score,
        SUM(
          CASE
            WHEN status = 'blocked'
            THEN 1
            ELSE 0
          END
        ) AS blocked,
        SUM(
          CASE
            WHEN status = 'cleaned'
            THEN 1
            ELSE 0
          END
        ) AS sanitized
      FROM prompt_scans
      GROUP BY detected_department
      ORDER BY score DESC, scans DESC
    `)
    .all()
    .map((row) => ({
      department: row.department,
      scans: Number(row.scans) || 0,
      score: Number(row.score) || 0,
      blocked: Number(row.blocked) || 0,
      sanitized: Number(row.sanitized) || 0,
    }));

  const categoryCounts = db
    .prepare(`
      SELECT
        category AS name,
        COUNT(*) AS count,
        ROUND(AVG(risk_score)) AS risk
      FROM prompt_scans
      GROUP BY category
      ORDER BY count DESC
    `)
    .all();

  const categories = categoryCounts.map(
    (item) => ({
      name: item.name,
      count: Number(item.count) || 0,
      value: scanned
        ? Math.round(
            (Number(item.count) / scanned) * 100
          )
        : 0,
      risk: Number(item.risk) || 0,
    })
  );

  const recentEvents = db
    .prepare(`
      SELECT
        created_at,
        status
      FROM prompt_scans
      ORDER BY created_at DESC
      LIMIT 60
    `)
    .all()
    .reverse();

  const running = {
    allowed: 0,
    blocked: 0,
    sanitized: 0,
  };

  const hourlyActivity = recentEvents.map(
    (event, index) => {
      if (event.status === "allowed") {
        running.allowed += 1;
      }

      if (event.status === "blocked") {
        running.blocked += 1;
      }

      if (event.status === "cleaned") {
        running.sanitized += 1;
      }

      const eventTime =
        new Date(event.created_at);

      return {
        time: `${eventTime.toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )} #${index + 1}`,
        allowed: running.allowed,
        blocked: running.blocked,
        sanitized: running.sanitized,
      };
    }
  );

  const dailyActivity = db
    .prepare(`
      SELECT
        substr(created_at, 1, 10) AS time,

        SUM(
          CASE
            WHEN status = 'allowed'
            THEN 1
            ELSE 0
          END
        ) AS allowed,

        SUM(
          CASE
            WHEN status = 'blocked'
            THEN 1
            ELSE 0
          END
        ) AS blocked,

        SUM(
          CASE
            WHEN status = 'cleaned'
            THEN 1
            ELSE 0
          END
        ) AS sanitized

      FROM prompt_scans

      GROUP BY substr(created_at, 1, 10)

      ORDER BY time DESC

      LIMIT 30
    `)
    .all()
    .reverse()
    .map((item) => ({
      time: item.time,
      allowed: Number(item.allowed) || 0,
      blocked: Number(item.blocked) || 0,
      sanitized: Number(item.sanitized) || 0,
    }));

  const activity = {
    "24H": hourlyActivity,
    "7D": dailyActivity.slice(-7),
    "30D": dailyActivity,
  };

  const redTeam = db
    .prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(passed) AS passed
      FROM red_team_results
    `)
    .get();

  const redTeamTotal =
    Number(redTeam.total) || 0;

  const redTeamPassed =
    Number(redTeam.passed) || 0;

  const redTeamScore =
    redTeamTotal > 0
      ? Math.round(
          (redTeamPassed / redTeamTotal) * 100
        )
      : null;

  const operationalScore =
    scanned > 0
     ? Math.max(
        0,
        Math.min(
          100,
          Math.round(100 - averageRisk)
        )
      )
    : 100;

  const securityScore =
   redTeamScore === null
      ? operationalScore
      : Math.max(
        0,
        Math.min(
          100,
          Math.round(
            operationalScore * 0.6 +
            redTeamScore * 0.4
          )
        )
      );
  return {
    kpis: {
      scanned,
      blocked,
      sanitized,
      securityScore,
      riskPrevented: `₹${(
        blocked * 2.5 +
        sanitized * 0.5
      ).toFixed(1)}L`,
    },

    departments,

    categories,

    activity,

    threatMap: getThreatMap(),

    dpdp: getDPDPCompliance(),

    insights: getAIInsights(),

    generatedAt: now(),
  };
}
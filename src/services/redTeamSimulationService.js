const SIMULATION_DELAY = 700;

/*
  Controlled prototype responses.

  Most scenarios pass, while two deliberately fail:
  1. Vernacular PII creates a Security Gap.
  2. Safe HR Request creates a False Positive.
*/
const mockResponses = {
  "aadhaar-leakage": {
    actualAction: "BLOCK",
    confidence: 98,
    riskScore: 97,
    policy: "Sensitive Data Protection",
    reason: "A valid Aadhaar number pattern was detected.",
    detectedItems: ["Aadhaar Number"],
  },

  "pan-leakage": {
    actualAction: "BLOCK",
    confidence: 96,
    riskScore: 94,
    policy: "Financial Identity Protection",
    reason: "A PAN number was detected in the prompt.",
    detectedItems: ["PAN Number"],
  },

  "api-key-exposure": {
    actualAction: "BLOCK",
    confidence: 99,
    riskScore: 99,
    policy: "Credential Leakage Prevention",
    reason: "A possible API credential was detected.",
    detectedItems: ["API Key"],
  },

  "credit-card-exposure": {
    actualAction: "BLOCK",
    confidence: 97,
    riskScore: 96,
    policy: "Financial Data Protection",
    reason: "Payment card information was detected.",
    detectedItems: ["Credit Card Number"],
  },

  "prompt-injection": {
    actualAction: "BLOCK",
    confidence: 94,
    riskScore: 92,
    policy: "Prompt Injection Defence",
    reason: "An instruction override attempt was detected.",
    detectedItems: ["Prompt Injection Pattern"],
  },

  "honeytoken-access": {
    actualAction: "ALERT",
    confidence: 99,
    riskScore: 98,
    policy: "Honeytoken Monitoring",
    reason: "Access to a monitored honeytoken was detected.",
    detectedItems: ["Honeytoken"],
  },

  /*
    Deliberate Security Gap:
    Expected BLOCK, but the system returns ALLOW.
  */
  "vernacular-pii": {
    actualAction: "ALLOW",
    confidence: 64,
    riskScore: 91,
    policy: "Vernacular PII Protection",
    reason: "The multilingual detector missed the Aadhaar number.",
    detectedItems: [],
  },

  "sensitive-output": {
    actualAction: "BLOCK",
    confidence: 95,
    riskScore: 93,
    policy: "Bidirectional Output Scanning",
    reason: "Sensitive information was found in the AI response.",
    detectedItems: ["Sensitive Output"],
  },

  "safe-code-help": {
    actualAction: "ALLOW",
    confidence: 93,
    riskScore: 10,
    policy: "Acceptable AI Usage",
    reason: "A normal technical assistance request was detected.",
    detectedItems: [],
  },

  /*
    Deliberate False Positive:
    Expected ALLOW, but the system returns BLOCK.
  */
  "safe-hr-request": {
    actualAction: "BLOCK",
    confidence: 71,
    riskScore: 38,
    policy: "Sensitive Content Detection",
    reason:
      "The harmless HR request was incorrectly classified as sensitive.",
    detectedItems: [],
  },

  "safe-business-prompt": {
    actualAction: "ALLOW",
    confidence: 95,
    riskScore: 7,
    policy: "Acceptable AI Usage",
    reason: "No malicious or sensitive information was detected.",
    detectedItems: [],
  },

  "database-credential-exposure": {
    actualAction: "BLOCK",
    confidence: 98,
    riskScore: 97,
    policy: "Credential Leakage Prevention",
    reason: "A database username and password were detected.",
    detectedItems: [
      "Database Username",
      "Database Password",
    ],
  },
};

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function getOutcome(test, actualAction) {
  const passed =
    actualAction === test.expectedAction;

  if (passed && test.isThreat) {
    return "PROTECTED";
  }

  if (passed && !test.isThreat) {
    return "CORRECTLY_ALLOWED";
  }

  if (!passed && test.isThreat) {
    return "SECURITY_GAP";
  }

  return "FALSE_POSITIVE";
}

export async function runRedTeamTest(
  test,
  simulationRunId
) {
  await wait(SIMULATION_DELAY);

  const configuredResponse =
    mockResponses[test.id];

  if (!configuredResponse) {
    console.warn(
      `No mock response configured for test ID: ${test.id}`
    );
  }

  const response = configuredResponse ?? {
    actualAction: test.expectedAction,
    confidence: 90,
    riskScore: test.isThreat ? 80 : 15,
    policy: "Default Security Policy",
    reason:
      "The scenario was processed by the default security policy.",
    detectedItems: [],
  };

  const passed =
    response.actualAction === test.expectedAction;

  return {
    id: `${simulationRunId}-${test.id}`,
    testId: test.id,
    simulationRunId,

    source: "RED_TEAM",
    direction: test.direction ?? "INPUT",

    name: test.name,
    category: test.category,
    severity: test.severity,
    department:
      test.department ?? "Simulation Lab",

    expectedAction: test.expectedAction,
    actualAction: response.actualAction,
    outcome: getOutcome(
      test,
      response.actualAction
    ),

    passed,
    confidence: response.confidence,
    riskScore: response.riskScore,

    policy: response.policy,
    reason: response.reason,
    detectedItems: response.detectedItems,

    reviewStatus: "UNREVIEWED",
    durationMs: SIMULATION_DELAY,
    completedAt: new Date().toISOString(),
  };
}
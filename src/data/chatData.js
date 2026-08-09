export const chatScenarios = [
  // 1. SAFE REQUEST
  {
    id: 1,
    trigger: "summarize",
    status: "allowed",
    response:
      "Sure! I can summarize the document while keeping your information secure.",
    label: "Allowed",
  },

  // 2. API KEY / CREDENTIAL LEAK
  {
    id: 2,
    trigger: "api key",
    status: "blocked",
    response:
      "This request contains a sensitive API credential and cannot be processed.",
    label: "Blocked",
    blockScenarioId: "api-key",
  },

  // 3. AADHAAR / SENSITIVE PII
  {
    id: 3,
    trigger: "aadhaar",
    status: "cleaned",
    response:
      "Your message contained sensitive personal information. The Aadhaar number was removed before processing.",
    label: "Cleaned Up",
    blockScenarioId: "aadhaar",
  },

  // 4. PASSWORD / CREDENTIAL WARNING
  {
    id: 4,
    trigger: "password",
    status: "warning",
    response:
      "This message may contain sensitive credentials. Please remove the password before continuing.",
    label: "Warning",
  },

  // 5. PAN + FINANCIAL DATA
  {
    id: 5,
    trigger: "pan",
    status: "cleaned",
    response:
      "Your message contains financial and identity information. Sensitive values were removed before processing.",
    label: "Cleaned Up",
    blockScenarioId: "pan-consent",
  },

  // 6. CARD NUMBER
  {
    id: 6,
    trigger: "card number",
    status: "blocked",
    response:
      "This request contains payment card information and cannot be processed.",
    label: "Blocked",
    blockScenarioId: "card-data",
  },

  // 7. CVV
  {
    id: 7,
    trigger: "cvv",
    status: "blocked",
    response:
      "CVV information must never be shared with an AI assistant. This request has been blocked.",
    label: "Blocked",
    blockScenarioId: "card-data",
  },

  // 8. HONEYTOKEN
  {
    id: 8,
    trigger: "honeytoken",
    status: "blocked",
    response:
      "A protected decoy credential was detected. This session has been flagged as a potential security incident.",
    label: "Blocked",
    blockScenarioId: "honeytoken",
  },
];
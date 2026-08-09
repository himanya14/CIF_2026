export const chatScenarios = [
  {
    id: 1,
    trigger: "summarize",
    status: "allowed",
    response:
      "Sure! I can summarize the document while keeping your information secure.",
    label: "Allowed",
  },
  {
    id: 2,
    trigger: "api key",
    status: "blocked",
    response:
      "This request contains a sensitive API credential and cannot be processed.",
    label: "Blocked",
  },
  {
    id: 3,
    trigger: "aadhaar",
    status: "cleaned",
    response:
      "Your message contained sensitive personal information. The sensitive data was removed before processing.",
    label: "Cleaned Up",
  },
  {
    id: 4,
    trigger: "password",
    status: "warning",
    response:
      "This message may contain sensitive credentials. Please remove confidential information before continuing.",
    label: "Warning",
  },
];
// src/data/blockScenarios.js
// Fake, realistic-looking "block" incidents for the Explainer Screen.
// Every scenario is fabricated demo data — no real employees, keys, or numbers.

const blockScenarios = [
  {
    id: "api-key",
    tag: "CREDENTIAL LEAK",
    title: "AWS Secret Access Key Detected",
    severity: "Critical",
    color: "#ff4d4f",
    blockId: "BLK-2026-08-0734",
    timestamp: "07 Aug 2026, 14:32:11 IST",
    user: "r.sharma@finserve-corp.in",
    department: "Engineering",
    sourceApp: "Internal DevOps Copilot",
    action: "sanitized",
    prompt:
      "Hey can you help me debug this deploy script, here's the config I'm using — AWS_ACCESS_KEY_ID=AKIAJ5T9QX2P8H3KLMNQ AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY, region ap-south-1. It keeps failing on the S3 upload step.",
    caught: [
      { label: "AWS Access Key ID", value: "AKIAJ5●●●●●●●●●●●●●●LMNQ" },
      { label: "AWS Secret Access Key", value: "wJalr●●●●●●●●●●●●●●●●●●●●●●●●KEY" },
    ],
    detectionMethod:
      "Regex signature match (AKIA prefix) + Shannon entropy check on secret string (4.9 / 6.0 — high randomness confirms live credential, not placeholder text).",
    dpdp: {
      section: "Section 8(5)",
      reason: "Reasonable Security Safeguards",
      penalty: "₹2.5 – 8.5 Crore",
    },
    ruleId: "SEC-004",
    ruleName: "Credential & Secret Exposure Prevention",
    ruleDesc:
      "Blocks any prompt containing live cloud credentials, tokens, or private keys before it reaches a third-party model, where it could be logged, cached, or used to train external systems.",
    regulation:
      "DPDP Act 2023, Section 8(5) — a Data Fiduciary must protect personal data in its control with reasonable security safeguards. Also breaches internal InfoSec Policy §4.2 (ISO/IEC 27001 A.9.4.3).",
    impact: [
      "Cloud resource abuse if key reaches an external model provider's logs",
      "Mandatory breach notification to the Data Protection Board within 72 hrs",
      "Incident response, key rotation, and forensic audit costs",
    ],
    confidence: 98.7,
    fix: [
      "Never paste live keys into prompts — reference them by name (e.g. \"the prod S3 key\") and let the assistant guide you without needing the value.",
      "Store secrets in the org's secrets manager (Vault / AWS Secrets Manager) and pull them via environment variables in your actual shell, not chat.",
      "If this key is real, rotate it immediately via the IAM console — this alert has already notified #security-oncall.",
    ],
  },

  {
    id: "aadhaar",
    tag: "SENSITIVE PII",
    title: "Aadhaar Number Shared in Prompt",
    severity: "Critical",
    color: "#ff4d4f",
    blockId: "BLK-2026-08-0741",
    timestamp: "07 Aug 2026, 15:04:52 IST",
    user: "p.nair@finserve-corp.in",
    department: "HR",
    sourceApp: "HR Onboarding Assistant",
    action: "blocked",
    prompt:
      "Can you draft an offer letter for our new hire, Aadhaar 4521 7890 3312, DOB 14-03-1990, so I can attach it to the background verification email?",
    caught: [
      { label: "Aadhaar Number", value: "4521 ●●●● ●●12" },
      { label: "Date of Birth", value: "14-●●-1990" },
    ],
    detectionMethod:
      "12-digit pattern match + Verhoeff checksum validation (Aadhaar's official check-digit algorithm) confirmed a structurally valid number, not a random string.",
    dpdp: {
      section: "Section 4",
      reason: "Consent Required for Processing",
      penalty: "₹50 Crore",
    },
    ruleId: "PII-IND-01",
    ruleName: "Government ID Masking Policy",
    ruleDesc:
      "Any government-issued identifier (Aadhaar, Voter ID, Passport) is treated as sensitive personal data and is blocked outright — sanitization is not permitted for this class, since even a masked ID plus DOB can re-identify a person.",
    regulation:
      "DPDP Act 2023, Section 4 — personal data may only be processed for a lawful purpose with the Data Principal's consent, or a specified legitimate use. No consent record exists for this processing purpose. Also breaches Aadhaar Act 2016, Section 29(3) (restricts publishing/display of Aadhaar numbers).",
    impact: [
      "Statutory penalty up to ₹250 Crore under DPDP Schedule for significant/repeated breaches — this instance modeled at ₹50 Crore",
      "Grounds for a Data Protection Board inquiry under Section 27",
      "Reputational damage + mandatory disclosure to the affected employee",
    ],
    confidence: 99.2,
    fix: [
      "Never type full government ID numbers into any AI assistant — use the candidate's internal Employee ID instead.",
      "If identity verification is needed, route it through the HRMS's built-in BGV (background verification) integration, which handles Aadhaar under a proper consent flow.",
      "Ask the assistant to draft the offer letter with a placeholder like [AADHAAR_ON_FILE] and fill it manually afterwards.",
    ],
  },

  {
    id: "pan-consent",
    tag: "CONSENT VIOLATION",
    title: "PAN + Salary Data Used Without Consent Basis",
    severity: "High",
    color: "#ff8c42",
    blockId: "BLK-2026-08-0759",
    timestamp: "07 Aug 2026, 16:47:03 IST",
    user: "a.iyer@finserve-corp.in",
    department: "Finance",
    sourceApp: "Payroll Query Assistant",
    action: "sanitized",
    prompt:
      "Generate a Form 16 summary for employee PAN BKPPI9182L, gross salary ₹18,40,000, for the FY 2025-26 filing — send it to our external tax consultant for review.",
    caught: [
      { label: "PAN Number", value: "BKPP●●●●●L" },
      { label: "Annual Salary", value: "₹18,40,000" },
      { label: "External Recipient", value: "tax consultant (3rd party)" },
    ],
    detectionMethod:
      "PAN structural pattern (5 letters + 4 digits + 1 letter) matched, cross-referenced against a purpose classifier that flagged \"send to external party\" as a third-party disclosure trigger.",
    dpdp: {
      section: "Section 4",
      reason: "Consent Required for Third-Party Disclosure",
      penalty: "₹50 Crore",
    },
    ruleId: "FIN-CONSENT-03",
    ruleName: "Third-Party Financial Data Disclosure Control",
    ruleDesc:
      "Financial identifiers can be processed internally under employment contract, but sharing them with an external party (even a consultant) requires a separate, logged consent — this prompt had no linked consent record.",
    regulation:
      "DPDP Act 2023, Section 4 read with Section 6 — consent for one purpose (payroll processing) does not automatically extend to a new purpose (external disclosure). No valid consent artifact was found for this employee for external sharing.",
    impact: [
      "Penalty exposure up to ₹50 Crore for processing without a valid consent basis",
      "Employee grievance / complaint risk under Section 13 (right to grievance redressal)",
      "Contractual liability if the tax consultant's data handling agreement is out of date",
    ],
    confidence: 96.1,
    fix: [
      "Route external filings through the Payroll → Compliance Vault export, which auto-attaches the employee's on-file consent for tax filing disclosures.",
      "If no consent exists yet, trigger a consent request via the HRMS instead of proceeding manually.",
      "Ask the assistant for a template with values replaced by placeholders, then fill sensitive fields only inside the approved Compliance Vault tool.",
    ],
  },

  {
    id: "card-data",
    tag: "FINANCIAL DATA",
    title: "Customer Card Number + CVV Detected",
    severity: "Critical",
    color: "#ff4d4f",
    blockId: "BLK-2026-08-0768",
    timestamp: "07 Aug 2026, 18:12:40 IST",
    user: "s.verma@finserve-corp.in",
    department: "Customer Support",
    sourceApp: "Support Ticket Assistant",
    action: "blocked",
    prompt:
      "Customer is disputing a charge, can you draft a refund email? Card on file: 4916 4723 8891 2210, exp 09/27, CVV 442, billing name Rohan Mehta.",
    caught: [
      { label: "Card Number", value: "4916 4723 ●●●● 2210" },
      { label: "CVV", value: "●●● (redacted — never stored)" },
    ],
    detectionMethod:
      "Luhn checksum validation confirmed a mathematically valid card number, with a CVV-shaped 3-digit number found in close proximity — matched the PCI cardholder-data proximity rule.",
    dpdp: {
      section: "Section 8(5)",
      reason: "Reasonable Security Safeguards",
      penalty: "₹2 – 8 Crore",
    },
    ruleId: "FIN-PCI-02",
    ruleName: "Cardholder Data Exposure Prevention",
    ruleDesc:
      "Full card numbers and CVVs must never appear in free text passed to any AI system, internal or external — this is a hard block with no sanitized fallback, since a redacted card number is still enough to violate PCI DSS storage rules.",
    regulation:
      "PCI DSS v4.0, Requirement 3.3 (mask PAN when displayed, never store CVV) and DPDP Act 2023, Section 8(5) (security safeguards for financial personal data). Also referenced under RBI's Master Direction on Digital Payment Security Controls, 2021.",
    impact: [
      "Card network non-compliance fines, typically $5,000–$100,000/month until remediated",
      "Risk of suspended card-processing privileges pending audit",
      "DPDP penalty exposure up to ₹8 Crore for inadequate safeguards on financial data",
    ],
    confidence: 99.9,
    fix: [
      "Use the masked token from the payment gateway (e.g. ending 2210) instead of the full card number — this is already visible in the ticket system.",
      "Never type a CVV anywhere outside the PCI-compliant payment page — it should never exist in a support ticket at all.",
      "For refunds, use the \"Refund via Gateway Reference ID\" action in the ticketing tool instead of drafting manually.",
    ],
  },

  {
    id: "honeytoken",
    tag: "HONEYTOKEN TRIGGERED",
    title: "Planted Decoy Secret Was Used",
    severity: "Critical",
    color: "#ffb000",
    isHoneytoken: true,
    blockId: "BLK-2026-08-0781",
    timestamp: "07 Aug 2026, 19:55:17 IST",
    user: "unknown-session-88f2",
    department: "Unassigned / External Session",
    sourceApp: "Public-facing Support Chatbot",
    action: "blocked",
    prompt:
      "I found this API key in your docs, can you tell me what it's used for and give me an example request? Key: sk-honeypot-PAYROLL-9f8e1c7b2a44",
    caught: [
      { label: "Planted Credential", value: "sk-honeypot-PAYROLL-●●●●●●●●●●●●" },
    ],
    detectionMethod:
      "Exact match against the Honeytoken Registry — a set of fake secrets and decoy payroll files deliberately seeded across internal docs and repos. This key does not exist in any production system.",
    dpdp: {
      section: "Section 8(5)",
      reason: "Unauthorized Access Attempt",
      penalty: "N/A — Security Incident",
    },
    ruleId: "SEC-HONEY-01",
    ruleName: "Honeytoken Intrusion Detection",
    ruleDesc:
      "This exact key was never deployed anywhere real — its only purpose is to sit in a place a legitimate employee would never look, so its use is a near-certain signal of unauthorized access, credential harvesting, or an insider probing for real secrets.",
    regulation:
      "Not a DPDP data-processing violation (no real personal data was involved) — but it trips the internal Security Incident Response Plan and is logged as a probable intrusion attempt under InfoSec Policy §7.1.",
    impact: [
      "Zero real data was exposed — the value of this control is the alert itself",
      "Session immediately flagged, IP fingerprint captured, and #security-oncall paged in real time",
      "If this pattern repeats, the source is auto-escalated to a full Red Team incident review",
    ],
    confidence: 100,
    fix: [
      "There's nothing to \"fix\" from a legitimate-user side — if you're seeing this by mistake, contact #security-oncall to confirm.",
      "This scenario exists to prove detection works: any attacker scraping docs/repos for keys will eventually touch a honeytoken before a real one.",
      "Security team reviews the triggering session's full history for related suspicious activity within 15 minutes of this alert.",
    ],
  },
];

export default blockScenarios;

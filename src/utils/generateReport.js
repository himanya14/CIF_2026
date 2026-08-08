import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function generateReport() {

  const doc = new jsPDF();

  const now = new Date();

  doc.setFontSize(22);
  doc.setTextColor(0, 80, 180);
  doc.text("AI WATCH TOWER", 20, 20);

  doc.setFontSize(13);
  doc.setTextColor(80);
  doc.text("Executive Security Report", 20, 30);

  doc.text(`Generated: ${now.toLocaleString()}`, 20, 40);

  doc.setFontSize(16);
  doc.text("Security Overview", 20, 58);

  autoTable(doc, {
    startY: 65,
    head: [["Metric", "Value"]],
    body: [
      ["Security Score", "92 / 100"],
      ["Prompts Scanned", "247"],
      ["Blocked Prompts", "12"],
      ["Sanitized Prompts", "31"],
      ["Risk Prevented", "₹1.8L"],
    ],
  });

  doc.text("Department Risk Levels", 20, doc.lastAutoTable.finalY + 18);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 25,
    head: [["Department", "Risk", "Score"]],
    body: [
      ["Finance", "High", "91"],
      ["HR", "Medium", "74"],
      ["IT", "Medium", "58"],
      ["Legal", "Low", "42"],
      ["Operations", "Low", "34"],
      ["Marketing", "Minimal", "18"],
    ],
  });

  doc.text(
    "AI Summary",
    20,
    doc.lastAutoTable.finalY + 18
  );

  doc.setFontSize(12);

  doc.text(
    [
      "• Finance remains the highest-risk department.",
      "• Prompt injection attempts increased this week.",
      "• Overall security posture is stable.",
      "• No critical incidents detected.",
    ],
    20,
    doc.lastAutoTable.finalY + 28
  );

  doc.save(
    `AI_WatchTower_Report_${now.toLocaleDateString("en-GB").replace(/\//g, "-")}.pdf`
  );

}
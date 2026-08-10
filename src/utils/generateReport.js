import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getDashboard, getIncidents } from "../services/api";

function riskLabel(score) {
  if (score >= 75) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}

export async function generateReport() {
  const [dashboard, incidentData] = await Promise.all([getDashboard(), getIncidents()]);
  const incidents = incidentData.incidents || [];
  const now = new Date();
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.setFillColor(8, 19, 33);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(0, 212, 255);
  doc.setFontSize(21);
  doc.text("AI WATCH TOWER", 15, 16);
  doc.setTextColor(220, 234, 255);
  doc.setFontSize(11);
  doc.text("Database-backed Executive Security Report", 15, 25);
  doc.setTextColor(80);
  doc.setFontSize(9);
  doc.text(`Generated: ${now.toLocaleString("en-IN")}`, 15, 42);

  autoTable(doc, {
    startY: 48,
    head: [["Metric", "Live value"]],
    body: [
      ["Security Score", `${dashboard.kpis.securityScore} / 100`],
      ["Prompts Scanned", String(dashboard.kpis.scanned)],
      ["Blocked Prompts", String(dashboard.kpis.blocked)],
      ["Sanitized Prompts", String(dashboard.kpis.sanitized)],
      ["Risk Prevented", String(dashboard.kpis.riskPrevented).replace("₹", "INR ")],
      ["Recorded Incidents", String(incidents.length)],
    ],
    theme: "grid",
    headStyles: { fillColor: [18, 51, 78] },
  });

  let nextY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setTextColor(20, 55, 90);
  doc.text("Department Risk", 15, nextY);
  autoTable(doc, {
    startY: nextY + 4,
    head: [["Department", "Scans", "Blocked", "Sanitized", "Risk", "Score"]],
    body: dashboard.departments.length
      ? dashboard.departments.map(item => [item.department, item.scans, item.blocked, item.sanitized, riskLabel(Number(item.score)), item.score])
      : [["No department activity", "0", "0", "0", "Low", "0"]],
    theme: "striped",
    headStyles: { fillColor: [18, 51, 78] },
  });

  nextY = doc.lastAutoTable.finalY + 10;
  doc.text("Violation Categories", 15, nextY);
  autoTable(doc, {
    startY: nextY + 4,
    head: [["Category", "Share"]],
    body: dashboard.categories.length ? dashboard.categories.map(item => [item.name, `${item.value}%`]) : [["No violations", "0%"]],
    theme: "striped",
    headStyles: { fillColor: [18, 51, 78] },
  });

  nextY = doc.lastAutoTable.finalY + 10;
  doc.text("Recent Incidents", 15, nextY);
  autoTable(doc, {
    startY: nextY + 4,
    head: [["Incident", "Department", "Category", "Severity", "Status"]],
    body: incidents.length
      ? incidents.slice(0, 12).map(item => [item.blockId, item.department, item.category, item.severity, item.reviewStatus])
      : [["No incidents recorded", "-", "-", "-", "-"]],
    theme: "grid",
    styles: { fontSize: 7.5 },
    headStyles: { fillColor: [18, 51, 78] },
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`AI Watch Tower | Page ${page} of ${pageCount}`, 105, 290, { align: "center" });
  }

  const fileDate = now.toISOString().slice(0, 10);
  doc.save(`AI_WatchTower_Live_Report_${fileDate}.pdf`);
  return { fileName: `AI_WatchTower_Live_Report_${fileDate}.pdf` };
}

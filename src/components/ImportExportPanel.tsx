"use client";

import { FileUp } from "lucide-react";
import { rowsForExport } from "@/lib/export";
import { readJsonFile, convertDataJsonToEvents } from "@/lib/import";
import type { EventRecord, Profile } from "@/lib/types";

type ImportExportPanelProps = {
  events: EventRecord[];
  profiles: Profile[];
  userId: string;
  onImportComplete?: (importedEvents: EventRecord[]) => Promise<void>;
};

export function ImportExportPanel({ events, profiles, userId, onImportComplete }: ImportExportPanelProps) {
  function exportExcel() {
    const rows = rowsForExport(events, profiles);
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    const head = columns.map((column: string) => `<th>${escapeHtml(column)}</th>`).join("");
    const body = rows
      .map((row) => `<tr>${columns.map((column: string) => `<td>${escapeHtml(String(row[column as keyof typeof row] ?? ""))}</td>`).join("")}</tr>`)
      .join("");
    const workbook = `<!doctype html><html><head><meta charset="utf-8"></head><body><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
    const blob = new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "veranstaltungsprogramm-export.xls";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleDataJsonImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    try {
      const dataJson = await readJsonFile(file);
      const importedEvents = convertDataJsonToEvents(dataJson, userId);
      
      if (importedEvents.length === 0) {
        alert("Keine gültigen Events in der Datei gefunden.");
        return;
      }

      alert(`${importedEvents.length} Events aus data.json importiert.`);
      await onImportComplete?.(importedEvents);
      event.currentTarget.value = "";
    } catch (error) {
      alert(error instanceof Error ? error.message : "Import fehlgeschlagen.");
      event.currentTarget.value = "";
    }
  }

  return (
    <section className="panel import-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Migration</span>
          <h2>Import & Export</h2>
        </div>
      </div>
      <div className="import-grid">
        <label className="button secondary" style={{ cursor: "pointer" }}>
          <FileUp size={16} />
          data.json importieren
          <input
            type="file"
            accept=".json"
            onChange={handleDataJsonImport}
            style={{ display: "none" }}
          />
        </label>
      </div>
    </section>
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

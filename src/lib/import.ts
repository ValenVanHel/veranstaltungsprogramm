/**
 * Entfernt doppelte Events basierend auf Ort, Thema und Start-Datum.
 * Zwei Events gelten als doppelt, wenn alle drei Felder identisch sind.
 */
export function removeDuplicateEvents(events: EventRecord[]): EventRecord[] {
  const seen = new Set<string>();
  const result: EventRecord[] = [];
  for (const event of events) {
    const key = `${event.location_name?.toLowerCase().trim() || ''}__${event.action_name?.toLowerCase().trim() || ''}__${event.start_date?.trim() || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(event);
    }
  }
  return result;
}
/**
 * Überprüft und korrigiert alle Datumsfelder eines EventRecord-Arrays.
 * Nutzt normalizeDate, überschreibt ungültige Einträge mit "".
 */
export function ensureEventsDateFormat(events: EventRecord[]): EventRecord[] {
  return events.map(event => ({
    ...event,
    start_date: normalizeDate(event.start_date) || "",
    end_date: event.end_date ? (normalizeDate(event.end_date) || "") : null,
    created_at: event.created_at ? (new Date(event.created_at).toISOString()) : new Date().toISOString(),
    updated_at: event.updated_at ? (new Date(event.updated_at).toISOString()) : new Date().toISOString(),
    deleted_at: event.deleted_at ? (new Date(event.deleted_at).toISOString()) : null
  }));
}
/**
 * Erkennt das Datumsformat und gibt ein einheitliches ISO-Format (yyyy-mm-dd) zurück.
 * Unterstützt "yyyy-mm-dd", "dd.mm.yyyy", "mm/dd/yyyy" und gültige ISO-Strings.
 */
export function normalizeDate(input: string | null | undefined): string | null {
  if (!input || typeof input !== "string") return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Bereits im ISO-Format yyyy-mm-dd?
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  // dd.mm.yyyy → yyyy-mm-dd
  const deMatch = trimmed.match(/^([0-3]?\d)\.([01]?\d)\.(\d{4})$/);
  if (deMatch) {
    const day = deMatch[1].padStart(2, "0");
    const month = deMatch[2].padStart(2, "0");
    const year = deMatch[3];
    return `${year}-${month}-${day}`;
  }
  // mm/dd/yyyy → yyyy-mm-dd
  const usMatch = trimmed.match(/^([01]?\d)\/([0-3]?\d)\/(\d{4})$/);
  if (usMatch) {
    const month = usMatch[1].padStart(2, "0");
    const day = usMatch[2].padStart(2, "0");
    const year = usMatch[3];
    return `${year}-${month}-${day}`;
  }
  // Sonst versuchen, als Datum zu parsen
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  // Fallback: Eingabe zurückgeben, wenn nichts passt
  return trimmed;
}
import type { EventRecord } from "./types";

export const expectedExcelColumns = [
  "Ort",
  "Start",
  "Ende",
  "Aktion",
  "Verantwortliche",
  "Uhrzeit",
  "Weitere Infos",
  "Erstellt",
  "Ersteller",
  "PC",
  "Status"
];

export function hasExpectedExcelColumns(columns: string[]): boolean {
  return expectedExcelColumns.every((column) => columns.includes(column));
}

/**
 * Liest JSON-Datei und parst sie
 */
export async function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error("JSON-Datei konnte nicht geparst werden."));
      }
    };
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
    reader.readAsText(file);
  });
}

/**
 * Liest Excel/CSV-Datei und konvertiert sie zu Events
 */
export async function readExcelFile(file: File): Promise<EventRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const html = e.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const table = doc.querySelector("table");
        if (!table) throw new Error("Keine Tabelle in der Datei gefunden.");

        const headers: string[] = [];
        const headerRow = table.querySelector("thead tr");
        if (headerRow) {
          headerRow.querySelectorAll("th").forEach((th) => {
            headers.push(th.textContent?.trim() || "");
          });
        }

        if (!hasExpectedExcelColumns(headers)) {
          throw new Error(`Erwartete Spalten nicht gefunden. Erwartet: ${expectedExcelColumns.join(", ")}`);
        }

        const events: EventRecord[] = [];
        table.querySelectorAll("tbody tr").forEach((row) => {
          const cells: string[] = [];
          row.querySelectorAll("td").forEach((td) => {
            cells.push(td.textContent?.trim() || "");
          });

          const record: Record<string, string> = {};
          headers.forEach((header, index) => {
            record[header] = cells[index] || "";
          });

          if (record["Ort"] && record["Start"] && record["Aktion"]) {
            events.push({
              id: crypto.randomUUID(),
              location_name: record["Ort"].substring(0, 25),
              start_date: normalizeDate(record["Start"]) || "", // Typ string
              end_date: record["Ende"] && record["Ende"] !== record["Start"] ? normalizeDate(record["Ende"]) : null,
              end_active: record["Ende"] && record["Ende"] !== record["Start"] ? true : false,
              action_name: record["Aktion"].substring(0, 50),
              start_time: record["Uhrzeit"] || "",
              more_info: (record["Weitere Infos"] || "").substring(0, 200),
              status: record["Status"] === "Gelöscht" ? "deleted" : "active",
              created_by: "import",
              created_at: record["Erstellt"] || new Date().toISOString(),
              updated_by: null,
              updated_at: new Date().toISOString(),
              deleted_by: null,
              deleted_at: null,
              responsible_names: record["Verantwortliche"]
                ? record["Verantwortliche"].split(",").map((name) => name.trim()).filter(Boolean)
                : []
            });
          }
        });

        resolve(events);
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Excel-Datei konnte nicht verarbeitet werden."));
      }
    };
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
    reader.readAsText(file);
  });
}

/**
 * Konvertiert alte data.json Struktur zu Events
 */
export function convertDataJsonToEvents(dataJson: unknown, createdBy: string): EventRecord[] {
  const data = dataJson as Record<string, unknown>;
  const events: EventRecord[] = [];

  // Normale Events aus "records"
  if (Array.isArray(data.records)) {
    (data.records as unknown[]).forEach((item: unknown) => {
      const record = item as Record<string, unknown>;
      if (record.ort && record.start) {
        events.push({
          id: crypto.randomUUID(),
          location_name: String(record.ort).substring(0, 25),
          start_date: normalizeDate(String(record.start).split(" ")[0]) || "",
          end_date: record.end ? normalizeDate(String(record.end).split(" ")[0]) : null,
          end_active: !!record.end,
          action_name: String(record.aktion || "").substring(0, 50),
          start_time: String(record.uhrzeit || ""),
          more_info: String(record.weitere_infos || "").substring(0, 200),
          status: "active",
          created_by: createdBy,
          created_at: new Date().toISOString(),
          updated_by: null,
          updated_at: new Date().toISOString(),
          deleted_by: null,
          deleted_at: null,
          responsible_names: Array.isArray(record.verantwortliche)
            ? (record.verantwortliche as unknown[]).map((v) => String(v))
            : []
        });
      }
    });
  }

  // Gelöschte Events aus "trash"
  if (Array.isArray(data.trash)) {
    (data.trash as unknown[]).forEach((item: unknown) => {
      const record = item as Record<string, unknown>;
      if (record.ort && record.start) {
        events.push({
          id: crypto.randomUUID(),
          location_name: String(record.ort).substring(0, 25),
          start_date: normalizeDate(String(record.start).split(" ")[0]) || "",
          end_date: record.end ? normalizeDate(String(record.end).split(" ")[0]) : null,
          end_active: !!record.end,
          action_name: String(record.aktion || "").substring(0, 50),
          start_time: String(record.uhrzeit || ""),
          more_info: String(record.weitere_infos || "").substring(0, 200),
          status: "deleted",
          created_by: createdBy,
          created_at: new Date().toISOString(),
          updated_by: null,
          updated_at: new Date().toISOString(),
          deleted_by: createdBy,
          deleted_at: new Date().toISOString(),
          responsible_names: Array.isArray(record.verantwortliche)
            ? (record.verantwortliche as unknown[]).map((v) => String(v))
            : []
        });
      }
    });
  }

  return events;
}

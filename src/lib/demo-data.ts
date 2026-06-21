
import type { EventRecord, Profile } from "./types";
import { ensureEventsDateFormat, removeDuplicateEvents } from "./import";

export const demoProfiles: Profile[] = [
  {
    id: "owner-demo",
    display_name: "Owner",
    login_name: "owner@example.org",
    role: "owner",
    is_root_owner: true
  },
  {
    id: "admin-demo",
    display_name: "Admin Planung",
    login_name: "admin@example.org",
    role: "admin",
    is_root_owner: false
  },
  {
    id: "user-demo",
    display_name: "Kalender User",
    login_name: "user@example.org",
    role: "user",
    is_root_owner: false
  }
];

export const demoEventsDefault: EventRecord[] = [
  {
    id: "event-1",
    location_name: "Bitterfeld",
    start_date: "2026-06-12",
    end_date: null,
    end_active: false,
    action_name: "Infostand Wochenmarkt",
    start_time: "09:45",
    more_info: "Material prüfen",
    status: "active",
    created_by: "owner-demo",
    created_at: "2026-06-01T09:30:00.000Z",
    updated_by: null,
    updated_at: "2026-06-01T09:30:00.000Z",
    deleted_by: null,
    deleted_at: null,
    responsible_names: ["Alex", "Mara"]
  },
  {
    id: "event-2",
    location_name: "Wolfen",
    start_date: "2026-06-18",
    end_date: "2026-06-19",
    end_active: true,
    action_name: "Stadtteilgespräch",
    start_time: "18:00",
    more_info: "Presse, Raum 2",
    status: "active",
    created_by: "admin-demo",
    created_at: "2026-06-03T14:20:00.000Z",
    updated_by: null,
    updated_at: "2026-06-03T14:20:00.000Z",
    deleted_by: null,
    deleted_at: null,
    responsible_names: ["Jonas"]
  },
  {
    id: "event-3",
    location_name: "Köthen",
    start_date: "2026-06-21",
    end_date: null,
    end_active: false,
    action_name: "Plakatierung",
    start_time: "",
    more_info: "verschoben",
    status: "deleted",
    created_by: "admin-demo",
    created_at: "2026-05-28T08:00:00.000Z",
    updated_by: "admin-demo",
    updated_at: "2026-06-02T11:00:00.000Z",
    deleted_by: "owner-demo",
    deleted_at: "2026-06-04T12:10:00.000Z",
    responsible_names: ["Mara"]
  }
];

/**
 * Lädt Demo-Events aus localStorage oder gibt Defaults zurück
 */
export function getDemoEventsFromStorage(): EventRecord[] {
  if (typeof window === "undefined") return removeDuplicateEvents(ensureEventsDateFormat(demoEventsDefault));
  const stored = localStorage.getItem("demo_events");
  if (stored) {
    try {
      const eventsRaw = JSON.parse(stored);
      const formatted = ensureEventsDateFormat(eventsRaw);
      return removeDuplicateEvents(formatted);
    } catch {
      localStorage.removeItem("demo_events");
    }
  }
  return removeDuplicateEvents(ensureEventsDateFormat(demoEventsDefault));


}

/**
 * Speichert Demo-Events in localStorage
 */
export function saveDemoEventsToStorage(events: EventRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("demo_events", JSON.stringify(events));
}

/**
 * Initialisiert localStorage mit Default-Events (erste Verwendung)
 */
export function initDemoStorage(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("demo_events")) {
    saveDemoEventsToStorage(demoEventsDefault);
  }
}

/**
 * Setzt Demo-Events auf Defaults zurück
 */
export function resetDemoStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("demo_events");
  initDemoStorage();
}

// Für Backward-Kompatibilität: demoEvents ist jetzt eine Funktion
export const demoEvents: EventRecord[] = demoEventsDefault;

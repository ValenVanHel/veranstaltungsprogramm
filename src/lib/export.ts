import type { EventRecord, Profile } from "./types";

export function rowsForExport(events: EventRecord[], profiles: Profile[]) {
  return events.map((event) => {
    const creator = profiles.find((profile) => profile.id === event.created_by);
    return {
      Ort: event.location_name,
      Start: event.start_date,
      Ende: event.end_active ? event.end_date ?? event.start_date : event.start_date,
      Aktion: event.action_name,
      Verantwortliche: event.responsible_names.join(", "),
      "Bemerkung 1": event.note_1,
      "Bemerkung 2": event.note_2,
      Erstellt: event.created_at,
      Ersteller: creator?.display_name ?? "",
      BenutzerLogin: creator?.login_name ?? "",
      Status: event.status === "deleted" ? "Gelöscht" : "Aktiv"
    };
  });
}

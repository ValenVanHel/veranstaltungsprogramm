import type { EventFormState, EventRecord } from "./types";

export const emptyEventForm: EventFormState = {
  location_name: "",
  start_date: "",
  end_date: "",
  end_active: false,
  action_name: "",
  responsible_names: "",
  start_time: "",
  more_info: ""
};

export function formFromEvent(event: EventRecord): EventFormState {
  return {
    location_name: event.location_name,
    start_date: event.start_date,
    end_date: event.end_date ?? "",
    end_active: event.end_active,
    action_name: event.action_name,
    responsible_names: event.responsible_names?.join(", ") ?? "",
    start_time: typeof event.start_time === "string" ? event.start_time : "",
    more_info: typeof event.more_info === "string" ? event.more_info : ""
  };
}

export function validateEventForm(form: EventFormState): string[] {
  const errors: string[] = [];
  if (!form.location_name.trim()) errors.push("Ort ist Pflicht.");
  if (form.location_name.trim().length > 25) errors.push("Ort darf maximal 25 Zeichen haben.");
  if (!form.start_date) errors.push("Startdatum ist Pflicht.");
  if (!form.action_name.trim()) errors.push("Aktion ist Pflicht.");
  if (form.action_name.trim().length > 50) errors.push("Aktion darf maximal 50 Zeichen haben.");
  // Optionale Prüfung für Uhrzeit, falls gewünscht:
  if (form.start_time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(form.start_time)) errors.push("Bitte wähle eine gültige Uhrzeit im Format HH:MM.");
  if (form.more_info.length > 200) errors.push("Weitere Infos dürfen maximal 200 Zeichen haben.");
  if (form.end_active && form.end_date && form.start_date && form.end_date < form.start_date) {
    errors.push("Enddatum darf nicht vor dem Startdatum liegen.");
  }
  return errors;
}

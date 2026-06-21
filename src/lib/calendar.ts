import type { EventRecord } from "./types";

export function calendarColor(event: EventRecord): string {
  const key = `${event.location_name}-${event.action_name}`.toLowerCase();
  if (event.status === "deleted") return "event-deleted";
  if (key.includes("bitterfeld")) return "event-red";
  if (key.includes("wolfen")) return "event-blue";
  if (key.includes("köthen") || key.includes("koethen")) return "event-green";
  return "event-gold";
}

export function eventScheduleDate(event: EventRecord): string {
  return event.end_active && event.end_date ? event.end_date : event.start_date;
}

export function todayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function hasEventTakenPlace(event: EventRecord, currentDate: string = todayKey()): boolean {
  return eventScheduleDate(event) < currentDate;
}

export function isPrivilegedRole(role: string): boolean {
  return role === "admin" || role === "owner";
}

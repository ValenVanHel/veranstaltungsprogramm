import type { EventFiltersState, EventRecord } from "./types";
import { eventScheduleDate, hasEventTakenPlace, todayKey } from "./calendar";

export const emptyEventFilters: EventFiltersState = {
  month: "all",
  location: "all",
  timeframe: "all"
};

export function monthKey(value: string): string {
  return value.slice(0, 7);
}

export function monthLabel(value: string): string {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

export function filterEvents(events: EventRecord[], filters: EventFiltersState): EventRecord[] {
  return events.filter((event) => {
    const matchesMonth = filters.month === "all" || monthKey(event.start_date) === filters.month;
    const matchesLocation = filters.location === "all" || event.location_name === filters.location;
    const matchesTimeframe = matchesEventTimeframe(event, filters.timeframe);
    return matchesMonth && matchesLocation && matchesTimeframe;
  });
}

function matchesEventTimeframe(event: EventRecord, timeframe: EventFiltersState["timeframe"]): boolean {
  const currentDate = todayKey();
  if (timeframe === "all") return true;
  if (timeframe === "deleted") return event.status === "deleted";
  if (event.status !== "active") return false;
  if (timeframe === "today") return event.start_date <= currentDate && eventScheduleDate(event) >= currentDate;
  if (timeframe === "upcoming") return event.start_date > currentDate;
  if (timeframe === "past") return hasEventTakenPlace(event, currentDate);
  return true;
}

export function monthOptionsFromEvents(events: EventRecord[]): Array<{ value: string; label: string }> {
  return Array.from(new Set(events.map((event) => monthKey(event.start_date)).filter(Boolean)))
    .sort()
    .map((value) => ({ value, label: monthLabel(value) }));
}

export function locationOptionsFromEvents(events: EventRecord[]): string[] {
  return Array.from(new Set(events.map((event) => event.location_name).filter(Boolean))).sort((left, right) => left.localeCompare(right, "de"));
}

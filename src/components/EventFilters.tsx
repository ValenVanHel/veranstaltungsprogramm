"use client";

import { Filter, RotateCcw } from "lucide-react";
import type { EventFiltersState, UserRole } from "@/lib/types";

type EventFiltersProps = {
  filters: EventFiltersState;
  monthOptions: Array<{ value: string; label: string }>;
  locationOptions: string[];
  resultCount: number;
  userRole: UserRole;
  onChange: (filters: EventFiltersState) => void;
};

export function EventFilters({ filters, monthOptions, locationOptions, resultCount, userRole, onChange }: EventFiltersProps) {
  const hasActiveFilter = filters.month !== "all" || filters.location !== "all" || filters.timeframe !== "all";

  return (
    <section className="panel filter-panel">
      <div className="filter-heading">
        <div>
          <span className="eyebrow">Filter</span>
          <h2>Monat und Ort</h2>
        </div>
        <Filter size={22} />
      </div>

      <div className="timeframe-filter" aria-label="Zeitstatus filtern">
        <button className={filters.timeframe === "all" ? "active" : ""} type="button" onClick={() => onChange({ ...filters, timeframe: "all" })}>Alle</button>
        <button className={filters.timeframe === "today" ? "active" : ""} type="button" onClick={() => onChange({ ...filters, timeframe: "today" })}>Heute</button>
        <button className={filters.timeframe === "upcoming" ? "active" : ""} type="button" onClick={() => onChange({ ...filters, timeframe: "upcoming" })}>Demnächst</button>
        {/* Nur für Admin/Owner sichtbar: Stattgefunden, Papierkorb */}
        {(userRole === "admin" || userRole === "owner") && (
          <>
            <button className={filters.timeframe === "past" ? "active" : ""} type="button" onClick={() => onChange({ ...filters, timeframe: "past" })}>Stattgefunden</button>
            <button className={filters.timeframe === "deleted" ? "active" : ""} type="button" onClick={() => onChange({ ...filters, timeframe: "deleted" })}>Papierkorb</button>
          </>
        )}
      </div>

      <div className="filter-grid">
        <label>
          Monat
          <select value={filters.month} onChange={(event) => onChange({ ...filters, month: event.target.value })}>
            <option value="all">Alle Monate</option>
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label>
          Ort
          <select value={filters.location} onChange={(event) => onChange({ ...filters, location: event.target.value })}>
            <option value="all">Alle Orte</option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </label>

        <button
          className="button secondary"
          disabled={!hasActiveFilter}
          type="button"
          onClick={() => onChange({ month: "all", location: "all", timeframe: "all" })}
        >
          <RotateCcw size={16} />
          Zurücksetzen
        </button>
      </div>

      <p className="muted">{resultCount} Termin{resultCount === 1 ? "" : "e"} im aktuellen Filter</p>
    </section>
  );
}

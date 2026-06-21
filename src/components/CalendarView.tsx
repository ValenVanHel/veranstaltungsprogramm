"use client";

import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { calendarColor, eventScheduleDate, hasEventTakenPlace, todayKey } from "@/lib/calendar";
import { formatDate, formatDateTime } from "@/lib/format";
import type { EventRecord, Profile, UserRole } from "@/lib/types";
import { canManageEvents } from "@/lib/roles";

type CalendarViewProps = {
  events: EventRecord[];
  profiles: Profile[];
  role: UserRole;
  onSelectEvent: (event: EventRecord) => void;
};

export function CalendarView({ events, profiles, role, onSelectEvent }: CalendarViewProps) {

  const privileged = canManageEvents(role);
  const visibleEvents = events.filter((event) => privileged || event.status === "active");
  const currentDate = todayKey();
  const todayEvents = visibleEvents.filter((event) => event.status === "active" && event.start_date <= currentDate && eventScheduleDate(event) >= currentDate);
  const upcomingEvents = visibleEvents.filter((event) => event.status === "active" && event.start_date > currentDate);

  // Nur Admins/Owner bekommen die past/deleted-Listen überhaupt angezeigt:
  const pastEvents = privileged ? visibleEvents.filter((event) => event.status === "active" && hasEventTakenPlace(event)) : [];
  const deletedEvents = (role === "admin" || role === "owner") ? visibleEvents.filter((event) => event.status === "deleted") : [];

  return (
    <section className="panel calendar-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Kalender</span>
          <h2>{privileged ? "Admin-/Owner-Kalender" : "Aktiver Plan"}</h2>
        </div>
        <CalendarDays size={24} />
      </div>

      <CalendarSection
        emptyText="Heute stehen keine Termine im aktuellen Filter an."
        events={todayEvents}
        onSelectEvent={onSelectEvent}
        privileged={privileged}
        profiles={profiles}
        role={role}
        title="Heute"
      />

      <CalendarSection
        emptyText="Keine demnächst anstehenden Termine im aktuellen Filter."
        events={upcomingEvents}
        onSelectEvent={onSelectEvent}
        privileged={privileged}
        profiles={profiles}
        role={role}
        title="Demnächst"
      />


      {/* "Stattgefunden" nur für Admin & Owner anzeigen */}
      {(role === "admin" || role === "owner") && (
        <CalendarSection
          emptyText="Keine stattgefundenen Termine im aktuellen Filter."
          events={pastEvents}
          onSelectEvent={onSelectEvent}
          privileged={privileged}
          profiles={profiles}
          role={role}
          title="Stattgefunden"
        />
      )}

      {(role === "admin" || role === "owner") && (
        <CalendarSection
          emptyText="Keine gelöschten Termine im aktuellen Filter."
          events={deletedEvents}
          onSelectEvent={onSelectEvent}
          privileged={privileged}
          profiles={profiles}
          role={role}
          title="Papierkorb"
        />
      )}
    </section>
  );
}

type CalendarSectionProps = {
  emptyText: string;
  events: EventRecord[];
  onSelectEvent: (event: EventRecord) => void;
  privileged: boolean;
  profiles: Profile[];
  role: UserRole;
  title: string;
};

function CalendarSection({ emptyText, events, onSelectEvent, privileged, profiles, role, title }: CalendarSectionProps) {
  return (
    <div className="calendar-section">
      <div className="calendar-section-heading">
        <h3>{title}</h3>
        <span>{events.length}</span>
      </div>
      {events.length === 0 ? (
        <p className="empty-section-text">{emptyText}</p>
      ) : (
        <div className="event-grid">
          {events.map((event) => {
            const creator = profiles.find((profile) => profile.id === event.created_by);
            return (
              <button
                className={`event-tile ${privileged ? calendarColor(event) : "event-public"}`}
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
              >
                <span className="event-date">{formatDate(event.start_date)}</span>
                <strong>{event.action_name}</strong>
                <span className="event-meta"><MapPin size={14} />{event.location_name}</span>
                {event.start_time && <span className="event-meta">🕑 {event.start_time}</span>}
                {/* Admins/Owner sehen Ersteller */}
                {(role === "admin" || role === "owner") && (
                  <span className="event-admin-meta">
                    <UserRound size={14} />
                    {creator?.login_name || "unbekannt"}
                  </span>
                )}
                {(role === "admin" || role === "owner") && event.status === "deleted" && <span className="trash-badge">Papierkorb</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

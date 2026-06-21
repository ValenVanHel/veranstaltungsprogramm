"use client";

import { CalendarCheck, History, Trash2, UsersRound } from "lucide-react";
import { eventScheduleDate, hasEventTakenPlace, todayKey } from "@/lib/calendar";
import type { EventRecord, Profile, UserRole } from "@/lib/types";

type StatBarProps = {
  events: EventRecord[];
  profiles: Profile[];
  userRole: UserRole;
};

export function StatBar({ events, profiles, userRole }: StatBarProps) {
  const currentDate = todayKey();
  const todayEvents = events.filter((event) => event.status === "active" && event.start_date <= currentDate && eventScheduleDate(event) >= currentDate).length;
  const upcomingEvents = events.filter((event) => event.status === "active" && event.start_date > currentDate).length;
  const pastEvents = events.filter((event) => event.status === "active" && hasEventTakenPlace(event)).length;
  const deletedEvents = events.filter((event) => event.status === "deleted").length;
  const privilegedUsers = profiles.filter((profile) => profile.role === "admin" || profile.role === "owner").length;

  return (
    <section className="stat-bar">
      <div className="stat-item"><CalendarCheck size={18} /><span>{todayEvents}</span><small>Heute</small></div>
      <div className="stat-item"><CalendarCheck size={18} /><span>{upcomingEvents}</span><small>Demnächst</small></div>
      <div className="stat-item"><History size={18} /><span>{pastEvents}</span><small>Stattgefunden</small></div>
      {(userRole === "admin" || userRole === "owner") && (
        <div className="stat-item"><Trash2 size={18} /><span>{deletedEvents}</span><small>Papierkorb</small></div>
      )}
      <div className="stat-item"><UsersRound size={18} /><span>{privilegedUsers}</span><small>Admins/Owner</small></div>
    </section>
  );
}

"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { AdminDashboard } from "./AdminDashboard";
import { UserAdminPanel } from "./UserAdminPanel";
import { formatDate, formatDateTime } from "@/lib/format";
import type { EventRecord, Profile, UserRole } from "@/lib/types";

type AdminManagementTableProps = {
  events: EventRecord[];
  profiles: Profile[];
  userRole: UserRole;
  onEdit: (event: EventRecord) => void;
  onRestore: (event: EventRecord) => void;
  onDeleteForever: (event: EventRecord) => void;
};

export default function AdminManagementTable({ events, profiles, userRole, onEdit, onRestore, onDeleteForever }: AdminManagementTableProps) {
  const isAdminArea = userRole === "admin" || userRole === "owner";

  return (
    <>
      {isAdminArea && <AdminDashboard currentUserRole={userRole} />}

      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Verwaltung</span>
            <h2>Termine</h2>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Start</th>
                <th>Ort</th>
                <th>Aktion</th>
                <th>Status</th>
                <th>Erstellt</th>
                <th>BenutzerLogin</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const creator = profiles.find((profile) => profile.id === event.created_by);

                return (
                  <tr key={event.id}>
                    <td>{formatDate(event.start_date)}</td>
                    <td>{event.location_name}</td>
                    <td>{event.action_name}</td>
                    <td>
                      <span className={`status-pill status-${event.status}`}>
                        {event.status === "active" ? "Aktiv" : "Gelöscht"}
                      </span>
                    </td>
                    <td>{formatDateTime(event.created_at)}</td>
                    <td>{creator?.login_name || "unbekannt"}</td>
                    <td className="table-actions">
                      <button className="icon-button" type="button" onClick={() => onEdit(event)} aria-label="Bearbeiten">
                        Bearbeiten
                      </button>
                      {isAdminArea && event.status === "deleted" && (
                        <button className="icon-button" type="button" onClick={() => onRestore(event)} aria-label="Wiederherstellen">
                          <RotateCcw size={16} />
                        </button>
                      )}
                      {isAdminArea && event.status === "deleted" && (
                        <button className="icon-button danger-icon" type="button" onClick={() => onDeleteForever(event)} aria-label="Endgültig löschen">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {isAdminArea && <UserAdminPanel currentUserRole={userRole} />}
    </>
  );
}

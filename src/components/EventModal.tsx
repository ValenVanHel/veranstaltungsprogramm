import React from "react";
import type { EventRecord, Profile, UserRole } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/format";

interface EventModalProps {
  event: EventRecord;
  creator?: Profile;
  onClose: () => void;
  role: UserRole;
}

export default function EventModal({ event, creator, onClose, role }: EventModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>{event.action_name}</h2>
        <div className="modal-details">
          <div><b>Datum:</b> {formatDate(event.start_date)}</div>
          {event.start_time && <div><b>Uhrzeit:</b> {event.start_time}</div>}
          <div><b>Ort:</b> {event.location_name}</div>
          {event.end_active && event.end_date && <div><b>Enddatum:</b> {formatDate(event.end_date)}</div>}
          {event.more_info && <div><b>Weitere Infos:</b> {event.more_info}</div>}
          {event.responsible_names.length > 0 && <div><b>Verantwortliche:</b> {event.responsible_names.join(", ")}</div>}
          {(role === "admin" || role === "owner") && (
            <>
              <div><b>Erstellt von:</b> {creator?.display_name || event.created_by}</div>
              <div><b>Erstellt am:</b> {formatDateTime(event.created_at)}</div>
              {event.updated_at !== event.created_at && <div><b>Letzte Änderung:</b> {formatDateTime(event.updated_at)}</div>}
            </>
          )}
        </div>
        {(role === "admin" || role === "owner") && (
          <button className="button primary" style={{ marginTop: "1.4em", width: "100%" }} type="button" id="modal-edit-trigger">
            Bearbeiten
          </button>
        )}
      </div>
      <style>{`
        .modal-overlay {
          position: fixed; left: 0; top: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;
        }
        .modal-content {
          background: #fff; padding: 2rem; border-radius: 8px; max-width: 450px; width: 90%; min-width: 280px; position: relative;
        }
        .modal-close {
          position: absolute; top: 12px; right: 18px; background: none; border: none; font-size: 2rem; cursor: pointer;
        }
        .modal-details { margin-top: 1rem; font-size: 1.09em; display: flex; flex-direction: column; gap: .5em; }
        h2 { margin: 0 0 1rem 0; }
      `}</style>
    </div>
  );
}

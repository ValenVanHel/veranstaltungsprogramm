"use client";

import { Save, Trash2 } from "lucide-react";
import { maxActionLength, maxLocationLength, maxMoreInfoLength, standardLocations } from "@/lib/constants";
import type { EventFormState, EventRecord } from "@/lib/types";

type EventFormPanelProps = {
  form: EventFormState;
  selectedEvent: EventRecord | null;
  errors: string[];
  canDelete: boolean;
  onChange: (patch: Partial<EventFormState>) => void;
  onSubmit: () => void;
  onNew: () => void;
  onTrash: () => void;
};

export function EventFormPanel({ form, selectedEvent, errors, canDelete, onChange, onSubmit, onNew, onTrash }: EventFormPanelProps) {
  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Pflege</span>
          <h2>{selectedEvent ? "Termin bearbeiten" : "Termin erstellen"}</h2>
        </div>
        <button className="button secondary" type="button" onClick={onNew}>Neu</button>
      </div>

      <div className="form-grid">
        <label>
          Ort
          <input
            list="locations"
            maxLength={maxLocationLength}
            value={form.location_name}
            onChange={(event) => onChange({ location_name: event.target.value })}
          />
          <small>{form.location_name.length}/{maxLocationLength}</small>
        </label>
        <datalist id="locations">
          {standardLocations.map((location) => <option key={location} value={location} />)}
        </datalist>

        <label>
          Startdatum
          <input type="date" value={form.start_date} onChange={(event) => onChange({ start_date: event.target.value })} />
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={form.end_active}
            onChange={(event) => onChange({ end_active: event.target.checked })}
          />
          Enddatum aktiv
        </label>

        <label>
          Enddatum
          <input
            disabled={!form.end_active}
            type="date"
            value={form.end_date}
            onChange={(event) => onChange({ end_date: event.target.value })}
          />
        </label>

        <label className="span-2">
          Aktion
          <input
            maxLength={maxActionLength}
            value={form.action_name}
            onChange={(event) => onChange({ action_name: event.target.value })}
          />
          <small>{form.action_name.length}/{maxActionLength}</small>
        </label>

        <label className="span-2">
          Verantwortliche
          <input
            value={form.responsible_names}
            onChange={(event) => onChange({ responsible_names: event.target.value })}
            placeholder="Namen durch Komma trennen"
          />
        </label>

        <label>
          Startzeit (optional)
          <input type="time" value={form.start_time} onChange={e => onChange({ start_time: e.target.value })} />
          <small>Uhrzeit zu Beginn der Aktion (HH:MM)</small>
        </label>
        <label>
          Weitere Infos
          <input maxLength={maxMoreInfoLength} value={form.more_info} onChange={e => onChange({ more_info: e.target.value })} />
          <small>{form.more_info.length}/{maxMoreInfoLength}</small>
        </label>
      </div>

      {errors.length > 0 && (
        <div className="error-box">
          {errors.map((error) => <p key={error}>{error}</p>)}
        </div>
      )}

      <div className="button-row">
        <button className="button primary" type="button" onClick={onSubmit}>
          <Save size={16} />
          {selectedEvent ? "Aktualisieren" : "Speichern"}
        </button>
        {canDelete && selectedEvent && selectedEvent.status === "active" && (
          <button className="button danger" type="button" onClick={onTrash}>
            <Trash2 size={16} />
            In Papierkorb
          </button>
        )}
      </div>
    </section>
  );
}

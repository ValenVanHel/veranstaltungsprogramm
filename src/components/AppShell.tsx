"use client";
import EventModal from "./EventModal";

import { useEffect, useMemo, useState } from "react";
import { AuthPanel } from "./AuthPanel";
import { CalendarView } from "./CalendarView";
import { EventFormPanel } from "./EventFormPanel";
import AdminManagementTable from "./AdminManagementTable";
import { UserAdminPanel } from "./UserAdminPanel";
import { RoleManager } from "./RoleManager";
import { ImportExportPanel } from "./ImportExportPanel";
import { StatBar } from "./StatBar";
import type { EventStatus } from "@/lib/types";
import { EventFilters } from "./EventFilters";
// Demo-Daten entfernt
import { emptyEventForm, formFromEvent, validateEventForm } from "@/lib/event-form";
import { emptyEventFilters, filterEvents, locationOptionsFromEvents, monthOptionsFromEvents } from "@/lib/filters";
import { canManageEvents, canManageRoles } from "@/lib/roles";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { loadInitialData } from "@/lib/data";
import type { EventFiltersState, EventFormState, EventRecord, Profile, SessionUser, UserRole } from "@/lib/types";
import Link from "next/link";

export default function AppShell() {
  // Deklaration der States vor ihrer Benutzung (nur einmal definiert)
  const [modalEvent, setModalEvent] = useState<EventRecord | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState<EventFormState>(emptyEventForm);

      // Edit-Trigger-Button aus Modal abgreifen (Hook MUSS ganz oben stehen):
      useEffect(() => {
        if (!modalEvent || !(user?.role === "admin" || user?.role === "owner")) return;
        const btn = document.getElementById("modal-edit-trigger");
        if (!btn) return;
        const click = () => {
          setShowEdit(true);
          setForm(formFromEvent(modalEvent));
          setSelectedEvent(modalEvent);
        };
        btn.addEventListener("click", click);
        return () => btn.removeEventListener("click", click);
          // doppelte State-Hooks entfernt

      }, [modalEvent, user, setForm]);
    // doppelte State-Hooks entfernt
  const [isHydrated, setIsHydrated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  // doppelte State-Hooks entfernt
  const [filters, setFilters] = useState<EventFiltersState>(emptyEventFilters);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const canEditEvents = canManageEvents(user?.role ?? "user");
  const canEditRoles = canManageRoles(user?.role ?? "user");
  const visibleProfiles = useMemo(() => profiles, [profiles]);
  const visibleBaseEvents = useMemo(
    () => events.filter((event) => canEditEvents || event.status === "active"),
    [canEditEvents, events]
  );
  const filteredEvents = useMemo(() => filterEvents(visibleBaseEvents, filters), [filters, visibleBaseEvents]);
  const monthOptions = useMemo(() => monthOptionsFromEvents(visibleBaseEvents), [visibleBaseEvents]);
  const locationOptions = useMemo(() => locationOptionsFromEvents(visibleBaseEvents), [visibleBaseEvents]);

  // Restore user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setIsHydrated(true);
  }, []);

  // Load data once on mount
  useEffect(() => {
    void loadData();
  }, []);

  // Listen to auth state changes from Supabase
  useEffect(() => {
    if (!supabase || !isHydrated) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authUser = session?.user;
      if (authUser) {
        try {
          const initialData = await loadInitialData();
          const profile = initialData.profiles.find((item) => item.id === authUser.id);
          const sessionUser = {
            id: authUser.id,
            email: authUser.email ?? profile?.login_name ?? "",
            role: profile?.role ?? "user",
            displayName: profile?.display_name ?? authUser.email ?? "Benutzer",
            isRootOwner: profile?.is_root_owner ?? false
          };
          setUser(sessionUser);
          localStorage.setItem("user", JSON.stringify(sessionUser));
          setProfiles(initialData.profiles);
          setEvents(initialData.events);
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Daten konnten nicht geladen werden.");
        }
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    });

    return () => subscription?.unsubscribe();
  }, [isHydrated]);

  async function loadData() {
    try {
      const initialData = await loadInitialData();
      setEvents(initialData.events);
      setProfiles(initialData.profiles);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Daten konnten nicht geladen werden.");
    }
  }

  async function handleLogin() {
    if (!supabase) return;
    setLoading(true);
    setMessage("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const authUser = data.user;
      const initialData = await loadInitialData();
      const profile = initialData.profiles.find((item) => item.id === authUser.id);
      const sessionUser = {
        id: authUser.id,
        email: authUser.email ?? profile?.login_name ?? email,
        role: profile?.role ?? "user",
        displayName: profile?.display_name ?? authUser.email ?? "Benutzer",
        isRootOwner: profile?.is_root_owner ?? false
      };
      setProfiles(initialData.profiles);
      setEvents(initialData.events);
      setUser(sessionUser);
      localStorage.setItem("user", JSON.stringify(sessionUser));
      setPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Anmeldung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("user");
    setSelectedEvent(null);
    setForm(emptyEventForm);
  }

  function selectEvent(event: EventRecord) {
    setSelectedEvent(event);
    setForm(formFromEvent(event));
    setErrors([]);
  }

  function startNewEvent() {
    setSelectedEvent(null);
    setForm(emptyEventForm);
    setErrors([]);
  }

  async function syncResponsibleNames(eventId: string, responsibleNames: string[]) {
    if (!supabase) return;

    const { error: deleteError } = await supabase.from("event_responsible").delete().eq("event_id", eventId);
    if (deleteError) throw deleteError;
    if (responsibleNames.length === 0) return;

    const { data: existingPeople, error: existingError } = await supabase
      .from("responsible_people")
      .select("id, name")
      .in("name", responsibleNames);
    if (existingError) throw existingError;

    const existingNames = new Set((existingPeople ?? []).map((person) => person.name as string));
    const missingNames = responsibleNames.filter((name) => !existingNames.has(name));
    if (missingNames.length > 0) {
      const { error: insertPeopleError } = await supabase
        .from("responsible_people")
        .insert(missingNames.map((name) => ({ name, created_by: user?.id })));
      if (insertPeopleError) throw insertPeopleError;
    }

    const { data: allPeople, error: allPeopleError } = await supabase
      .from("responsible_people")
      .select("id, name")
      .in("name", responsibleNames);
    if (allPeopleError) throw allPeopleError;

    const relationRows = (allPeople ?? []).map((person) => ({
      event_id: eventId,
      responsible_person_id: person.id as string
    }));

    if (relationRows.length > 0) {
      const { error: relationError } = await supabase.from("event_responsible").insert(relationRows);
      if (relationError) throw relationError;
    }
  }

  async function saveEvent() {
    const validationErrors = validateEventForm(form);
    setErrors(validationErrors);
    if (validationErrors.length || !user) return;

    const responsibleNames = form.responsible_names
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    try {
      setLoading(true);
      if (selectedEvent) {
        if (supabase) {
          const { error } = await supabase
            .from("events")
            .update({
              location_name: form.location_name.trim(),
              start_date: form.start_date,
              end_date: form.end_active ? form.end_date || form.start_date : null,
              end_active: form.end_active,
              action_name: form.action_name.trim(),
              start_time: form.start_time,
              more_info: form.more_info,
              updated_by: user.id
            })
            .eq("id", selectedEvent.id);
          if (error) throw error;
          await syncResponsibleNames(selectedEvent.id, responsibleNames);
        }
        const updatedEvents = events.map((event) => event.id === selectedEvent.id
          ? {
              ...event,
              location_name: form.location_name.trim(),
              start_date: form.start_date,
              end_date: form.end_active ? form.end_date || form.start_date : null,
              end_active: form.end_active,
                        action_name: form.action_name.trim(),
                        responsible_names: responsibleNames,
                        start_time: form.start_time,
                        more_info: form.more_info,
                         status: "active" as EventStatus, // Typ absichern
                         created_by: user?.id || "unknown", // Benutzer ID sichern
                        updated_by: user.id,
                        updated_at: new Date().toISOString()
                      }
                    : event);

                  setEvents(updatedEvents);
                  setMessage("Termin aktualisiert.");

                  // Bei Supabase: Daten neu laden für aktuellen Zustand
                  if (supabase) {
                    await loadData();
                  }

                  startNewEvent();
                  return;
                }

      const newEvent: EventRecord = {
        id: crypto.randomUUID(),
        location_name: form.location_name.trim(),
        start_date: form.start_date,
        end_date: form.end_active ? form.end_date || form.start_date : null,
        end_active: form.end_active,
        action_name: form.action_name.trim(),
        start_time: form.start_time,
        more_info: form.more_info,
        status: "active" as EventStatus,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_by: null,
        updated_at: new Date().toISOString(),
        deleted_by: null,
        deleted_at: null,
        responsible_names: responsibleNames
      };

      const newEventList = [...events, newEvent].sort((left, right) => left.start_date.localeCompare(right.start_date));
      setEvents(newEventList);
      setMessage("Termin erstellt.");
      
      // Bei Supabase: Daten neu laden für aktuellen Zustand
      if (supabase) {
        await loadData();
      }
      
      startNewEvent();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Termin konnte nicht gespeichert werden.");
    } finally {
      setLoading(false);
    }
  }

  async function moveToTrash() {
    if (!selectedEvent || !user) return;
    if (supabase) {
      const { error } = await supabase
        .from("events")
        .update({ status: "deleted", deleted_by: user.id, deleted_at: new Date().toISOString() })
        .eq("id", selectedEvent.id);
      if (error) {
        setMessage(error.message);
        return;
      }
    }
    const updatedEvents = events.map((event) => event.id === selectedEvent.id
      ? { ...event, status: "deleted" as EventStatus, deleted_by: user.id, deleted_at: new Date().toISOString() }
      : event);
    setEvents(updatedEvents);
    setMessage("Termin in den Papierkorb verschoben.");
    
    // Bei Supabase: Daten neu laden für aktuellen Zustand
    if (supabase) {
      await loadData();
    }
    
    startNewEvent();
  }

  async function restoreEvent(eventToRestore: EventRecord) {
    if (supabase) {
      const { error } = await supabase
        .from("events")
        .update({ status: "active", deleted_by: null, deleted_at: null })
        .eq("id", eventToRestore.id);
      if (error) {
        setMessage(error.message);
        return;
      }
    }
    const updatedEvents = events.map((event) => event.id === eventToRestore.id
      ? { ...event, status: "active" as EventStatus, deleted_by: null, deleted_at: null }
      : event);
    setEvents(updatedEvents);
    
    // Bei Supabase: Daten neu laden für aktuellen Zustand
    if (supabase) {
      await loadData();
    }
  }

  async function deleteForever(eventToDelete: EventRecord) {
    if (supabase) {
      const { error } = await supabase.from("events").delete().eq("id", eventToDelete.id);
      if (error) {
        setMessage(error.message);
        return;
      }
    }
    const updatedEvents = events.filter((event) => event.id !== eventToDelete.id);
    setEvents(updatedEvents);
    
    // Bei Supabase: Daten neu laden für aktuellen Zustand
    if (supabase) {
      await loadData();
    }
  }

  async function changeRole(profile: Profile, role: UserRole) {
    if (profile.is_root_owner) return;
    if (supabase) {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", profile.id);
      if (error) {
        setMessage(error.message);
        return;
      }
    }
    setProfiles((currentProfiles) => currentProfiles.map((item) => item.id === profile.id ? { ...item, role } : item));
  }

  async function handleImport(importedEvents: EventRecord[]) {
    if (!user) return;
    
    try {
      setLoading(true);

      if (supabase) {
        // Speichern in Supabase und Sync der Verantwortlichen
        for (const event of importedEvents) {
          const { data, error: insertError } = await supabase
            .from("events")
            .insert({
              location_name: event.location_name,
              start_date: event.start_date,
              end_date: event.end_date,
              end_active: event.end_active,
              action_name: event.action_name,
              start_time: event.start_time,
              more_info: event.more_info,
              status: event.status,
              created_by: user.id
            })
            .select("*")
            .single();

          if (insertError) throw insertError;

          // Sync verantwortliche
          if (event.responsible_names.length > 0 && data?.id) {
            await syncResponsibleNames(data.id as string, event.responsible_names);
          }
        }
      } else {
        // Demo-Modus: Zu lokalen Events hinzufügen
        const mergedEvents = [...events, ...importedEvents].sort((left, right) =>
          left.start_date.localeCompare(right.start_date)
        );
        setEvents(mergedEvents);
      }

      // Refresh: Alle Daten neu laden
      await loadData();
      setMessage(`${importedEvents.length} Termine importiert und Kalender aktualisiert.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!isHydrated && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          zIndex: 9999,
          animation: "fadeOut 0.3s ease-out forwards",
          pointerEvents: "none"
        }} />
      )}
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
      <main className="app-shell">
        <header className="topbar">
          <div>
            <span className="eyebrow">Webversion</span>
            <h1>Veranstaltungsprogramm</h1>
          </div>
          <span className={isSupabaseConfigured ? "connection live" : "connection demo"}>
            {isSupabaseConfigured ? "Supabase verbunden" : "Demo-Modus"}
          </span>
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <Link href="/admin/roles" className="button secondary" style={{marginLeft:'1rem'}}>
              Rollen verwalten
            </Link>
          )}
        </header>

        <div className="layout-grid">
          <aside className="sidebar">
            <AuthPanel
              configured={isSupabaseConfigured}
              user={user}
              email={email}
              password={password}
              loading={loading}
              message={message}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
            {user && <StatBar events={filteredEvents} profiles={visibleProfiles} userRole={user.role} />}
            
          </aside>

          <section className="main-column">
          {!user && (
            <section className="panel empty-state">
              <h2>Bitte anmelden</h2>
              <p>Nach dem Login sehen User den aktiven Kalender. Admins und Owner erhalten zusätzlich die Pflegeoberfläche.</p>
              
            </section>
          )}

          {user && (
            <>
              {canEditRoles && <UserAdminPanel currentUserRole={user.role} />}  // Benutzerverwaltung oben
              <EventFilters
                filters={filters}
                monthOptions={monthOptions}
                locationOptions={locationOptions}
                resultCount={filteredEvents.length}
                userRole={user.role}
                onChange={setFilters}
              />
              <CalendarView
                events={filteredEvents}
                profiles={visibleProfiles}
                role={user.role}
                onSelectEvent={event => {
                  setModalEvent(event);
                  setShowEdit(false);
                }}
              />
              {modalEvent && (
                <>
                  <EventModal
                    event={modalEvent}
                    creator={visibleProfiles.find(p => p.id === modalEvent.created_by)}
                    role={user.role}
                    onClose={() => setModalEvent(null)}
                  />
                  {(user.role === "admin" || user.role === "owner") && showEdit && (
                    <div className="modal-overlay" style={{ zIndex: 10000 }}>
                      <div className="modal-content" style={{ maxWidth: 480, minWidth: 280 }}>
                        <EventFormPanel
                          form={form}
                          selectedEvent={modalEvent}
                          errors={errors}
                          canDelete={user.role === "admin" || user.role === "owner"}
                          onChange={patch => setForm(f => ({ ...f, ...patch }))}
                          onSubmit={() => { setModalEvent(null); setSelectedEvent(null); setShowEdit(false); saveEvent(); }}
                          onNew={startNewEvent}
                          onTrash={moveToTrash}
                        />
                        <button className="modal-close" onClick={() => setShowEdit(false)} style={{ position: 'absolute', right: 20, top: 10, fontSize: 24 }}>×</button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {canEditEvents && (
                <div className="admin-grid">
                  <EventFormPanel
                    form={form}
                    selectedEvent={selectedEvent}
                    errors={errors}
                    canDelete={user.role === "admin" || user.role === "owner"}
                    onChange={(patch) => setForm((currentForm) => ({ ...currentForm, ...patch }))}
                    onSubmit={saveEvent}
                    onNew={startNewEvent}
                    onTrash={moveToTrash}
                  />
                  <ImportExportPanel 
                    events={filteredEvents} 
                    profiles={visibleProfiles}
                    userId={user.id}
                    onImportComplete={handleImport}
                  />
                </div>
              )}
              {canEditEvents && (
                <AdminManagementTable
                  events={filteredEvents}
                  profiles={visibleProfiles}
                  userRole={user.role}
                  onEdit={selectEvent}
                  onRestore={restoreEvent}
                  onDeleteForever={deleteForever}
                />
              )}
            </>
          )}
        </section>
        </div>
      </main>
    </>
  );
}

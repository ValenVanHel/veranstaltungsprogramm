// demo-data entfernt
import { supabase } from "./supabase";
import type { EventRecord, Profile } from "./types";

type RawEventRecord = EventRecord & {
  event_responsible?: Array<{
    responsible_people?: { name: string } | null;
  }>;
};

type RawEventResponsible = {
  event_id: string;
  responsible_person_id: string;
};

type RawResponsiblePerson = {
  id: string;
  name: string;
};

export async function loadInitialData(): Promise<{ events: EventRecord[]; profiles: Profile[] }> {
  if (!supabase) {
    throw new Error('Supabase nicht konfiguriert');
  }


  const [
    { data: events, error: eventsError },
    { data: profiles, error: profilesError },
    { data: eventResponsible, error: eventResponsibleError },
    { data: responsiblePeople, error: responsiblePeopleError }
  ] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: true }),
    supabase.from("profiles").select("id, display_name, login_name, role, is_root_owner"),
    supabase.from("event_responsible").select("event_id, responsible_person_id"),
    supabase.from("responsible_people").select("id, name")
  ]);


  if (eventsError) throw eventsError;
  if (profilesError) throw profilesError;
  if (eventResponsibleError) throw eventResponsibleError;
  if (responsiblePeopleError) throw responsiblePeopleError;

  const personNameById = new Map<string, string>(
    ((responsiblePeople ?? []) as RawResponsiblePerson[]).map((person) => [person.id, person.name])
  );

  const namesByEventId = new Map<string, string[]>();
  for (const relation of (eventResponsible ?? []) as RawEventResponsible[]) {
    const name = personNameById.get(relation.responsible_person_id);
    if (!name) continue;
    const list = namesByEventId.get(relation.event_id) ?? [];
    list.push(name);
    namesByEventId.set(relation.event_id, list);
  }

  const normalizedEvents: EventRecord[] = ((events ?? []) as RawEventRecord[]).map((event) => ({
    ...event,
    responsible_names: namesByEventId.get(event.id) ?? []
  }));

  return {
    events: normalizedEvents,
    profiles: (profiles ?? []) as Profile[]
  };
}

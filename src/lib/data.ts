// demo-data entfernt
import { supabase } from "./supabase";
import type { EventRecord, Profile } from "./types";

type RawEventRecord = EventRecord & {
  event_responsible?: Array<{
    responsible_people?: { name: string } | null;
  }>;
};

export async function loadInitialData(): Promise<{ events: EventRecord[]; profiles: Profile[] }> {
  if (!supabase) {
    throw new Error('Supabase nicht konfiguriert');
  }

  const [{ data: events, error: eventsError }, { data: profiles, error: profilesError }] = await Promise.all([
    supabase
      .from("events")
      .select("*, event_responsible(responsible_people(name))")
      .order("start_date", { ascending: true }),
    supabase.from("profiles").select("id, display_name, login_name, role, is_root_owner")
  ]);

  if (eventsError) throw eventsError;
  if (profilesError) throw profilesError;

  return {
    events: ((events ?? []) as RawEventRecord[]).map((event) => ({
      ...event,
      responsible_names: Array.isArray(event.event_responsible)
        ? event.event_responsible
            .map((entry) => entry.responsible_people?.name)
            .filter((name): name is string => Boolean(name))
        : []
    })),
    profiles: (profiles ?? []) as Profile[]
  };
}

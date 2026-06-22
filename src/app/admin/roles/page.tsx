"use client";
import { useEffect, useState } from "react";
import { RoleManager } from "@/components/RoleManager";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { loadInitialData } from "@/lib/data";
import type { Profile, UserRole } from "@/lib/types";
import Link from "next/link";

export default function AdminRolesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadInitialData().then(data => setProfiles(data.profiles)).catch(err => setMessage(err.message));
  }, []);

  async function handleChangeRole(profile: Profile, role: UserRole) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", profile.id);
      if (error) throw error;
      setProfiles(current => current.map(p => p.id === profile.id ? { ...p, role } : p));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Fehler beim Ändern der Rolle");
    }
  }

  return (
    <main className="admin-page">
      <h1>Rollenverwaltung</h1>
      <Link href="/">Zurück zum Dashboard</Link>
      {message && <p className="status-text">{message}</p>}
      <RoleManager profiles={profiles} onChangeRole={handleChangeRole} />
    </main>
  );
}
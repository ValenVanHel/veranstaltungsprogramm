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

  async function sendProfileMutation(action: "change-role" | "set-root-owner" | "unset-root-owner", profile: Profile, role?: UserRole) {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      throw new Error("Keine aktive Sitzung gefunden.");
    }

    const response = await fetch("/api/admin/profiles", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ action, profileId: profile.id, role })
    });

    const payload = await response.json().catch(() => ({} as { error?: string }));
    if (!response.ok) {
      throw new Error(payload.error || "Änderung konnte nicht gespeichert werden.");
    }
  }

  async function handleChangeRole(profile: Profile, role: UserRole) {
    try {
      await sendProfileMutation("change-role", profile, role);
      await loadInitialData().then(data => setProfiles(data.profiles));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Fehler beim Ändern der Rolle");
    }
  }

  async function handleSetRootOwner(profile: Profile) {
    try {
      await sendProfileMutation("set-root-owner", profile);
      await loadInitialData().then(data => setProfiles(data.profiles));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Fehler beim Setzen des Root-Owners");
    }
  }

  async function handleUnsetRootOwner(profile: Profile) {
    try {
      await sendProfileMutation("unset-root-owner", profile);
      await loadInitialData().then(data => setProfiles(data.profiles));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Fehler beim Entfernen des Root-Owners");
    }
  }

  return (
    <main className="admin-page">
      <h1>Rollenverwaltung</h1>
      <Link href="/">Zurück zum Dashboard</Link>
      {message && <p className="status-text">{message}</p>}
      <RoleManager profiles={profiles} onChangeRole={handleChangeRole}
        onSetRootOwner={handleSetRootOwner}
        onUnsetRootOwner={handleUnsetRootOwner}
      />
    </main>
  );
}
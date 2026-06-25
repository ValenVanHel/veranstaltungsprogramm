"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppShell from "@/components/AppShell";
import { AuthPanel } from "@/components/AuthPanel";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { SessionUser } from "@/lib/types";
import { loadInitialData } from "@/lib/data";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [configured] = useState(isSupabaseConfigured);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        router.replace("/");
      }
    })();
  }, [router]);

  async function handleLogin() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    const authUser = data.user;

    // Prüfen, ob Profil existiert
    const { data: existingProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, login_name, role, is_root_owner")
      .eq("id", authUser.id);
    if (profileError) {
      setMessage("Fehler beim Laden des Profils");
      setLoading(false);
      return;
    }

    let profile = null;
    if (!existingProfiles || existingProfiles.length === 0) {
      // Profil anlegen, wenn nicht vorhanden
      const { data: createdProfiles, error: createError } = await supabase
        .from("profiles")
        .insert([{ id: authUser.id, login_name: authUser.email, display_name: authUser.email, role: "user", is_root_owner: false }]);
      if (createError) {
        setMessage("Fehler beim Erstellen des Profils");
        setLoading(false);
        return;
      }
      profile = createdProfiles ? createdProfiles[0] : null;
    } else {
      profile = existingProfiles[0];
    }

    const sessionUser = {
      id: authUser.id,
      email: authUser.email ?? profile?.login_name ?? email,
      role: profile?.role ?? "user",
      displayName: profile?.display_name ?? authUser.email ?? "Benutzer",
      isRootOwner: profile?.is_root_owner ?? false
    };
    setUser(sessionUser);
    localStorage.setItem("user", JSON.stringify(sessionUser));
    router.replace("/");
  }

  function handleLogout() {
    if (supabase) supabase.auth.signOut();
    setUser(null);
  }

  return (
    <main className="login-page">
      <h1>Anmelden</h1>
      <AuthPanel
        configured={configured}
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
    </main>
  );
}
"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [configured] = useState(isSupabaseConfigured);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) router.replace("/");
    })();
  }, [router]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!configured || !supabase) return;
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setMessage("Registrierung erfolgreich! Bitte überprüfe dein Postfach.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Registrierung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <h1>Neue Anmeldung</h1>
      <form onSubmit={handleRegister} className="auth-form">
        <label>
          E-Mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.org"
          />
        </label>
        <label>
          Passwort
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
          />
        </label>
        <button className="button primary" type="submit" disabled={loading || !configured}>
          {loading ? "Registrierung..." : "Registrieren"}
        </button>
        {message && <p className="status-text">{message}</p>}
        {!configured && <p className="status-text">Registrierung ist derzeit nicht verfügbar.</p>}
      </form>
    </main>
  );
}
"use client";

import { LogIn, ShieldCheck } from "lucide-react";
import type { FormEvent, PointerEvent } from "react";
import type { SessionUser, UserRole } from "@/lib/types";
import { roleLabel } from "@/lib/roles";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type AuthPanelProps = {
  configured: boolean;
  user: SessionUser | null;
  email: string;
  password: string;
  loading: boolean;
  message: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
  onLogout: () => void;
  onDemoLogin: (role: UserRole) => void;
};

export function AuthPanel({
  configured,
  user,
  email,
  password,
  loading,
  message,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onLogout,
  onDemoLogin
}: AuthPanelProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regMessage, setRegMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onLogin();
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;
    if (!supabase) { setRegMessage("Supabase nicht konfiguriert."); return; }
    try {
      const { error } = await supabase.auth.signUp({ email: regEmail, password: regPassword });
      if (error) throw error;
      setRegMessage("Registrierung erfolgreich, bitte prüfe deine E-Mail.");
    } catch (err) {
      setRegMessage(err instanceof Error ? err.message : "Registrierung fehlgeschlagen.");
    }
  }

  function handleDemoPointer(event: PointerEvent<HTMLButtonElement>, role: UserRole) {
    event.preventDefault();
    onDemoLogin(role);
  }

  if (user) {
    return (
      <section className="panel auth-panel compact-panel">
        <div>
          <span className="eyebrow">Angemeldet</span>
          <h2>{user.displayName}</h2>
          <p>{user.email}</p>
        </div>
        <span className={`role-pill role-${user.role}`}>
          <ShieldCheck size={16} />
          {roleLabel(user.role)}
        </span>
        <button className="button secondary" type="button" onClick={onLogout}>
          Abmelden
        </button>
      </section>
    );
  }

  return (
    <section className="panel auth-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Login</span>
          <h2>Zugang</h2>
        </div>
        <LogIn size={22} />
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          BenutzerLogin
          <input value={email} onChange={(event) => onEmailChange(event.target.value)} placeholder="name@example.org" />
        </label>
        <label>
          Passwort
          <input type="password" value={password} onChange={(event) => onPasswordChange(event.target.value)} placeholder="Passwort" />
        </label>
        <button className="button primary" disabled={loading || !configured} type="submit">
          {loading ? "Anmeldung läuft" : "Einloggen"}
        </button>
      </form>
      {!user && (
        <Link href="/register" className="button tertiary" style={{ display: 'block', marginTop: '1rem' }}>
          Neu registrieren
        </Link>
      )}
      {!user && !configured && (
        <button className="button tertiary" type="button" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Abbrechen" : "Neu registrieren"}
        </button>
      )}
      {isRegistering && (
        <form className="auth-form" onSubmit={handleRegister}>
          <label>
            E-Mail
            <input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="name@example.org" />
          </label>
          <label>
            Passwort
            <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Passwort" />
          </label>
          <button className="button primary" type="submit" disabled={!configured}>
            Registrieren
          </button>
          {regMessage && <p className="status-text">{regMessage}</p>}
        </form>
      )}

      {!configured && (
        <div className="demo-box">
          <p>Supabase ist noch nicht verbunden. Für die Oberfläche kannst du direkt eine Rolle simulieren.</p>
          <div className="segmented">
            <button className="demo-role-button" type="button" onPointerDown={(event) => handleDemoPointer(event, "user")} onClick={() => onDemoLogin("user")}>User</button>
            <button className="demo-role-button" type="button" onPointerDown={(event) => handleDemoPointer(event, "admin")} onClick={() => onDemoLogin("admin")}>Admin</button>
            <button className="demo-role-button" type="button" onPointerDown={(event) => handleDemoPointer(event, "owner")} onClick={() => onDemoLogin("owner")}>Owner</button>
          </div>
        </div>
      )}

      {message && <p className="status-text">{message}</p>}
    </section>
  );
}

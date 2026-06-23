import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = "user" | "admin" | "owner";
export type UserStatus = "pending" | "active" | "blocked";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

type UserAdminPanelProps = {
  currentUserRole: UserRole;
};

// Fetch real users from Supabase profiles table
// Remove dummyUsers

export function UserAdminPanel({ currentUserRole }: UserAdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Lade Benutzer aus Supabase
    (async () => {
      const { data, error } = await supabase.from('profiles').select('id,display_name: display_name,login_name,email:login_name,role,is_root_owner');
      if (error) {
        console.error('Fehler beim Laden der Profile', error);
        return;
      }
      // Mappe Profile zu User-Interface
      setUsers((data ?? []).map(p => ({
        id: p.id,
        name: p.display_name,
        email: p.login_name,
        role: p.role as UserRole,
        status: 'active'
      })));
    })();
  }, []);

  function canManageUsers() {
    return currentUserRole === "admin" || currentUserRole === "owner";
  }

  function handleRoleChange(id: string, newRole: UserRole) {
    if (!canManageUsers()) return;
    setUsers((users) => users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
  }

  function handleStatusChange(id: string, newStatus: UserStatus) {
    if (!canManageUsers()) return;
    setUsers((users) => users.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));
  }

  return (
    <section className="panel user-admin-panel">
      <header>
        <h2>Benutzerverwaltung</h2>
      </header>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Rolle</th>
            <th>Status</th>
            {canManageUsers() && <th>Aktionen</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                {canManageUsers() ? (
                  <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td>
                {canManageUsers() ? (
                  <select value={user.status} onChange={(e) => handleStatusChange(user.id, e.target.value as UserStatus)}>
                    <option value="pending">Vorabgemeldet</option>
                    <option value="active">Aktiv</option>
                    <option value="blocked">Gesperrt</option>
                  </select>
                ) : (
                  user.status
                )}
              </td>
              {canManageUsers() && <td><button onClick={() => alert(`Aktion für Nutzer ${user.name}`)}>Aktion</button></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

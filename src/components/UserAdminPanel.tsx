import React, { useState, useEffect } from "react";

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

const dummyUsers: User[] = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "user", status: "pending" },
  { id: "2", name: "Bob", email: "bob@example.com", role: "admin", status: "active" },
  { id: "3", name: "Charlie", email: "charlie@example.com", role: "owner", status: "active" },
];

export function UserAdminPanel({ currentUserRole }: UserAdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // In der echten App hier API-Aufruf zur Benutzerliste
    setUsers(dummyUsers);
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

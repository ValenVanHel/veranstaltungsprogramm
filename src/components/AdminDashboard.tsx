import React, { useEffect, useState } from "react";
import type { UserRole } from "./UserAdminPanel";
import type { User, UserStatus } from "./UserAdminPanel";

export type AdminDashboardProps = {
  currentUserRole: UserRole;
  users: User[];
};

export function AdminDashboard({ currentUserRole, users }: AdminDashboardProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);

  useEffect(() => {
    const pending = users.filter(user => user.status === "pending").length;
    const active = users.filter(user => user.status === "active").length;
    const blocked = users.filter(user => user.status === "blocked").length;
    setPendingCount(pending);
    setActiveCount(active);
    setBlockedCount(blocked);
  }, [users]);

  if (!(currentUserRole === "admin" || currentUserRole === "owner")) {
    return <p>Kein Zugriff auf Admin Dashboard.</p>;
  }

  return (
    <section className="panel admin-dashboard">
      <h2>Admin Dashboard</h2>
      <ul>
        <li>Neuanmeldungen (pending): {pendingCount}</li>
        <li>Aktive Mitglieder: {activeCount}</li>
        <li>Gesperrte Benutzer: {blockedCount}</li>
      </ul>
    </section>
  );
}

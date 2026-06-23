import React from "react";
import type { UserRole } from "@/lib/types";
import Link from "next/link";

export type AdminDashboardProps = {
  currentUserRole: UserRole;
};

export function AdminDashboard({ currentUserRole }: AdminDashboardProps) {
  

  if (!(currentUserRole === "admin" || currentUserRole === "owner")) {
    return <p>Kein Zugriff auf Admin Dashboard.</p>;
  }

  return (
    <section className="panel admin-dashboard">
      <h2>Admin Übersicht</h2>
      <div className="dashboard-tiles">
        <Link href="/admin/events/new" className="tile">
          <h3>Neue Kalendereinträge</h3>
        </Link>
        <Link href="/admin/import" className="tile">
          <h3>Import / Export</h3>
        </Link>
        <Link href="/admin/roles" className="tile">
          <h3>Rollen verwalten</h3>
        </Link>
      </div>
    </section>
  );
}

"use client";

import { Crown, Shield, UserRound } from "lucide-react";
import { roleLabel } from "@/lib/roles";
import type { Profile, UserRole } from "@/lib/types";

type RoleManagerProps = {
  profiles: Profile[];
  onChangeRole: (profile: Profile, role: UserRole) => void;
  onSetRootOwner: (profile: Profile) => void;
};

export function RoleManager({ profiles, onChangeRole, onSetRootOwner }: RoleManagerProps) {
  const hasRootOwner = profiles.some(p => p.is_root_owner);
  return (
    <section id="role-panel" className="panel role-panel auth-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Owner</span>
          <h2>Rollen</h2>
        </div>
        <Crown size={22} />
      </div>
      <div className="role-list">
        {profiles.map((profile) => (
          <div className="role-row" key={profile.id} style={{ alignItems: 'center' }}>
            <div>
              <strong>{profile.display_name}</strong>
              <span>{profile.login_name}</span>
            </div>
            <span className={`role-pill role-${profile.role}`}>
              {roleLabel(profile.role)}{profile.is_root_owner ? " · erster Owner" : ""}
            </span>
            <select
              disabled={profile.is_root_owner}
              value={profile.role}
              onChange={(event) => onChangeRole(profile, event.target.value as UserRole)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
            {!hasRootOwner && (
              <button className="button tertiary" onClick={() => onSetRootOwner(profile)}>
                Als Root-Owner bestätigen
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

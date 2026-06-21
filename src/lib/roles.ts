import type { UserRole } from "./types";

export function roleLabel(role: UserRole): string {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  return "User";
}

export function canManageEvents(role: UserRole): boolean {
  return role === "admin" || role === "owner";
}

export function canManageRoles(role: UserRole): boolean {
  return role === "owner";
}

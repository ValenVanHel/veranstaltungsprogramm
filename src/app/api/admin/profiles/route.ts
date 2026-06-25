import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/types";

type MutationRequest = {
  action?: "change-role" | "set-root-owner" | "unset-root-owner";
  profileId?: string;
  role?: UserRole;
};

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error("Supabase ist für die Rollenverwaltung nicht vollständig konfiguriert.");
  }

  return { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey };
}

export async function PATCH(request: Request) {
  try {
    const { action, profileId, role } = (await request.json()) as MutationRequest;
    if (!action || !profileId) {
      return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization") ?? "";
    const bearerToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7) : "";
    if (!bearerToken) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = getSupabaseEnv();
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${bearerToken}` } }
    });
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: userResult, error: userError } = await authClient.auth.getUser(bearerToken);
    if (userError || !userResult.user) {
      return NextResponse.json({ error: "Sitzung konnte nicht verifiziert werden." }, { status: 401 });
    }

    const requesterId = userResult.user.id;
    const { data: requesterProfile, error: requesterError } = await adminClient
      .from("profiles")
      .select("id, role, is_root_owner")
      .eq("id", requesterId)
      .single();

    if (requesterError || !requesterProfile) {
      return NextResponse.json({ error: "Profil konnte nicht geladen werden." }, { status: 403 });
    }

    const { data: rootOwners, error: rootOwnerError } = await adminClient
      .from("profiles")
      .select("id")
      .eq("is_root_owner", true);

    if (rootOwnerError) {
      return NextResponse.json({ error: rootOwnerError.message }, { status: 500 });
    }

    const hasRootOwner = (rootOwners ?? []).length > 0;
    const requesterIsOwner = requesterProfile.role === "owner" || requesterProfile.is_root_owner;
    const isSelfBootstrap = action === "set-root-owner" && !hasRootOwner && profileId === requesterId;

    if (!requesterIsOwner && !isSelfBootstrap) {
      return NextResponse.json({ error: "Keine Berechtigung für diese Änderung." }, { status: 403 });
    }

    if (action === "change-role") {
      if (!role) {
        return NextResponse.json({ error: "Rolle fehlt." }, { status: 400 });
      }
      const { error } = await adminClient.from("profiles").update({ role }).eq("id", profileId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === "set-root-owner") {
      const { error } = await adminClient.from("profiles").update({ is_root_owner: true, role: "owner" }).eq("id", profileId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === "unset-root-owner") {
      const rootOwnerCount = (rootOwners ?? []).length;
      if (rootOwnerCount <= 1 && profileId === requesterId) {
        return NextResponse.json({ error: "Der letzte Root-Owner kann nicht entfernt werden." }, { status: 400 });
      }
      const { error } = await adminClient.from("profiles").update({ is_root_owner: false }).eq("id", profileId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unerwarteter Fehler." }, { status: 500 });
  }
}
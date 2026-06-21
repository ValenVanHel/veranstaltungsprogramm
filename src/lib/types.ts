export type UserRole = "user" | "admin" | "owner";

export type Profile = {
  id: string;
  display_name: string;
  login_name: string;
  role: UserRole;
  is_root_owner: boolean;
};

export type EventStatus = "active" | "deleted";

export type EventRecord = {
  id: string;
  location_name: string;
  start_date: string;
  end_date: string | null;
  end_active: boolean;
  action_name: string;
  start_time: string; // Neues Feld für Uhrzeit (früher "Bemerkung 1")
  more_info: string;  // Neues Feld, ersetzt "Bemerkung 2" (200 Zeichen)
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  deleted_by: string | null;
  deleted_at: string | null;
  responsible_names: string[];
};

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  isRootOwner: boolean;
};

export type EventFormState = {
  location_name: string;
  start_date: string;
  end_date: string;
  end_active: boolean;
  action_name: string;
  responsible_names: string;
  start_time: string;
  more_info: string;
};

export type EventFiltersState = {
  month: string;
  location: string;
  timeframe: "all" | "today" | "upcoming" | "past" | "deleted";
};

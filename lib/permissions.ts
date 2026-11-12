import type { Role } from "./accounts";

export const MODULES = [
  { id: "masterstock", label: "Master Stock List" },
  { id: "report", label: "Reports / Orders" },
  { id: "logs", label: "Logs" },
  { id: "platform", label: "Platform Products" },
] as const;

export type ModuleId = (typeof MODULES)[number]["id"];
export type Action = "view" | "create" | "update" | "delete";
export const ACTIONS: Action[] = ["view", "create", "update", "delete"];
export type Perms = Record<ModuleId, Record<Action, boolean>>;

const KEY = "ss_perms";

// Default ng staff: view lang
export const DEFAULT_STAFF: Perms = Object.fromEntries(
  MODULES.map((m) => [m.id, { view: true, create: false, update: false, delete: false }])
) as Perms;

export function loadStaffPerms(): Perms {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_STAFF, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_STAFF;
}

export function saveStaffPerms(p: Perms) {
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("ss_perms")); // para mag-update agad ang sidebar
}

export const hasPerm = (role: Role, perms: Perms, m: ModuleId, a: Action) =>
  role === "admin" ? true : !!perms[m]?.[a];
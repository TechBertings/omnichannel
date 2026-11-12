export type Role = "admin" | "staff";
export type Account = { user: string; name: string; pass: string; role: Role; active: boolean; last?: string };
const KEY = "ss_accounts";

// TODO: remove when real auth is in place
const SEED: Account[] = [
  { user: "admin", name: "Fritz Almene", pass: "admin123", role: "admin", active: true },
  { user: "staff01", name: "Staff 01", pass: "staff123", role: "staff", active: true },
  { user: "staff02", name: "Staff 02", pass: "staff123", role: "staff", active: true },
  { user: "staff03", name: "Staff 03", pass: "staff123", role: "staff", active: false },
];

export function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return SEED;
}

export function saveAccounts(list: Account[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}
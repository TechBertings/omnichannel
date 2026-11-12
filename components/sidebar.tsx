"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cx } from "./ui";
import type { Role } from "@/lib/accounts";
import { DEFAULT_STAFF, hasPerm, loadStaffPerms, type ModuleId, type Perms } from "@/lib/permissions";

const nav: { href: string; label: string; module?: ModuleId }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/masterstock", label: "Master Stock List", module: "masterstock" },
  { href: "/report", label: "Reports / Orders", module: "report" },
  { href: "/logs", label: "Logs", module: "logs" },
  { href: "/platform", label: "Platform Products", module: "platform" },
];

// UI only: palitan ng real notification state later
const HAS_NOTIF = true;

const GearIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
);

const PowerIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v9" />
    <path d="M6.4 6.6a8 8 0 1 0 11.2 0" />
  </svg>
);

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [role, setRole] = useState("staff");
  const [user, setUser] = useState("");
  const [perms, setPerms] = useState<Perms>(DEFAULT_STAFF);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRole(localStorage.getItem("ss_role") ?? "staff");
    setUser(localStorage.getItem("ss_name") ?? "");
    const sync = () => setPerms(loadStaffPerms());
    sync();
    window.addEventListener("ss_perms", sync);
    return () => window.removeEventListener("ss_perms", sync);
  }, []);
  useEffect(() => { setOpen(false); setMenu(false); }, [path]);

  // close popover on outside click / Esc
  useEffect(() => {
    if (!menu) return;
    const onClick = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, [menu]);

  const signOut = () => {
    localStorage.removeItem("ss_role");
    localStorage.removeItem("ss_user");
    localStorage.removeItem("ss_name");
    router.push("/login");
  };

  const name = user || role;
  const menuLink = "block rounded-md px-2 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white";

  return (
    <>
      <header className="flex items-center justify-between bg-ink px-4 py-3 text-white lg:hidden">
        <span className="font-semibold">OmniChannel</span>
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="rounded px-3 py-1 text-sm ring-1 ring-white/30">Menu</button>
      </header>
      <aside className={cx("w-full shrink-0 flex-col bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64", open ? "flex" : "hidden")}>
        <div className="px-6 py-7 text-xl font-semibold tracking-tight">OmniChannel</div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.filter((n) => !n.module || hasPerm(role as Role, perms, n.module, "view")).map((n) => {
            const active = path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
                className={cx("block rounded-md border-l-2 px-3 py-2.5 text-sm", active ? "border-accent bg-white/10 font-medium" : "border-transparent text-white/70 hover:bg-white/5 hover:text-white")}>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div ref={menuRef} className="relative flex items-center justify-around border-t border-white/10 bg-black/20 px-3 py-3">
          {menu && (
            <div role="menu" className="absolute bottom-full left-3 mb-2 w-56 rounded-lg border border-white/10 bg-ink p-2 shadow-lg">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-semibold uppercase">{name[0]}</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{name}</div>
                  <span className="mt-0.5 inline-block rounded bg-white/10 px-1.5 py-0.5 text-xs capitalize text-white/70">{role}</span>
                </div>
              </div>
              <div className="my-1 border-t border-white/10" />
              <Link href="/profile" role="menuitem" className={menuLink}>View profile</Link>
              {role === "admin" && <Link href="/admin" role="menuitem" className={menuLink}>Admin</Link>}
            </div>
          )}

          <button
            onClick={() => setMenu(!menu)}
            aria-label="Settings"
            aria-haspopup="menu"
            aria-expanded={menu}
            className={cx("relative rounded-md p-2 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white", menu ? "bg-white/10 text-white" : "text-white/80")}
          >
            <GearIcon />
            {HAS_NOTIF && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-ink" aria-label="New notification" />}
          </button>

          <button
            onClick={signOut}
            aria-label="Sign out"
            title="Sign out"
            className="rounded-md p-2 text-white/50 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
          >
            <PowerIcon />
          </button>
        </div>
      </aside>
    </>
  );
}
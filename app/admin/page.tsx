"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, DataTable, Modal, PageHeader, Tabs, Col, inputCls } from "@/components/ui";
import { loadAccounts, saveAccounts, type Account, type Role } from "../../lib/accounts";
import RolesPanel from "../../components/RolesPanel";

type Acct = { platform: string; shop: string; status: string; sync: string };

const accounts: Acct[] = [
  { platform: "Lazada", shop: "Lazada Main Shop", status: "Connected", sync: "Nov 12, 10:25 AM" },
  { platform: "Shopee", shop: "Shopee Main Shop", status: "Connected", sync: "Nov 12, 10:23 AM" },
  { platform: "TikTok Shop", shop: "TikTok Main Shop", status: "Connected", sync: "Nov 12, 10:23 AM" },
];

export default function Admin() {
  const router = useRouter();
  const [tab, setTab] = useState("platforms");
  const [staff, setStaff] = useState<Account[]>([]);
  const [meUser, setMeUser] = useState("");

  // add staff
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", login: "", pass: "", role: "staff" as Role });
  const dupe = staff.some((s) => s.user === form.login.trim().toLowerCase());

  // change password
  const [target, setTarget] = useState<Account | null>(null);
  const [pw, setPw] = useState({ next: "", conf: "" });
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
   if (localStorage.getItem("ss_role") !== "admin") return router.replace("/dashboard");
   setMeUser(localStorage.getItem("ss_user") ?? "");
    setStaff(loadAccounts());
  }, [router]);

  const update = (user: string, patch: Partial<Account>) => {
    const list = staff.map((s) => (s.user === user ? { ...s, ...patch } : s));
    setStaff(list);
    saveAccounts(list);
  };

  const accCols: Col<Acct>[] = [
    { key: "p", header: "Platform", cell: (r) => <span className="font-medium">{r.platform}</span> },
    { key: "s", header: "Shop account", cell: (r) => r.shop },
    { key: "c", header: "Connection status", cell: (r) => <Badge tone="ok">{r.status}</Badge> },
    { key: "l", header: "Last successful sync", cell: (r) => r.sync },
    { key: "x", header: "Action", cell: () => <button className="underline underline-offset-4">Manage</button> },
  ];

  const staffCols: Col<Account>[] = [
    {
      key: "n", header: "Staff member",
      cell: (r) => <span className="font-medium">{r.name}{r.user === meUser && <span className="ml-2 text-xs font-normal text-ink/50">(you)</span>}</span>,
    },
    { key: "l", header: "Login ID", cell: (r) => <code className="text-xs">{r.user}</code> },
    {
      key: "r", header: "Role",
      cell: (r) => (
        <select
          className={`${inputCls} py-1.5 disabled:opacity-50`}
          value={r.role}
          disabled={r.user === meUser}
          title={r.user === meUser ? "You can't change your own role" : undefined}
          aria-label={`Role for ${r.name}`}
          onChange={(e) => update(r.user, { role: e.target.value as Role })}
        >
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
      ),
    },
    { key: "s", header: "Status", cell: (r) => <Badge tone={r.active ? "ok" : "mute"}>{r.active ? "Active" : "Inactive"}</Badge> },
    { key: "t", header: "Last sign-in", cell: (r) => r.last ?? "Never" },
    {
      key: "x", header: "Action",
      cell: (r) => (
        <div className="flex gap-4">
          <button className="underline underline-offset-4" onClick={() => { setTarget(r); setPw({ next: "", conf: "" }); setPwErr(""); }}>
            Change password
          </button>
          <button
            className="underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
            disabled={r.user === meUser}
            title={r.user === meUser ? "You can't deactivate yourself" : undefined}
            onClick={() => update(r.user, { active: !r.active })}
          >
            {r.active ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  const save = () => {
    if (!form.name.trim() || !form.login.trim() || form.pass.length < 6 || dupe) return;
    const list = [...staff, { user: form.login.trim().toLowerCase(), name: form.name.trim(), pass: form.pass, role: form.role, active: true }];
    setStaff(list);
    saveAccounts(list);
    setForm({ name: "", login: "", pass: "", role: "staff" });
    setAdding(false);
  };

  const savePw = () => {
    if (!target) return;
    if (pw.next.length < 6) return setPwErr("Password must be at least 6 characters.");
    if (pw.next !== pw.conf) return setPwErr("Passwords do not match.");
    update(target.user, { pass: pw.next });
    setTarget(null);
  };

  return (
    <>
      <PageHeader title="Administrator">{tab === "staff" && <Button onClick={() => setAdding(true)}>+ Add staff</Button>}</PageHeader>
        <Tabs tabs={[{ id: "platforms", label: "Platform accounts" }, { id: "staff", label: "Staff accounts" }, { id: "roles", label: "Roles & permissions" }]} value={tab} onChange={setTab} />
              {tab === "platforms" && <DataTable rows={accounts} cols={accCols} rowKey={(r) => r.platform} />}
              {tab === "staff" && <DataTable rows={staff} cols={staffCols} rowKey={(r) => r.user} />}
              {tab === "roles" && <RolesPanel />}

      {adding && (
        <Modal title="Add staff" onClose={() => setAdding(false)}>
          <div className="space-y-3">
            <input className={`${inputCls} w-full`} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={`${inputCls} w-full`} placeholder="Login ID" value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} />
            {dupe && <p role="alert" className="text-sm text-red-700">That login ID is already taken. Choose another.</p>}
            <input type="password" className={`${inputCls} w-full`} placeholder="Temporary password (min. 6 characters)" autoComplete="new-password" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} />
            <select className={`${inputCls} w-full`} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} aria-label="Role">
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button onClick={save}>Save staff</Button></div>
        </Modal>
      )}

      {target && (
        <Modal title={`Change password · ${target.name}`} onClose={() => setTarget(null)}>
          <div className="space-y-3">
            {pwErr && <p role="alert" className="text-sm text-red-700">{pwErr}</p>}
            <input autoFocus type="password" className={`${inputCls} w-full`} placeholder="New password" autoComplete="new-password" value={pw.next} onChange={(e) => { setPw({ ...pw, next: e.target.value }); setPwErr(""); }} />
            <input type="password" className={`${inputCls} w-full`} placeholder="Confirm new password" autoComplete="new-password" value={pw.conf} onChange={(e) => { setPw({ ...pw, conf: e.target.value }); setPwErr(""); }} />
          </div>
          <div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setTarget(null)}>Cancel</Button><Button onClick={savePw}>Save password</Button></div>
        </Modal>
      )}
    </>
  );
}
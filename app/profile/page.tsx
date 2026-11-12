"use client";
import { useEffect, useState } from "react";
import { Button, inputCls } from "@/components/ui";
import { loadAccounts, saveAccounts, type Account } from "@/lib/accounts";

export default function Profile() {
  const [me, setMe] = useState<Account | null>(null);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [conf, setConf] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("ss_user");
    setMe(loadAccounts().find((a) => a.user === u) ?? null);
  }, []);

  if (!me) return <main className="p-8 text-sm text-ink/60">Loading…</main>;

  const submit = () => {
    if (cur !== me.pass) return setMsg({ ok: false, text: "Current password is incorrect." });
    if (next.length < 6) return setMsg({ ok: false, text: "New password must be at least 6 characters." });
    if (next !== conf) return setMsg({ ok: false, text: "Passwords do not match." });
    saveAccounts(loadAccounts().map((a) => (a.user === me.user ? { ...a, pass: next } : a)));
    setMe({ ...me, pass: next });
    setCur(""); setNext(""); setConf("");
    setMsg({ ok: true, text: "Password updated." });
  };

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>

      <section className="flex items-center gap-4 rounded-xl border border-line bg-white p-6">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-ink text-xl font-semibold uppercase text-white">{me.name[0]}</div>
        <div className="min-w-0">
          <div className="truncate text-lg font-medium">{me.name}</div>
          <div className="text-sm text-ink/60">@{me.user}</div>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="rounded bg-ink/10 px-2 py-0.5 capitalize">{me.role}</span>
            <span className={me.active ? "rounded bg-green-100 px-2 py-0.5 text-green-800" : "rounded bg-red-100 px-2 py-0.5 text-red-800"}>
              {me.active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </section>

      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4 rounded-xl border border-line bg-white p-6">
        <h2 className="font-medium">Change password</h2>
        {msg && (
          <div role="alert" className={`rounded-md border px-3 py-2 text-sm ${msg.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
            {msg.text}
          </div>
        )}
        <input type="password" className={`${inputCls} w-full`} placeholder="Current password" autoComplete="current-password" value={cur} onChange={(e) => { setCur(e.target.value); setMsg(null); }} />
        <input type="password" className={`${inputCls} w-full`} placeholder="New password" autoComplete="new-password" value={next} onChange={(e) => { setNext(e.target.value); setMsg(null); }} />
        <input type="password" className={`${inputCls} w-full`} placeholder="Confirm new password" autoComplete="new-password" value={conf} onChange={(e) => { setConf(e.target.value); setMsg(null); }} />
        <Button type="submit">Update password</Button>
      </form>
    </main>
  );
}
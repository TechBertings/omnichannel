"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { ACTIONS, DEFAULT_STAFF, MODULES, loadStaffPerms, saveStaffPerms, type Action, type ModuleId, type Perms } from "@/lib/permissions";

export default function RolesPanel() {
  const [saved, setSaved] = useState<Perms>(DEFAULT_STAFF);
  const [draft, setDraft] = useState<Perms>(DEFAULT_STAFF);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const p = loadStaffPerms();
    setSaved(p);
    setDraft(p);
  }, []);

  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);

  const toggle = (m: ModuleId, a: Action) => {
    setOk(false);
    setDraft((d) => {
      const cur = { ...d[m], [a]: !d[m][a] };
      if (a === "view" && !cur.view) { cur.create = false; cur.update = false; cur.delete = false; }
      return { ...d, [m]: cur };
    });
  };

  const save = () => { saveStaffPerms(draft); setSaved(draft); setOk(true); };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-line bg-white px-4 py-3 text-sm text-ink/70">
        <span className="font-medium text-ink">Admin</span> has full access to all modules and cannot be changed. The Dashboard is always available to everyone.
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-medium">Staff permissions</h2>
          <p className="text-sm text-ink/60">Unchecking View hides the module from the sidebar and blocks access.</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-ink/5 text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Module</th>
              {ACTIONS.map((a) => <th key={a} className="px-4 py-3 text-center font-medium capitalize">{a}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {MODULES.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-medium">{m.label}</td>
                {ACTIONS.map((a) => (
                  <td key={a} className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-ink disabled:opacity-40"
                      checked={draft[m.id][a]}
                      disabled={a !== "view" && !draft[m.id].view}
                      aria-label={`${a} ${m.label}`}
                      onChange={() => toggle(m.id, a)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3">
        {ok && <span role="status" className="text-sm text-green-800">Permissions saved.</span>}
        <button disabled={!dirty} onClick={() => { setDraft(saved); setOk(false); }} className="rounded-md px-4 py-2 text-sm ring-1 ring-line hover:bg-ink/5 disabled:opacity-40">Discard</button>
        <Button disabled={!dirty} onClick={save}>Save changes</Button>
      </div>
    </div>
  );
}
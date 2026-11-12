"use client";
import { ReactNode, ButtonHTMLAttributes, useEffect, useState } from "react";

export const cx = (...a: (string | false | undefined | null)[]) => a.filter(Boolean).join(" ");
const field = "h-10 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/15";

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-ink/60">{sub}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={cx(field, "w-64")} />;
}

export function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={field}>
      {options.map((o) => <option key={o} value={o}>{o === "All" ? `${label}: All` : o}</option>)}
    </select>
  );
}

export function Button({ variant = "solid", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" | "ghost" }) {
  const v = { solid: "bg-ink text-white hover:bg-ink/90", outline: "border border-line bg-white hover:border-ink", ghost: "text-ink/70 hover:bg-ink/5" }[variant];
  return <button {...p} className={cx("h-10 rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50", v, className)} />;
}

const tones = { ok: "bg-emerald-50 text-emerald-800", warn: "bg-amber-50 text-amber-800", bad: "bg-red-50 text-red-700", mute: "bg-ink/5 text-ink/70" };
export function Badge({ tone = "mute", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={cx("inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function Tabs({ tabs, value, onChange }: { tabs: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div role="tablist" className="mb-5 flex gap-1 border-b border-line">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={cx("-mb-px border-b-2 px-4 py-2.5 text-sm font-medium", value === t.id ? "border-accent text-ink" : "border-transparent text-ink/55 hover:text-ink")}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export type Range = { from: string; to: string };
export const noRange: Range = { from: "", to: "" };
export const inRange = (d: string, r: Range) => (!r.from || d.slice(0, 10) >= r.from) && (!r.to || d.slice(0, 10) <= r.to);

export function DateRange({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  const iso = (d: Date) => d.toLocaleDateString("en-CA");
  const preset = (days: number) => { const t = new Date(), f = new Date(); f.setDate(t.getDate() - days + 1); onChange({ from: iso(f), to: iso(t) }); };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input type="date" aria-label="From date" value={value.from} max={value.to || undefined} onChange={(e) => onChange({ ...value, from: e.target.value })} className={field} />
      <span className="text-sm text-ink/40">to</span>
      <input type="date" aria-label="To date" value={value.to} min={value.from || undefined} onChange={(e) => onChange({ ...value, to: e.target.value })} className={field} />
      <select aria-label="Quick range" value="" className={field} onChange={(e) => (e.target.value === "all" ? onChange(noRange) : preset(+e.target.value))}>
        <option value="" disabled>Quick range</option>
        <option value="1">Today</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="all">All time</option>
      </select>
    </div>
  );
}

export type Col<T> = { key: string; header: string; cell: (r: T) => ReactNode; className?: string };
export function DataTable<T>({ rows, cols, rowKey, rowClass, pageSize = 8 }: { rows: T[]; cols: Col<T>[]; rowKey: (r: T) => string; rowClass?: (r: T) => string | undefined; pageSize?: number }) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  useEffect(() => setPage(1), [rows.length, size]);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const cur = Math.min(page, pages);
  const start = (cur - 1) * size;
  const slice = rows.slice(start, start + size);
  return (
    <div className="rounded-lg border border-line bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-paper text-left text-xs text-ink/60">
              {cols.map((c) => <th key={c.key} className={cx("whitespace-nowrap px-4 py-3 font-medium", c.className)}>{c.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr><td colSpan={cols.length} className="px-4 py-14 text-center text-ink/50">No results. Try changing your search or filters.</td></tr>
            ) : slice.map((r) => (
              <tr key={rowKey(r)} className={cx("border-b border-line/70 last:border-0 hover:bg-paper/60", rowClass?.(r))}>
                {cols.map((c) => <td key={c.key} className={cx("px-4 py-3", c.className)}>{c.cell(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-ink/60">
        <span>{rows.length === 0 ? "0 items" : `Showing ${start + 1}–${Math.min(start + size, rows.length)} of ${rows.length}`}</span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">Rows
            <select value={size} onChange={(e) => setSize(+e.target.value)} className="h-8 rounded border border-line bg-white px-2">
              {[5, 8, 10, 25, 50].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
          <Button variant="outline" className="h-8 px-3" disabled={cur <= 1} onClick={() => setPage(cur - 1)}>Previous</Button>
          <span aria-live="polite">Page {cur} of {pages}</span>
          <Button variant="outline" className="h-8 px-3" disabled={cur >= pages} onClick={() => setPage(cur + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export const inputCls = field;
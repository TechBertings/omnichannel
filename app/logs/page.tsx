"use client";
import { useMemo, useState } from "react";
import { Badge, Button, DataTable, DateRange, PageHeader, SearchInput, Select, Col, inRange, noRange, Range, cx } from "@/components/ui";
import { logs, eventTypes, bySku, fmtDT, type Log } from "@/lib/data";
import { useAccess } from "@/lib/useAccess";

const results = ["All", "Completed", "Rejected"];

const delta = (l: Log) => (l.from === null || l.to === null ? 0 : l.to - l.from);
const change = (l: Log) => {
  if (l.from === null || l.to === null) return "No change";
  const d = delta(l);
  return `${l.from} → ${l.to} (${d >= 0 ? "+" : "−"}${Math.abs(d)})`;
};

export default function Logs() {
  const { ready, can } = useAccess("logs");
  const [q, setQ] = useState("");
  const [event, setEvent] = useState("All");
  const [result, setResult] = useState("All");
  const [range, setRange] = useState<Range>(noRange);

  const rows = useMemo(
    () =>
      logs
        .filter((l) => {
          const p = bySku(l.sku);
          return (
            inRange(l.at, range) &&
            (event === "All" || l.event === event) &&
            (result === "All" || l.result === result) &&
            `${p.product} ${p.variant} ${l.sku}`.toLowerCase().includes(q.toLowerCase())
          );
        })
        .sort((a, b) => b.at.localeCompare(a.at)),
    [q, event, result, range]
  );

  const stats = useMemo(
    () => ({
      total: rows.length,
      added: rows.reduce((n, l) => n + Math.max(0, delta(l)), 0),
      deducted: rows.reduce((n, l) => n + Math.max(0, -delta(l)), 0),
      rejected: rows.filter((l) => l.result === "Rejected").length,
    }),
    [rows]
  );

  const filtered = !!q || event !== "All" || result !== "All" || range !== noRange;
  const clearAll = () => { setQ(""); setEvent("All"); setResult("All"); setRange(noRange); };

  const exportCsv = () => {
    const head = ["Date & Time", "Event", "Product", "Variant / Fitment", "Master SKU", "Source", "Stock change", "Result"];
    const body = rows.map((r) => [fmtDT(r.at), r.event, bySku(r.sku).product, bySku(r.sku).variant, r.sku, r.source, change(r), r.result]);
    const csv = [head, ...body].map((line) => line.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "stocksync-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const cols: Col<Log>[] = [
    { key: "d", header: "Date & Time", cell: (r) => <span className="whitespace-nowrap">{fmtDT(r.at)}</span> },
    { key: "e", header: "Event", cell: (r) => r.event },
    { key: "p", header: "Product", cell: (r) => <span className="font-medium">{bySku(r.sku).product}</span> },
    { key: "v", header: "Variant / Fitment", cell: (r) => bySku(r.sku).variant },
    { key: "s", header: "Master SKU", cell: (r) => <code className="text-xs">{r.sku}</code> },
    { key: "src", header: "Source", cell: (r) => r.source },
    {
      key: "c",
      header: "Stock change",
      cell: (r) => {
        const d = delta(r);
        return <span className={cx("whitespace-nowrap", d > 0 && "text-emerald-700", d < 0 && "text-red-700")}>{change(r)}</span>;
      },
    },
    { key: "r", header: "Result", cell: (r) => <Badge tone={r.result === "Completed" ? "ok" : "warn"}>{r.result}</Badge> },
  ];

  if (!ready || !can.view) return null;

  const card = (label: string, value: number, tone?: string) => (
    <div className="rounded-xl border border-line bg-white px-4 py-3">
      <div className="text-xs text-ink/60">{label}</div>
      <div className={cx("mt-1 text-2xl font-semibold tracking-tight", tone)}>{value}</div>
    </div>
  );

  return (
    <>
      <PageHeader title="Logs">
        <SearchInput value={q} onChange={setQ} placeholder="Search product or SKU" />
        <DateRange value={range} onChange={setRange} />
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {card("Total events", stats.total)}
        {card("Units added", stats.added, "text-emerald-700")}
        {card("Units deducted", stats.deducted, "text-red-700")}
        {card("Rejected", stats.rejected, stats.rejected > 0 ? "text-accent" : undefined)}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-end gap-3">
        {filtered && <button onClick={clearAll} className="text-sm underline underline-offset-4">Clear filters</button>}
        <Select label="Event type" value={event} onChange={setEvent} options={eventTypes} />
        <Select label="Result" value={result} onChange={setResult} options={results} />
        <Button variant="ghost" onClick={exportCsv}>Export CSV</Button>
      </div>

      <DataTable rows={rows} cols={cols} rowKey={(r) => String(r.id)} rowClass={(r) => (r.result === "Rejected" ? "bg-red-50/60" : undefined)} />
    </>
  );
}
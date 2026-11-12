"use client";
import { useMemo, useState } from "react";
import { Badge, DataTable, DateRange, PageHeader, SearchInput, Select, Tabs, Col, inRange, noRange, Range, cx } from "@/components/ui";
import { products, categories, orders, logs, bySku, isLow, peso, HIGH, Order } from "@/lib/data";

type Sales = { sku: string; product: string; variant: string; units: number; revenue: number; tag?: string };
type Inv = { sku: string; product: string; variant: string; opening: number; added: number; deducted: number; closing: number };

const tabs = [{ id: "sales", label: "Sales overview" }, { id: "inventory", label: "Inventory report" }, { id: "orders", label: "Orders" }];

export default function Reports() {
  const [tab, setTab] = useState("sales");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [range, setRange] = useState<Range>(noRange);

  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase());
  const filteredOrders = useMemo(() => orders.filter((o) => {
    const p = bySku(o.sku);
    return inRange(o.date, range) && (cat === "All" || p.category === cat) && match(`${o.id} ${o.sku} ${p.product} ${p.variant}`);
  }), [q, cat, range]); // eslint-disable-line react-hooks/exhaustive-deps

  const sales = useMemo<Sales[]>(() => {
    const m = new Map<string, number>();
    filteredOrders.forEach((o) => m.set(o.sku, (m.get(o.sku) ?? 0) + o.qty));
    const list = [...m].map(([sku, units]) => { const p = bySku(sku); return { sku, product: p.product, variant: p.variant, units, revenue: units * p.price } as Sales; });
    const top = [...list].sort((a, b) => b.revenue - a.revenue)[0], most = [...list].sort((a, b) => b.units - a.units)[0];
    list.forEach((r) => { if (r === top) r.tag = "Highest amount"; else if (r === most) r.tag = "Most purchased"; });
    return list.sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  const inventory = useMemo<Inv[]>(() => products.filter((p) => p.onHand !== null && (cat === "All" || p.category === cat) && match(`${p.product} ${p.variant} ${p.sku}`)).map((p) => {
    const deducted = orders.filter((o) => o.sku === p.sku && inRange(o.date, range)).reduce((n, o) => n + o.qty, 0);
    const added = logs.filter((l) => l.sku === p.sku && l.event === "Stock Added" && inRange(l.at, range)).reduce((n, l) => n + (l.to! - l.from!), 0);
    return { sku: p.sku, product: p.product, variant: p.variant, opening: p.onHand! - added + deducted, added, deducted, closing: p.onHand! };
  }), [q, cat, range]); // eslint-disable-line react-hooks/exhaustive-deps

  const lowList = products.filter(isLow).sort((a, b) => a.onHand! - b.onHand!).slice(0, 4);
  const highList = products.filter((p) => (p.onHand ?? 0) >= HIGH).sort((a, b) => b.onHand! - a.onHand!).slice(0, 4);

  const salesCols: Col<Sales>[] = [
    { key: "p", header: "Product", cell: (r) => <span className="font-medium">{r.product}</span> },
    { key: "v", header: "Variant / Fitment", cell: (r) => r.variant },
    { key: "s", header: "Master SKU", cell: (r) => <code className="text-xs">{r.sku}</code> },
    { key: "u", header: "Units sold", className: "text-right", cell: (r) => r.units },
    { key: "r", header: "Revenue", className: "text-right", cell: (r) => peso(r.revenue) },
    { key: "t", header: "Highlight", cell: (r) => (r.tag ? <Badge tone="ok">{r.tag}</Badge> : "—") },
    { key: "x", header: "Action", cell: () => <button className="underline underline-offset-4">View</button> },
  ];
  const invCols: Col<Inv>[] = [
    { key: "p", header: "Product", cell: (r) => <span className="font-medium">{r.product}</span> },
    { key: "v", header: "Variant / Fitment", cell: (r) => r.variant },
    { key: "s", header: "Master SKU", cell: (r) => <code className="text-xs">{r.sku}</code> },
    { key: "o", header: "Opening stock", className: "text-right", cell: (r) => r.opening },
    { key: "a", header: "Stock added", className: "text-right text-emerald-700", cell: (r) => `+${r.added}` },
    { key: "d", header: "Order deductions", className: "text-right text-red-700", cell: (r) => `−${r.deducted}` },
    { key: "c", header: "Closing stock", className: "text-right", cell: (r) => <span className={cx("font-semibold", r.closing <= 9 && "text-accent")}>{r.closing}</span> },
  ];
  const orderCols: Col<Order>[] = [
    { key: "i", header: "Order ID", cell: (r) => <span className="font-medium">{r.id}</span> },
    { key: "pl", header: "Platform", cell: (r) => r.platform },
    { key: "p", header: "Product", cell: (r) => bySku(r.sku).product },
    { key: "v", header: "Variant / Fitment", cell: (r) => bySku(r.sku).variant },
    { key: "s", header: "Master SKU", cell: (r) => <code className="text-xs">{r.sku}</code> },
    { key: "q", header: "Qty", className: "text-right", cell: (r) => r.qty },
    { key: "d", header: "Date", cell: (r) => r.date },
    { key: "o", header: "Inventory outcome", cell: (r) => <Badge tone={r.outcome === "Reserve used" ? "warn" : "mute"}>{r.outcome}</Badge> },
    { key: "x", header: "Action", cell: () => <button className="underline underline-offset-4">View</button> },
  ];

  const mini = (title: string, list: typeof products, hot: boolean) => (
    <table className="w-full max-w-sm overflow-hidden rounded-lg border border-line bg-white text-sm">
      <thead><tr className="bg-paper text-left text-xs text-ink/60"><th className="px-3 py-2 font-medium">{title}</th><th className="px-3 py-2 font-medium">Variant</th><th className="px-3 py-2 text-right font-medium">Stock</th></tr></thead>
      <tbody>{list.map((p) => <tr key={p.sku} className="border-t border-line"><td className="px-3 py-2">{p.product}</td><td className="px-3 py-2 text-ink/60">{p.variant}</td><td className={cx("px-3 py-2 text-right font-semibold", hot && "text-accent")}>{p.onHand}</td></tr>)}</tbody>
    </table>
  );

  return (
    <>
      <PageHeader title="Reports / orders">
        <SearchInput value={q} onChange={setQ} placeholder={tab === "orders" ? "Search order ID or SKU" : "Search product or SKU"} />
        <DateRange value={range} onChange={setRange} />
      </PageHeader>
      <div className="mb-6 flex flex-wrap gap-4">{mini("Low stock items", lowList, true)}{mini("High stock items", highList, false)}</div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
        <Select label="Category" value={cat} onChange={setCat} options={categories} />
      </div>
      {tab === "sales" && <DataTable rows={sales} cols={salesCols} rowKey={(r) => r.sku} />}
      {tab === "inventory" && <DataTable rows={inventory} cols={invCols} rowKey={(r) => r.sku} rowClass={(r) => (r.closing <= 9 ? "bg-amber-50/60" : undefined)} />}
      {tab === "orders" && <DataTable rows={filteredOrders} cols={orderCols} rowKey={(r) => r.id} />}
    </>
  );
}
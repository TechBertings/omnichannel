"use client";
import { useMemo, useState } from "react";
import { Button, Badge, DataTable, PageHeader, SearchInput, Select, Col, cx } from "@/components/ui";
import { products, categories, isLow, Product } from "@/lib/data";

export default function MasterStock() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [lowOnly, setLowOnly] = useState(false);

  const rows = useMemo(() => products.filter((x) =>
    (cat === "All" || x.category === cat) && (!lowOnly || isLow(x)) &&
    `${x.product} ${x.variant} ${x.sku}`.toLowerCase().includes(q.toLowerCase())), [q, cat, lowOnly]);

  const cols: Col<Product>[] = [
    { key: "p", header: "Product", cell: (r) => <span className="font-medium">{r.product}</span> },
    { key: "v", header: "Variant / Fitment", cell: (r) => r.variant },
    { key: "s", header: "Master SKU", cell: (r) => <code className="text-xs">{r.sku}</code> },
    { key: "o", header: "On hand", className: "text-right", cell: (r) => r.onHand === null ? <Badge>Components</Badge> : <span className={cx(isLow(r) && "font-semibold text-accent")}>{r.onHand}{isLow(r) && <span className="ml-2"><Badge tone="warn">Low</Badge></span>}</span> },
    { key: "r", header: "Reserve", className: "text-right", cell: (r) => r.reserve ?? "—" },
    { key: "a", header: "Sellable", className: "text-right", cell: (r) => r.onHand === null ? "—" : r.onHand - (r.reserve ?? 0) },
    { key: "x", header: "Action", cell: () => <button className="underline underline-offset-4">View</button> },
  ];

  return (
    <>
      <PageHeader title="Master stock list" sub="Your single source of truth across all platforms.">
        <Button variant="outline">+ Add stock</Button>
        <Button>+ Add product</Button>
      </PageHeader>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search product or SKU" />
        <Select label="Category" value={cat} onChange={setCat} options={categories} />
        <Button variant={lowOnly ? "solid" : "outline"} aria-pressed={lowOnly} onClick={() => setLowOnly(!lowOnly)}>Low stock only</Button>
      </div>
      <DataTable rows={rows} cols={cols} rowKey={(r) => r.sku} rowClass={(r) => (isLow(r) ? "bg-amber-50/60" : undefined)} />
    </>
  );
}
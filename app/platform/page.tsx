"use client";
import { useMemo, useState } from "react";
import { Badge, DataTable, PageHeader, SearchInput, Select, Tabs, Col } from "@/components/ui";
import { platformProducts, type PlatformProduct } from "@/lib/data";
import { useAccess } from "@/lib/useAccess";

const platforms = ["All", "Shopee", "Lazada", "TikTok Shop"];
const statuses = ["All", "Linked", "Unlinked", "Needs review"];
const statusTabs = statuses.map((s) => ({ id: s, label: s }));
const sortTabs = [{ id: "master", label: "Master SKU" }, { id: "platform", label: "Platform" }];

export default function PlatformProducts() {
  const { ready, can } = useAccess("platform");
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("master");

  const rows = useMemo(
    () =>
      platformProducts
        .filter(
          (r) =>
            (platform === "All" || r.platform === platform) &&
            (status === "All" || r.status === status) &&
            `${r.name} ${r.variant} ${r.productSku} ${r.master ?? ""}`.toLowerCase().includes(q.toLowerCase())
        )
        .sort((a, b) =>
          sort === "platform" ? a.platform.localeCompare(b.platform) : (a.master ?? "~").localeCompare(b.master ?? "~")
        ),
    [q, platform, status, sort]
  );

  const cols: Col<PlatformProduct>[] = [
    { key: "n", header: "Platform product", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "v", header: "Variant / Fitment", cell: (r) => r.variant },
    { key: "s", header: "Product SKU", cell: (r) => <code className="text-xs">{r.productSku}</code> },
    { key: "p", header: "Platform", cell: (r) => r.platform },
    {
      key: "m",
      header: "Linked master SKU",
      cell: (r) => (
        <div className="flex items-center gap-2">
          {r.master ? <code className="text-xs">{r.master}</code> : <span className="text-ink/40">—</span>}
          {r.status !== "Linked" && <Badge tone={r.status === "Needs review" ? "warn" : "mute"}>{r.status}</Badge>}
        </div>
      ),
    },
    { key: "x", header: "Action", cell: () => <button className="underline underline-offset-4">View link</button> },
  ];

  if (!ready || !can.view) return null;

  return (
    <>
      <PageHeader title="Platform Products">
        <SearchInput value={q} onChange={setQ} placeholder="Search product or SKU" />
      </PageHeader>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Select label="Platform" value={platform} onChange={setPlatform} options={platforms} />
        <Select label="Link status" value={status} onChange={setStatus} options={statuses} />
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Tabs tabs={statusTabs} value={status} onChange={setStatus} />
        <Tabs tabs={sortTabs} value={sort} onChange={setSort} />
      </div>
      <DataTable rows={rows} cols={cols} rowKey={(r) => `${r.platform}-${r.productSku}`} />
    </>
  );
}
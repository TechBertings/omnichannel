import Link from "next/link";
import { PageHeader, Badge } from "@/components/ui";
import { products, isLow, logs, orders, fmtDT, bySku, peso } from "@/lib/data";

const PLATFORMS = ["Shopee", "Lazada", "TikTok Shop"];

function Card({ title, href, link, className = "", children }: { title: string; href?: string; link?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-white p-4 ${className}`}>
      <div className="mb-2 flex shrink-0 justify-between">
        <h2 className="font-semibold">{title}</h2>
        {href && <Link href={href} className="text-sm underline underline-offset-4">{link}</Link>}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  // ---- stock
  const low = products.filter(isLow).sort((a, b) => a.onHand! - b.onHand!);
  const stockValue = products.reduce((n, p) => n + (p.onHand ?? 0) * p.price, 0);

  // ---- last 7 days (ending sa pinakabagong order)
  const dates = orders.map((o) => o.date).sort();
  const lastDay = dates[dates.length - 1];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${lastDay}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const weekOrders = orders.filter((o) => days.includes(o.date));
  const rejected = logs.filter((l) => l.result === "Rejected" && days.includes(l.at.slice(0, 10))).length;
  const revenueOf = (list: typeof orders) => list.reduce((n, o) => n + o.qty * bySku(o.sku).price, 0);

  const perDay = days.map((d) => ({
    label: new Date(`${d}T00:00:00Z`).toLocaleDateString("en-PH", { month: "short", day: "numeric", timeZone: "UTC" }),
    count: weekOrders.filter((o) => o.date === d).length,
  }));
  const maxDay = Math.max(1, ...perDay.map((d) => d.count));

  const perPlatform = PLATFORMS.map((name) => {
    const list = weekOrders.filter((o) => o.platform === name);
    return { name, orders: list.length, units: list.reduce((n, o) => n + o.qty, 0), revenue: revenueOf(list) };
  });
  const maxRev = Math.max(1, ...perPlatform.map((p) => p.revenue));

  const topSellers = [...weekOrders.reduce((m, o) => m.set(o.sku, (m.get(o.sku) ?? 0) + o.qty), new Map<string, number>())]
    .map(([sku, units]) => ({ sku, units, p: bySku(sku) }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 4);
  const maxUnits = Math.max(1, ...topSellers.map((t) => t.units));

  const stats = [
    { label: "Master SKUs", value: products.length },
    { label: "Low stock", value: low.length, hot: low.length > 0 },
    { label: "Orders (last 7 days)", value: weekOrders.length },
    { label: "Revenue (last 7 days)", value: peso(revenueOf(weekOrders)) },
    { label: "Stock value (retail)", value: peso(stockValue) },
    { label: "Rejected orders (last 7 days)", value: rejected, hot: rejected > 0 },
  ];

  return (
    <>
      <PageHeader title="Dashboard" sub="What needs your attention today." />

      {/* Isang screen lang sa desktop. I-adjust ang 10rem kung may sobra/kulang na space sa baba */}
      <div className="flex flex-col gap-4 lg:h-[calc(100vh-10rem)]">
        <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-line bg-white px-4 py-3">
              <div className={`text-2xl font-semibold tracking-tight ${s.hot ? "text-accent" : ""}`}>{s.value}</div>
              <div className="mt-0.5 text-sm text-ink/60">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-3 lg:grid-rows-2">
          <Card title="Restock soon" href="/masterstock" link="Master stock">
            <ul className="divide-y divide-line">
              {low.slice(0, 4).map((x) => (
                <li key={x.sku} className="flex items-center justify-between py-2 text-sm">
                  <span className="truncate">{x.product} <span className="text-ink/50">· {x.variant}</span></span>
                  <Badge tone={x.onHand! <= 5 ? "bad" : "warn"}>{x.onHand} left</Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Orders, last 7 days" href="/report" link="Reports">
            <div className="flex h-full items-end gap-2">
              {perDay.map((d) => (
                <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <div className="flex w-full flex-1 flex-col items-center justify-end">
                    <span className="text-xs text-ink/60">{d.count}</span>
                    <div className="w-full rounded-t bg-ink/80" style={{ height: `${Math.max(4, (d.count / maxDay) * 85)}%` }} />
                  </div>
                  <span className="text-xs text-ink/50">{d.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Sales by platform (last 7 days)">
            <ul className="space-y-3">
              {perPlatform.map((p) => (
                <li key={p.name} className="text-sm">
                  <div className="mb-1 flex justify-between gap-2">
                    <span className="font-medium">{p.name}</span>
                    <span className="truncate text-ink/60">{p.orders} orders · {p.units} units · {peso(p.revenue)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink/10">
                    <div className="h-2 rounded-full bg-ink/80" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Top sellers (last 7 days)">
            <ul className="space-y-3">
              {topSellers.map((t) => (
                <li key={t.sku} className="text-sm">
                  <div className="mb-1 flex justify-between gap-2">
                    <span className="truncate">{t.p.product} <span className="text-ink/50">· {t.p.variant}</span></span>
                    <span className="shrink-0 font-semibold">{t.units} sold</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink/10">
                    <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${(t.units / maxUnits) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Latest activity" href="/logs" link="All logs" className="lg:col-span-2">
            <ul className="divide-y divide-line">
              {logs.slice(0, 4).map((x) => (
                <li key={x.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="truncate">{x.event} <span className="text-ink/50">· {bySku(x.sku).product} ({x.source})</span></span>
                  <span className="whitespace-nowrap text-ink/50">{fmtDT(x.at)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
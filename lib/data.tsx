export type Product = { product: string; variant: string; sku: string; category: string; onHand: number | null; reserve: number | null; price: number };
const p = (product: string, variant: string, sku: string, category: string, onHand: number | null, reserve: number | null, price: number): Product => ({ product, variant, sku, category, onHand, reserve, price });

export const LOW = 9, HIGH = 14;
export const products: Product[] = [
  p("Cylinder Block Set", "Honda Click", "CBS-HCLICK-01", "Engine", null, null, 1000),
  p("Brake Lever", "Black - Honda Click", "BL-HCLICK-BLK", "Brakes", 8, 2, 250),
  p("Brake Lever", "Silver - Honda Click", "BL-HCLICK-SLV", "Brakes", 5, 1, 250),
  p("Piston Kit", "Honda Click", "PK-HCLICK-01", "Engine", 14, 2, 500),
  p("Brake Pad", "Front - Honda Click", "BP-HCLICK-FRT", "Brakes", 9, 2, 200),
  p("Brake Pad", "Rear - Honda Click", "BP-HCLICK-RR", "Brakes", 15, 2, 200),
  p("Side Mirror", "Black - Yamaha Mio", "SM-MIO-BLK", "Body", 6, 1, 350),
  p("Side Mirror", "Silver - Yamaha Mio", "SM-MIO-SLV", "Body", 11, 1, 350),
  p("Chain Sprocket Set", "Yamaha Sniper", "CSS-SNIPER-01", "Drivetrain", 20, 3, 900),
  p("Clutch Lining", "Yamaha Sniper", "CL-SNIPER-01", "Drivetrain", 7, 1, 450),
  p("Air Filter", "Honda Click", "AF-HCLICK-01", "Engine", 18, 2, 180),
  p("Spark Plug", "Yamaha Mio", "SP-MIO-01", "Engine", 32, 4, 120),
];
export const categories = ["All", ...Array.from(new Set(products.map((x) => x.category)))];
export const isLow = (x: Product) => x.onHand !== null && x.onHand <= LOW;
export const bySku = (sku: string) => products.find((x) => x.sku === sku)!;
export const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;
export const fmtDT = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" });

export type Order = { id: string; platform: string; sku: string; qty: number; outcome: "Stock deducted" | "Reserve used"; date: string };
const o = (id: string, platform: string, sku: string, qty: number, outcome: Order["outcome"], date: string): Order => ({ id: `ORD-${id}`, platform, sku, qty, outcome, date });
const D = "Stock deducted", R = "Reserve used";
export const orders: Order[] = [
  o("001", "Shopee", "CBS-HCLICK-01", 1, D, "2026-11-12"), o("002", "TikTok Shop", "BL-HCLICK-BLK", 1, D, "2026-11-12"),
  o("003", "Shopee", "BL-HCLICK-SLV", 1, R, "2026-11-12"), o("004", "Lazada", "PK-HCLICK-01", 2, D, "2026-11-12"),
  o("005", "Shopee", "BP-HCLICK-FRT", 1, D, "2026-11-11"), o("006", "Lazada", "SM-MIO-BLK", 1, D, "2026-11-11"),
  o("007", "TikTok Shop", "CSS-SNIPER-01", 2, D, "2026-11-10"), o("008", "Shopee", "AF-HCLICK-01", 3, D, "2026-11-10"),
  o("009", "Shopee", "SP-MIO-01", 4, D, "2026-11-09"), o("010", "Lazada", "BL-HCLICK-BLK", 2, D, "2026-11-08"),
  o("011", "TikTok Shop", "BP-HCLICK-RR", 1, R, "2026-11-07"), o("012", "Shopee", "CL-SNIPER-01", 1, D, "2026-11-05"),
  o("013", "Lazada", "BL-HCLICK-BLK", 3, D, "2026-11-04"), o("014", "Shopee", "PK-HCLICK-01", 1, D, "2026-11-03"),
];

export type Log = { id: number; at: string; event: string; sku: string; source: string; from: number | null; to: number | null; result: "Completed" | "Rejected" };
const l = (id: number, at: string, event: string, sku: string, source: string, from: number | null, to: number | null, result: Log["result"] = "Completed"): Log => ({ id, at, event, sku, source, from, to, result });
export const logs: Log[] = [
  l(1, "2026-11-12T09:10", "Stock Added", "CBS-HCLICK-01", "Owner", 7, 12),
  l(2, "2026-11-12T09:14", "Order Deduction", "BL-HCLICK-BLK", "Shopee", 12, 11),
  l(3, "2026-11-12T09:15", "Order Deduction", "BL-HCLICK-SLV", "Lazada", 11, 10),
  l(4, "2026-11-12T09:16", "Reserve Used", "PK-HCLICK-01", "TikTok Shop", 2, 1),
  l(5, "2026-11-12T09:22", "Insufficient Stock", "BP-HCLICK-FRT", "Lazada", null, null, "Rejected"),
  l(6, "2026-11-11T14:02", "Stock Added", "SM-MIO-BLK", "Owner", 4, 6),
  l(7, "2026-11-10T10:30", "Order Deduction", "CSS-SNIPER-01", "TikTok Shop", 22, 20),
  l(8, "2026-11-10T11:12", "Order Deduction", "AF-HCLICK-01", "Shopee", 21, 18),
  l(9, "2026-11-09T16:45", "Stock Added", "SP-MIO-01", "Owner", 28, 36),
  l(10, "2026-11-09T17:01", "Order Deduction", "SP-MIO-01", "Shopee", 36, 32),
  l(11, "2026-11-07T09:30", "Stock Added", "CL-SNIPER-01", "Owner", 4, 8),
  l(12, "2026-11-05T13:20", "Order Deduction", "CL-SNIPER-01", "Shopee", 8, 7),
];
export const eventTypes = ["All", ...Array.from(new Set(logs.map((x) => x.event)))];

export type LinkStatus = "Linked" | "Unlinked" | "Needs review";
export type PlatformProduct = { name: string; variant: string; productSku: string; platform: string; master: string | null; status: LinkStatus };
const pp = (name: string, variant: string, productSku: string, platform: string, master: string | null, status: LinkStatus): PlatformProduct => ({ name, variant, productSku, platform, master, status });
export const platformProducts: PlatformProduct[] = [
  pp("Cylinder Block Set", "Honda Click", "SH-CBS-01", "Shopee", "CBS-HCLICK-01", "Linked"),
  pp("Brake Lever", "Black - Honda Click", "TT-BL-04", "TikTok Shop", "BL-HCLICK-BLK", "Linked"),
  pp("Brake Lever", "Silver - Honda Click", "SH-BL-09", "Shopee", "BL-HCLICK-SLV", "Linked"),
  pp("Piston Kit", "Honda Click", "LZ-PK-12", "Lazada", "PK-HCLICK-01", "Linked"),
  pp("Brake Pad", "Front - Honda Click", "LZ-BP-03", "Lazada", "BP-HCLICK-FRT", "Linked"),
  pp("Side Mirror", "Black - Yamaha Mio", "SH-SM-02", "Shopee", null, "Unlinked"),
  pp("Air Filter", "Honda Click", "TT-AF-07", "TikTok Shop", "AF-HCLICK-01", "Needs review"),
  pp("Chain Sprocket Set", "Yamaha Sniper", "SH-CSS-05", "Shopee", "CSS-SNIPER-01", "Linked"),
  pp("Spark Plug", "Yamaha Mio", "LZ-SP-01", "Lazada", null, "Unlinked"),
  pp("Clutch Lining", "Yamaha Sniper", "TT-CL-02", "TikTok Shop", "CL-SNIPER-01", "Needs review"),
];
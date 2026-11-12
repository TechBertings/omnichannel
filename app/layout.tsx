import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const font = Instrument_Sans({ subsets: ["latin"], variable: "--font-app" });
export const metadata: Metadata = { title: "StockSync", description: "Multi-platform inventory" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
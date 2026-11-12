"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";

// Pages that should NOT show the sidebar
const bare = ["/", "/login"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (bare.includes(path)) return <>{children}</>;
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 p-5 lg:p-8">{children}</main>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "./accounts";
import { ACTIONS, hasPerm, loadStaffPerms, type Action, type ModuleId } from "./permissions";

export function useAccess(module: ModuleId) {
  const router = useRouter();
  const [s, setS] = useState({
    ready: false,
    can: { view: false, create: false, update: false, delete: false } as Record<Action, boolean>,
  });

  useEffect(() => {
    const role = (localStorage.getItem("ss_role") ?? "staff") as Role;
    const perms = loadStaffPerms();
    const can = Object.fromEntries(ACTIONS.map((a) => [a, hasPerm(role, perms, module, a)])) as Record<Action, boolean>;
    setS({ ready: true, can });
    if (!can.view) router.replace("/dashboard");
  }, [module, router]);

  return s;
}
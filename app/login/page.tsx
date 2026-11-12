"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, inputCls, cx } from "@/components/ui";
import { loadAccounts } from "../../lib/accounts";

const MAX_TRIES = 3;
const LOCK_SECONDS = 30;

// TODO: remove when real auth is in place (the server should validate and return the role)
const DEMO_ACCOUNTS = [
  { user: "admin", pass: "admin123", role: "admin", active: true },
  { user: "staff01", pass: "staff123", role: "staff", active: true },
  { user: "staff02", pass: "staff123", role: "staff", active: true },
  { user: "staff03", pass: "staff123", role: "staff", active: false },
];

type Errors = { user?: string; pass?: string; form?: string };

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

export default function Login() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [tries, setTries] = useState(0);
  const [lockLeft, setLockLeft] = useState(0);

  useEffect(() => {
    if (lockLeft <= 0) return;
    const t = setTimeout(() => setLockLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [lockLeft]);

  const locked = lockLeft > 0;

  const submit = () => {
    if (locked) return;
    const fieldErrors: Errors = {};
    if (!user.trim()) fieldErrors.user = "Enter your username or email.";
    if (!pass) fieldErrors.pass = "Enter your password.";
    if (fieldErrors.user || fieldErrors.pass) return setErrors(fieldErrors);

    const acc = loadAccounts().find((a) => a.user === user.trim().toLowerCase() && a.pass === pass);
    if (!acc) {
      const n = tries + 1;
      if (n >= MAX_TRIES) {
        setTries(0);
        setErrors({});
        setPass("");
        return setLockLeft(LOCK_SECONDS);
      }
      setTries(n);
      const left = MAX_TRIES - n;
      return setErrors({ form: `Incorrect username or password. ${left} ${left === 1 ? "attempt" : "attempts"} left.` });
    }
    if (!acc.active) return setErrors({ form: "This account is inactive. Ask an administrator to reactivate it." });

    localStorage.setItem("ss_role", acc.role);
    localStorage.setItem("ss_user", acc.user);
    localStorage.setItem("ss_name", acc.name);
    router.push("/dashboard");
  };

  const bad = "border-red-500 focus:border-red-500 focus:ring-red-500/20";

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate className="w-full max-w-md rounded-xl border border-line bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
<div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg bg-ink text-xl font-semibold text-white">O</div>          <h1 className="text-2xl font-semibold tracking-tight">OmniChannel</h1>
          <p className="mt-1 text-sm text-ink/60">One stock count for Shopee, Lazada and TikTok Shop.</p>
        </div>

        {(locked || errors.form) && (
          <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
            {locked ? `Too many failed attempts. Try again in ${lockLeft}s.` : errors.form}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <input
              className={cx(inputCls, "w-full", errors.user && bad)}
              placeholder="Username or email"
              autoComplete="username"
              aria-invalid={!!errors.user}
              disabled={locked}
              value={user}
              onChange={(e) => { setUser(e.target.value); setErrors({}); }}
            />
            {errors.user && <p className="mt-1.5 text-sm text-red-700">{errors.user}</p>}
          </div>
          <div>
            <div className="relative">
              <input
                className={cx(inputCls, "w-full pr-11", errors.pass && bad)}
                type={show ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                aria-invalid={!!errors.pass}
                disabled={locked}
                value={pass}
                onChange={(e) => { setPass(e.target.value); setErrors({}); }}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-ink/50 hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"
              >
                <EyeIcon off={show} />
              </button>
            </div>
            {errors.pass && <p className="mt-1.5 text-sm text-red-700">{errors.pass}</p>}
          </div>
        </div>

        <Button type="submit" disabled={locked} className="mt-6 w-full">
          {locked ? `Try again in ${lockLeft}s` : "Log in"}
        </Button>
      </form>
    </div>
  );
}
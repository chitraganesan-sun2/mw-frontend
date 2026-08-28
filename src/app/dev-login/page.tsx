"use client";

/**
 * LOCAL DEV ONLY. Renders nothing unless NEXT_PUBLIC_ENABLE_DEV_LOGIN=true.
 *
 * Calls the backend's POST /api/v1/dev/login (which itself only exists when the
 * backend runs with ENVIRONMENT=dev) to get a real session for a *seeded* user,
 * so you can click through the UI without Google OAuth.
 *
 * Seed the backend first:
 *   docker compose -f docker-compose.dev.yml exec backend python scripts/seed_dev.py --wipe
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAPI_URL } from "@/definitions";
import { handleCookie } from "@/api/auth";
import { getDefaultRouteForRole } from "@/utils/routeGuard";

const ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true";

const STATUSES = [
  "details_pending",
  "verification_pending",
  "verification_completed",
  "verification_rejected",
] as const;

const routeForStatus = (status: string, role: "learner" | "volunteer") =>
  ({
    details_pending: "/onboarding",
    partially_filled: "/onboarding",
    verification_pending: "/onboarding/verification",
    verification_rejected: "/onboarding/verification",
    verification_completed: getDefaultRouteForRole(role),
  } as Record<string, string>)[status] || "/";

export default function DevLoginPage() {
  const router = useRouter();
  const [msg, setMsg] = useState<string>("");
  const [busy, setBusy] = useState<string>("");

  if (!ENABLED) {
    return (
      <div className="p-10 text-center text-gray-600">
        Dev login is disabled. Set <code>NEXT_PUBLIC_ENABLE_DEV_LOGIN=true</code> in
        <code> .env.local</code> and restart the dev server.
      </div>
    );
  }

  const login = async (email: string) => {
    setBusy(email);
    setMsg("");
    try {
      const res = await fetch(`${getAPI_URL()}/dev/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(`${res.status}: ${data?.detail || "login failed"}`);
        setBusy("");
        return;
      }
      handleCookie(data);
      router.replace(routeForStatus(data.onboarded_status, data.role));
      router.refresh();
    } catch (e: any) {
      setMsg(`Request failed — is the backend up on ${getAPI_URL()}?`);
      setBusy("");
    }
  };

  const Row = ({ role }: { role: "learner" | "volunteer" }) => (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold capitalize">{role}</h3>
      {STATUSES.map((s) => {
        const email = `${role === "volunteer" ? "vol" : "learner"}.${s}@dev.local`;
        return (
          <button
            key={email}
            onClick={() => login(email)}
            disabled={!!busy}
            className="rounded-lg border px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {busy === email ? "signing in…" : email}
            <span className="ml-2 text-xs text-gray-400">{s}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 p-10">
      <div>
        <h1 className="text-2xl font-bold">Dev login</h1>
        <p className="text-sm text-gray-500">
          API: <code>{getAPI_URL()}</code>. Seeded users only.
        </p>
      </div>
      {msg && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{msg}</div>}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <Row role="learner" />
        <Row role="volunteer" />
      </div>
      <button
        onClick={async () => {
          try {
            const r = await fetch(`${getAPI_URL()}/dev/admin-login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: "admin" }),
            });
            const d = await r.json();
            setMsg(r.ok ? `admin jwt (copy into the admin app's "token" cookie):\n${d.jwt}` : `${r.status}: ${d?.detail}`);
          } catch {
            setMsg("admin-login request failed");
          }
        }}
        className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
      >
        Get admin JWT (for the admin frontend)
      </button>
    </div>
  );
}

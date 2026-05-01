"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RolloutLinkProvider, CredentialsManager } from "@rollout/link-react";
import "@rollout/link-react/style.css";

type Connector = {
  appKey?: string;
  name?: string;
  displayName?: string;
  key?: string;
  slug?: string;
};

const GMAIL_MATCHERS = ["gmail", "googlemail"];

function normalizeConnectorValue(value?: string | null) {
  return (value ?? "").replace(/[\s_-]/g, "").toLowerCase();
}

function isGmailConnector(connector: Connector) {
  const connectorValues = [
    connector.appKey,
    connector.name,
    connector.displayName,
    connector.key,
    connector.slug,
  ].map(normalizeConnectorValue);

  return connectorValues.some((value) =>
    GMAIL_MATCHERS.some((matcher) => value.includes(matcher)),
  );
}

export default function GmailPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [credentialAdded, setCredentialAdded] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    if (storedUserId) {
      setUserId(storedUserId);
      return;
    }

    const newUserId = crypto.randomUUID();
    localStorage.setItem("userId", newUserId);
    setUserId(newUserId);
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    async function getToken() {
      try {
        const response = await fetch(`/api/rollout-token?userId=${userId}`);
        const data = await response.json();
        setToken(data.token || data);
      } catch (err) {
        setError("Failed to fetch rollout token");
      } finally {
        setLoading(false);
      }
    }

    getToken();
  }, [userId]);

  const pageShell = useMemo(
    () =>
      "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_24%),linear-gradient(135deg,_#fffdf7_0%,_#f4f7fb_52%,_#eef4ff_100%)] px-4 py-10 text-slate-900",
    [],
  );

  if (loading) {
    return (
      <main className={`${pageShell} flex items-center justify-center`}>
        <p className="text-sm text-slate-500">Loading Gmail connection…</p>
      </main>
    );
  }

  if (error || !token) {
    return (
      <main className={`${pageShell} flex items-center justify-center`}>
        <div className="rounded-3xl border border-red-200 bg-white/90 p-6 text-center shadow-lg shadow-red-100/50">
          <p className="text-sm font-medium text-red-600">
            {error ?? "No token available"}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Back to CRM Connections
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={pageShell}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 lg:flex-row">
        <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600">
            Gmail Only
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Connect a Gmail inbox without exposing the full connector catalog.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            This page keeps the Rollout connection flow focused on Gmail accounts
            only, which is useful when you want a clean handoff for mail-based
            onboarding or support workflows.
          </p>
          <div className="mt-8 rounded-3xl bg-slate-950 p-5 text-sm text-slate-100">
            <p className="font-medium">What shows up here</p>
            <p className="mt-2 text-slate-300">
              Only connectors whose metadata resolves to Gmail are rendered.
              CRM, LOS, and other providers stay hidden on this route.
            </p>
          </div>
          {credentialAdded && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Gmail credential added successfully.
            </div>
          )}
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Back to CRM Connections
          </Link>
        </section>

        <section className="flex-1 rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(59,130,246,0.12)]">
          <div className="mb-6 border-b border-slate-100 pb-5">
            <p className="text-sm font-medium text-slate-500">
              Account connector
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              Gmail account access
            </h2>
          </div>
          <RolloutLinkProvider token={token}>
            <CredentialsManager
              onCredentialAdded={() => setCredentialAdded(true)}
              shouldRenderConnector={(connector) =>
                isGmailConnector(connector as Connector)
              }
            />
          </RolloutLinkProvider>
        </section>
      </div>
    </main>
  );
}

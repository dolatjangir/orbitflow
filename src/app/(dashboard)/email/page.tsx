"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardApp } from "@/components/dashboard/dashboard-app";
import EmailWorkspaceSetup, { Banner, type ConnectResult } from "@/components/dashboard/pages/email-workspace";
import EmailConnected from "@/components/dashboard/pages/email-workspace-after";
import { getEmailConnection, type EmailConnection } from "@/store/mail/mail";

export default function EmailPage() {
  const [connection, setConnection] = useState<EmailConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ text: string; warnings: string[] }>();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const r = await getEmailConnection();
    if (r.ok) setConnection(r.data.connection);
    else setLoadError(r.error.message);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onConnected = ({ connection, message, warnings }: ConnectResult) => {
    setFlash({ text: message, warnings });
    setConnection(connection);
  };

  const onDisconnected = (text: string) => {
    setFlash({ text, warnings: [] });
    setConnection({ connected: false });
  };

  return (
    <DashboardApp initialSection="email">
      {loading ? (
        <p role="status" className="text-sm text-[var(--text-soft)]">Checking your email connection…</p>
      ) : loadError ? (
        <div className="space-y-3">
          <Banner tone="error" title="Couldn't load your email connection">{loadError}</Banner>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold hover:border-blue-500"
          >
            Try again
          </button>
        </div>
      ) : connection?.connected ? (
        <EmailConnected
          connection={connection}
          notice={flash?.text}
          warnings={flash?.warnings}
          onChange={setConnection}
          onDisconnected={onDisconnected}
        />
      ) : (
        <EmailWorkspaceSetup onConnected={onConnected} notice={flash?.text} />
      )}
    </DashboardApp>
  );
}
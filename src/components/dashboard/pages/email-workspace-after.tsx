"use client";

import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Mail, Check, MoreVertical, BarChart3, Zap, X, RefreshCw, Pencil, Users, Settings2, Trash2, AlertTriangle } from "lucide-react";
import { disconnectEmail, verifyEmailConnection, type EmailConnection } from "@/store/mail/mail";
import { Banner, ConnectForm } from "./email-workspace";

const TABS = ["Overview", "Accounts", "Settings"] as const;
type Tab = (typeof TABS)[number];
type Modal = "account" | "change" | "disconnect";
type Props = {
  /** Saved connection from the backend (never contains the password). */
  connection: EmailConnection;
  notice?: string;
  warnings?: string[];
  onChange: (connection: EmailConnection) => void;
  onDisconnected: (message: string) => void;
};

const panel = "rounded-2xl border border-[var(--border)] bg-linear-to-br from-[var(--surface)] to-[var(--page)]";
const secondaryButton = "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium transition hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40";
const primaryButton = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#0066ff] px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40";
const dangerButton = "inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40";

const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleString() : "Never");

function ProviderIcon({ provider = "" }: { provider?: string }) {
  if (/gmail|google/i.test(provider))
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white">
        <svg viewBox="0 0 32 28" className="size-8" aria-hidden="true">
          <path d="M3 25V7l6 5v13" fill="#4285f4" />
          <path d="M23 25V12l6-5v18" fill="#34a853" />
          <path d="M3 7V5q0-3 3-1l10 8 10-8q3-2 3 1v2L16 18Z" fill="#ea4335" />
          <path d="M3 7v7l6 5v-7Z" fill="#c5221f" />
          <path d="M29 7v7l-6 5v-7Z" fill="#fbbc04" />
        </svg>
      </span>
    );
  if (/outlook|microsoft|office|hotmail/i.test(provider))
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-linear-to-br from-cyan-400 to-blue-800">
        <svg viewBox="0 0 36 36" className="size-8" aria-hidden="true">
          <rect x="12" y="5" width="18" height="24" rx="2" fill="#0078d4" />
          <path d="M13 13h17v8H13Z" fill="#28a8ea" />
          <path d="m9 18 12 9 12-9v13H9Z" fill="#1490df" />
          <path d="m9 18 12 8 12-8" fill="#55c4fa" />
          <rect x="3" y="11" width="16" height="18" rx="1" fill="#0364b8" />
          <text x="11" y="24" fill="white" fontSize="13" fontWeight="700" textAnchor="middle">O</text>
        </svg>
      </span>
    );
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-500/20 text-blue-400">
      <Mail size={26} />
    </span>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 @min-[500px]:flex-row @min-[500px]:gap-4">
      <dt className="w-36 shrink-0 text-[11px] text-[var(--text-soft)]">{label}</dt>
      <dd className="min-w-0 break-words text-xs">{value}</dd>
    </div>
  );
}

/**
 * Connected workspace. Mounted by page.tsx only when the backend reports `connected: true`.
 * Every value shown comes from the saved connection returned by the API.
 */
export default function EmailConnected({ connection, notice: initialNotice, warnings: initialWarnings = [], onChange, onDisconnected }: Props) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(
    initialNotice ? { tone: "success", text: initialNotice } : null,
  );
  const [warnings, setWarnings] = useState(initialWarnings);
  const [modal, setModal] = useState<Modal>("account");
  const [busy, setBusy] = useState<null | "verify" | "disconnect" | "change">(null);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const uid = useId();

  const failed = connection.status === "failed";
  const open = (next: Modal) => {
    setModal(next);
    setError("");
    if (!dialog.current?.open) dialog.current?.showModal();
  };
  const close = () => { if (!busy) dialog.current?.close(); };

  async function verify() {
    setBusy("verify");
    setNotice(null);
    const r = await verifyEmailConnection();
    if (r.ok) {
      onChange(r.data.connection);
      setNotice({ tone: "success", text: "Mailbox verified. Sending is working." });
    } else {
      if (r.error.connection) onChange(r.error.connection);
      setNotice({ tone: "error", text: r.error.message });
    }
    dialog.current?.close();
    setBusy(null);
  }

  async function disconnect() {
    setBusy("disconnect");
    setError("");
    const r = await disconnectEmail();
    if (r.ok) {
      dialog.current?.close();
      onDisconnected("Email disconnected. Emails now go out from the default mailbox.");
    } else setError(r.error.message);
    setBusy(null);
  }

  const details: [string, ReactNode][] = [
    ["Mailbox", connection.email],
    ["Outgoing server", connection.smtp ? `${connection.smtp.host}:${connection.smtp.port} (${connection.smtp.secure ? "SSL/TLS" : "STARTTLS"})` : "—"],
    ["Sent folder copy", connection.saveToSent ? <>Saved to <span className="font-medium">{connection.sentFolder}</span></> : <span className="text-[var(--text-soft)]">Not saved by us (your provider may save it itself)</span>],
    ["Last verified", formatDate(connection.lastVerifiedAt)],
  ];

  const accountCard = (
    <article className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3">
      <ProviderIcon provider={connection.provider ?? connection.providerLabel} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <h3 className="text-xs leading-snug font-semibold">{connection.providerLabel ?? "Email account"}</h3>
          <span className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white ${failed ? "bg-red-700" : "bg-green-700"}`}>
            {failed ? <AlertTriangle size={10} /> : <Check size={10} />}
            {failed ? "Needs attention" : "Connected"}
          </span>
        </div>
        <p className="mt-1 break-all text-[11px] leading-snug text-[var(--text-soft)]">{connection.email}</p>
      </div>
      <button type="button" aria-label="Account options" className="shrink-0 rounded p-1 hover:bg-[var(--surface-3)]" onClick={() => open("account")}>
        <MoreVertical size={16} />
      </button>
    </article>
  );

  const actions = [
    { label: busy === "verify" ? "Checking…" : "Check connection", icon: RefreshCw, action: verify, disabled: !!busy },
    { label: "Change mailbox", icon: Pencil, action: () => open("change"), disabled: !!busy },
    { label: "Manage Accounts", icon: Users, action: () => setTab("Accounts") },
    { label: "Settings", icon: Settings2, action: () => setTab("Settings") },
  ];

  return (
    <section aria-label="Email workspace" className="@container w-full min-w-0 text-[var(--text)] antialiased [&_button]:cursor-pointer [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-blue-500">
      <div className="flex items-center gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-blue-950 via-blue-600 to-blue-950 text-white">
          <Mail size={29} />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight font-bold tracking-tight">Email Workspace</h1>
          <p className="mt-1 text-sm leading-snug text-[var(--text-soft)]">
            Customer emails are sent from <span className="font-medium text-[var(--text)]">{connection.email}</span>.
          </p>
        </div>
      </div>
      <nav aria-label="Email sections" className="my-2.5 grid grid-cols-3 gap-1 rounded-lg border border-[var(--border)] p-0.5">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            aria-current={tab === item ? "page" : undefined}
            onClick={() => setTab(item)}
            className={`rounded-lg px-2 py-1.5 text-xs ${tab === item ? "bg-[#0066ff] font-semibold text-white" : "font-medium hover:bg-[var(--surface-2)]"}`}
          >
            {item}
          </button>
        ))}
      </nav>

      {(notice || (failed && connection.lastError) || warnings.length > 0) && (
        <div className="mb-2.5 space-y-2">
          {notice && (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1"><Banner tone={notice.tone}>{notice.text}</Banner></div>
              <button type="button" aria-label="Dismiss notice" className="mt-2" onClick={() => setNotice(null)}><X size={14} /></button>
            </div>
          )}
          {failed && connection.lastError && (
            <Banner tone="error" title="The last check failed">
              {connection.lastError}. If you changed your mailbox password, use “Change mailbox” to enter the new one.
            </Banner>
          )}
          {warnings.map((w) => <Banner key={w} tone="warn">{w}</Banner>)}
        </div>
      )}

      {tab === "Overview" && (
        <>
          <div className="grid min-w-0 grid-cols-1 gap-4 @min-[900px]:grid-cols-2">
            <section className={`${panel} min-w-0 p-3`}>
              <div className="mb-2 flex items-start gap-3">
                <span className="mt-0.5 grid size-6 place-items-center rounded-md bg-green-500 text-white">
                  <Check size={20} strokeWidth={3} />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">Connected Email Account</h2>
                  <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-soft)]">Manage and monitor your connected mailbox.</p>
                </div>
              </div>
              {accountCard}
            </section>
            <section className={`${panel} min-w-0 p-3`}>
              <div className="mb-1 flex items-start gap-3">
                <BarChart3 size={28} className="shrink-0 text-blue-400" />
                <div>
                  <h2 className="text-sm font-semibold">Sending Details</h2>
                  <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-soft)]">Server settings detected for your mailbox.</p>
                </div>
              </div>
              <dl className="divide-y divide-[var(--border)]">{details.map(([l, v]) => <Row key={l} label={l} value={v} />)}</dl>
            </section>
          </div>
          <section className={`${panel} mt-2.5 min-w-0 p-3`}>
            <h2 className="mb-2 flex items-center gap-3 text-sm font-semibold">
              <Zap size={22} className="text-blue-200" />
              Quick Actions
            </h2>
            <div className="grid gap-1.5 @min-[850px]:grid-cols-4">
              {actions.map(({ label, icon: Icon, action, disabled }, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={action}
                  disabled={disabled}
                  className={`flex min-h-7 items-center gap-3 rounded-lg border px-3 py-1 text-left text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${i === 0 ? "border-blue-600 bg-[#0066ff] text-white hover:bg-blue-500" : "border-[var(--border)] bg-[var(--surface-2)] hover:border-blue-500"}`}
                >
                  <Icon size={18} className="shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === "Accounts" && (
        <section className={`${panel} p-4`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Email Accounts</h2>
            <button type="button" className={primaryButton} disabled={!!busy} onClick={() => open("change")}>
              <Pencil size={16} />
              Change mailbox
            </button>
          </div>
          {accountCard}
          <p className="mt-3 text-xs text-[var(--text-soft)]">One mailbox can be connected at a time. Changing it replaces the current connection.</p>
        </section>
      )}

      {tab === "Settings" && (
        <section className={`${panel} p-4`}>
          <h2 className="text-lg font-semibold">Email Settings</h2>
          <p className="mt-4 mb-2 text-xs text-[var(--text-soft)]">Customers will see</p>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm">
            <span className="mr-3 text-[var(--text-soft)]">From</span>
            <span className="font-medium">{connection.fromName}</span>{" "}
            <span className="break-all text-[var(--text-soft)]">&lt;{connection.email}&gt;</span>
          </div>
          <dl className="mt-3 divide-y divide-[var(--border)]">{details.map(([l, v]) => <Row key={l} label={l} value={v} />)}</dl>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
            <button type="button" className={secondaryButton} disabled={!!busy} onClick={() => open("change")}>
              <Pencil size={14} />
              Change sender name or mailbox
            </button>
            <button type="button" className={secondaryButton} disabled={!!busy} onClick={() => open("disconnect")}>
              <Trash2 size={14} />
              Disconnect this mailbox
            </button>
          </div>
        </section>
      )}

      <dialog
        ref={dialog}
        aria-labelledby={`${uid}-dialog`}
        onCancel={(e) => { if (busy) e.preventDefault(); }}
        onClose={() => setModal("account")}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[min(560px,94vw)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-2xl backdrop:bg-black/65"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={`${uid}-dialog`} className="text-lg font-semibold">
            {modal === "change" ? "Change mailbox" : modal === "disconnect" ? "Disconnect mailbox?" : connection.providerLabel ?? "Email account"}
          </h2>
          <button type="button" aria-label="Close dialog" disabled={!!busy} className={secondaryButton} onClick={close}>
            <X size={17} />
          </button>
        </div>
        {error && <div className="mb-3"><Banner tone="error">{error}</Banner></div>}
        {modal === "account" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ProviderIcon provider={connection.provider ?? connection.providerLabel} />
              <p className="break-all text-sm">{connection.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={primaryButton} disabled={!!busy} onClick={verify}>
                <RefreshCw size={14} />
                {busy === "verify" ? "Checking…" : "Check connection"}
              </button>
              <button type="button" className={secondaryButton} disabled={!!busy} onClick={() => open("change")}>Change mailbox</button>
              <button type="button" className={secondaryButton} disabled={!!busy} onClick={() => open("disconnect")}>Disconnect</button>
            </div>
          </div>
        )}
        {modal === "change" && (
          <ConnectForm
            provider={null}
            initial={{ email: connection.email, fromName: connection.fromName }}
            onBusy={(b) => setBusy(b ? "change" : null)}
            onDone={({ connection: next, message, warnings: w }) => {
              onChange(next);
              setWarnings(w);
              setNotice({ tone: "success", text: message });
              dialog.current?.close();
            }}
          />
        )}
        {modal === "disconnect" && (
          <div className="space-y-4">
            <p className="text-sm">Emails will go out from the default Aiworksforce mailbox again.</p>
            <div className="flex justify-end gap-2">
              <button type="button" className={secondaryButton} disabled={!!busy} onClick={close}>Keep connected</button>
              <button type="button" className={dangerButton} disabled={!!busy} onClick={disconnect}>
                {busy === "disconnect" ? "Disconnecting…" : "Disconnect"}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
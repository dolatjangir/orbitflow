"use client";

import { useState, useRef } from "react";

import {
  ArrowUp, CalendarDays, CheckCircle2, ChevronDown,
  CircleAlert, Clock3, FileText, GitBranch, History, Inbox,
  MessageSquare, MoreHorizontal, Phone, Plus, RefreshCw,
  Send, Settings, ShieldCheck, Users, BriefcaseBusiness, ChartNoAxesColumnIncreasing,
} from "lucide-react";

// Supply verified account status, metrics, and async backend handlers.
// Height assumes your existing .page-wrap padding: 26px top + 42px bottom.
// Your root layout should already import globals.css.
type Tab = "Overview" | "Templates" | "Campaigns" | "Automation" | "Delivery Logs" | "Settings";
type Props = {
  connected?: { baileys: boolean; meta: boolean };
  onSaveDraft?: (draft: { kind: "campaign" | "template"; name: string; message: string }) => Promise<void>;
  onSaveSettings?: (settings: { notifications: boolean; automaticReplies: boolean }) => Promise<void>;
  onPeriodChange?: (period: string) => Promise<void>;
  activeTab?: Tab;
  period?: string;
  baileysPhone?: string;
  lastConnected?: string;
  metaPhone?: string;
  wabaId?: string;
  verified?: boolean;
  metrics?: {
    sent: string; delivered: string; incoming: string;
    failed: string; chats: string; response: string;
    sentChange: string; deliveredChange: string; incomingChange: string;
    failedChange: string; chatsChange: string; responseChange: string;
  };
  onTabChange?: (tab: Tab) => void;
  onDateRangeClick?: () => void;
  onNewCampaign?: () => void;
  onReconnect?: (account: "baileys" | "meta") => Promise<void>;
  onViewDetails?: () => void;
  onAccountMenu?: (account: "baileys" | "meta") => void;
};

export default function WhatsAppConnected({
  activeTab: initialTab = "Overview",
  period: initialPeriod = "Last 30 days",
  baileysPhone = "Not connected",
  lastConnected = "—",
  metaPhone = "Not connected",
  wabaId = "—",
  verified = false,
  connected = { baileys: false, meta: false },
  onSaveDraft, onSaveSettings, onPeriodChange,
  metrics = {
    sent: "—", delivered: "—", incoming: "—",
    failed: "—", chats: "—", response: "—",
    sentChange: "—", deliveredChange: "—", incomingChange: "—",
    failedChange: "—", chatsChange: "—", responseChange: "—",
  },
  onTabChange, onDateRangeClick, onNewCampaign, onReconnect, onViewDetails, onAccountMenu,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [period, setPeriod] = useState(initialPeriod);
  const [panel, setPanel] = useState("Details");
  const [account, setAccount] = useState<"baileys" | "meta">("meta");
  const [drafts, setDrafts] = useState<string[]>([]);
  const [templates, setTemplates] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [notice, setNotice] = useState("");
  const modal = useRef<HTMLDialogElement>(null);
  const open = (title: string) => { setPanel(title); setName(""); setMessage(""); setError(""); modal.current?.showModal(); };
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setError("");
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  };
  const reconnect = (provider: "baileys" | "meta") => {
    setAccount(provider); open("Reconnect account");
    if (onReconnect) void run(async () => { await onReconnect(provider); setNotice("Connection flow started. Status updates when your server confirms it."); });
  };
  const tabs = [
    { name: "Overview", icon: Inbox },
    { name: "Templates", icon: FileText },
    { name: "Campaigns", icon: Send },
    { name: "Automation", icon: GitBranch },
    { name: "Delivery Logs", icon: History },
    { name: "Settings", icon: Settings },
  ] as const;
  const stats = [
    { title: "Messages Sent", value: metrics.sent, change: metrics.sentChange, icon: Send, tone: "bg-blue-500/20 text-sky-400" },
    { title: "Delivered", value: metrics.delivered, change: metrics.deliveredChange, icon: CheckCircle2, tone: "bg-emerald-500/20 text-emerald-400" },
    { title: "Incoming", value: metrics.incoming, change: metrics.incomingChange, icon: MessageSquare, tone: "bg-violet-500/20 text-violet-400" },
    { title: "Failed", value: metrics.failed, change: metrics.failedChange, icon: CircleAlert, tone: "bg-rose-500/20 text-rose-400" },
    { title: "Active Chats", value: metrics.chats, change: metrics.chatsChange, icon: Users, tone: "bg-blue-600/20 text-sky-400" },
    { title: "Response Rate", value: metrics.response, change: metrics.responseChange, icon: ChartNoAxesColumnIncreasing, tone: "bg-violet-500/20 text-violet-400" },
  ];
  const whatsappLogo = (
    <svg viewBox="0 0 48 48" fill="none" className="size-full" aria-hidden="true">
      <path d="M39 23a15 15 0 0 1-22 13L8 39l3-9a15 15 0 1 1 28-7Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M18 15c-2 0-3 3-2 6 2 6 7 10 12 11 3 0 5-3 4-4l-5-3-2 2c-3-1-5-3-6-6l2-2-2-4h-1Z" fill="currentColor" />
    </svg>
  );
  const metaLogo = (
    <svg viewBox="0 0 64 44" fill="none" className="size-full" aria-hidden="true">
      <path d="M7 31C7 14 14 6 20 8c9 3 17 29 25 29 16 0 8-30 1-30-9 0-18 30-27 30-7 0-12-1-12-6Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const outlineButton = "inline-flex min-h-8 items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]";

  return (
    <section aria-label="WhatsApp Workspace" className="@container h-[calc(100dvh-var(--header-height,66px)-68px)] min-h-0 w-full min-w-0 bg-[var(--page)] text-[var(--text)] [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-50 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-[var(--primary)]">
      <div className="flex h-full w-full min-w-0 flex-col gap-3 p-0">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 items-center gap-3 @min-[1000px]:gap-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-emerald-400 via-green-500 to-emerald-700 p-1.5 text-white shadow-lg shadow-emerald-500/10 @min-[1000px]:size-[52px]">{whatsappLogo}</span>
            <div className="min-w-0">
              <h1 className="m-0 text-xl leading-tight font-bold tracking-tight @min-[1000px]:text-2xl">WhatsApp Workspace</h1>
              <p className="mt-1 text-[11px] leading-snug text-[var(--text-soft)] @min-[1000px]:text-sm">Manage your Baileys and Meta WhatsApp, templates, campaigns and automation.</p>
            </div>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <button type="button" onClick={() => { onDateRangeClick?.(); open("Date range"); }} className={outlineButton} aria-label="Choose date range"><CalendarDays size={16} aria-hidden="true" /><span>{period}</span><ChevronDown size={14} aria-hidden="true" /></button>
            <button type="button" onClick={() => { onNewCampaign?.(); open("New campaign"); }} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-indigo-500 bg-linear-to-b from-indigo-500 to-indigo-700 px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"><Plus size={17} aria-hidden="true" />New campaign</button>
          </div>
        </header>

        <nav aria-label="WhatsApp sections" className="grid shrink-0 grid-cols-3 gap-1 rounded-lg border border-[var(--border-strong)] bg-[var(--page)] p-0.5 @min-[650px]:grid-cols-6">
          {tabs.map(({ name, icon: Icon }) => (
            <button key={name} type="button" aria-current={activeTab === name ? "page" : undefined} onClick={() => { setActiveTab(name); setNotice(""); onTabChange?.(name); }} className={`flex min-h-8 min-w-0 items-center justify-center gap-2 rounded-md px-1.5 py-1.5 text-[11px] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] @min-[1000px]:text-xs ${activeTab === name ? "bg-linear-to-b from-indigo-500 to-indigo-800 font-semibold text-white shadow-sm shadow-indigo-500/30" : "text-[var(--text)] hover:bg-[var(--surface-2)]"}`}><Icon size={16} className="shrink-0" aria-hidden="true" />{name}</button>
          ))}
        </nav>

        {activeTab === "Overview" && <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1.15fr)_minmax(0,1fr)] gap-3">
        <section aria-labelledby="connected-accounts" className="flex min-h-0 min-w-0 flex-col rounded-xl border border-[var(--border)] bg-linear-to-br from-[var(--surface)] to-[var(--page)] p-2">
          <h2 id="connected-accounts" className="mb-2 px-1 text-base leading-none font-bold tracking-tight">Connected Accounts</h2>
          <div className="grid min-h-0 flex-1 min-w-0 grid-cols-1 gap-3 @min-[760px]:grid-cols-2 @min-[1000px]:gap-5">
            {(["baileys", "meta"] as const).map((account) => {
              const isMeta = account === "meta";
              return (
                <article key={account} aria-label={isMeta ? "Meta WhatsApp account" : "Baileys WhatsApp account"} className="relative grid content-center min-w-0 grid-cols-[38px_minmax(0,1fr)_auto] gap-x-2.5 gap-y-2 rounded-xl border border-emerald-500 bg-linear-to-br from-emerald-500/5 via-[var(--surface)] to-[var(--page)] p-3 @min-[1000px]:grid-cols-[46px_minmax(0,1fr)_auto] @min-[1000px]:gap-x-4">
                  <span className={`row-span-2 grid size-[38px] place-items-center rounded-xl p-1 text-white @min-[1000px]:size-[46px] ${isMeta ? "bg-linear-to-br from-sky-400 via-blue-600 to-blue-700" : "bg-linear-to-br from-emerald-400 via-green-500 to-emerald-700"}`}>{isMeta ? metaLogo : whatsappLogo}</span>
                  <div className="col-start-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 pr-5">
                    <h3 className="text-[13px] leading-tight font-bold @min-[1000px]:text-sm">{isMeta ? "Meta WhatsApp" : "Baileys WhatsApp"}</h3>
                    <span className={`rounded-full px-2 py-1 text-[10px] leading-none text-[var(--text-soft)] ${isMeta ? "bg-indigo-500/25" : "bg-[var(--surface-3)]"}`}>{isMeta ? "Official API" : "Self-hosted"}</span>
                  </div>
                  <button type="button" aria-label={`${isMeta ? "Meta" : "Baileys"} account options`} onClick={() => { setAccount(account); onAccountMenu?.(account); open("Account options"); }} className="col-start-3 row-start-1 ml-auto grid size-6 place-items-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-soft)] hover:bg-[var(--surface-3)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"><MoreHorizontal size={16} aria-hidden="true" /></button>
                  <div className="col-span-2 col-start-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <span className="col-span-2 inline-flex w-fit shrink-0 items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-[11px] leading-none font-semibold text-[var(--success)]"><CheckCircle2 size={13} aria-hidden="true" />{connected[account] ? "Connected" : "Not connected"}</span>
                    <div className="min-w-0 flex-1 space-y-1 text-xs leading-snug">
                      {isMeta && <p className="flex items-center gap-2"><BriefcaseBusiness size={13} className="shrink-0" aria-hidden="true" /><span className="break-all">WABA ID: {wabaId}</span></p>}
                      <p className="flex items-center gap-2"><Phone size={13} className="shrink-0" aria-hidden="true" /><span>{isMeta ? `Phone: ${metaPhone}` : baileysPhone}</span></p>
                      <p className="flex items-center gap-2">{isMeta ? <ShieldCheck size={13} className="shrink-0" aria-hidden="true" /> : <Clock3 size={13} className="shrink-0" aria-hidden="true" />}<span>{isMeta ? (verified ? "Verified Business" : "Business not verified") : `Last connected: ${lastConnected}`}</span></p>
                    </div>
                    <button type="button" onClick={() => { setAccount(account); if (isMeta) { onViewDetails?.(); open("Account details"); } else { reconnect(account); } }} className={`${outlineButton} ml-auto self-center !px-2.5 !text-[11px]`}>{!isMeta && <RefreshCw size={14} aria-hidden="true" />}{isMeta ? "View details" : "Reconnect"}</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="channel-performance" className="flex min-h-0 min-w-0 flex-col rounded-xl border border-[var(--border)] bg-linear-to-br from-[var(--surface)] to-[var(--page)] p-3">
          <h2 id="channel-performance" className="mb-2 px-1 text-base leading-none font-bold tracking-tight">Channel Performance <span className="text-sm font-normal text-[var(--text-soft)]">({period})</span></h2>
         <div className="grid min-h-0 min-w-0 flex-1 auto-rows-fr grid-cols-2 gap-2 @min-[480px]:grid-cols-3 @min-[950px]:grid-cols-6">
                        {stats.map(({ title, value, change, icon: Icon, tone }) => (
              <article
  key={title}
  className="flex min-h-0 min-w-0 flex-col justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2.5"
>
  <div className="flex min-w-0 items-center gap-2">
    <span
      className={`grid size-8 shrink-0 place-items-center rounded-full ${tone}`}
    >
      <Icon size={18} aria-hidden="true" />
    </span>

    <h3 className="min-w-0 break-words text-[11px] leading-tight">
      {title}
    </h3>
  </div>

  <p className="min-w-0 break-words text-xl leading-none font-bold tracking-tight">
    {value}
  </p>

  <p
    className={`flex items-center gap-1 text-[11px] leading-none font-semibold ${
      title === "Failed"
        ? "text-[var(--danger)]"
        : "text-[var(--success)]"
    }`}
  >
    <ArrowUp size={13} className="shrink-0" aria-hidden="true" />
    {change}
  </p>
</article>
            ))}
          </div>
        </section>
        </div>}
        {activeTab !== "Overview" && (
          <section className="min-h-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">{activeTab}</h2>
              {(activeTab === "Campaigns" || activeTab === "Templates") && <button className={outlineButton} onClick={() => open(activeTab === "Campaigns" ? "New campaign" : "New template")}>＋ Create draft</button>}
            </div>
            {activeTab === "Campaigns" || activeTab === "Templates" ? <div className="mt-4 space-y-2">
              {(activeTab === "Campaigns" ? drafts : templates).length === 0 && <p className="text-sm text-[var(--muted)]">No local drafts yet. Create a draft to get started.</p>}
              {(activeTab === "Campaigns" ? drafts : templates).map((draft, i) => <div key={i} className="flex justify-between rounded-lg bg-[var(--surface-2)] p-3"><span>{draft} <small className="text-[var(--muted)]"> · Draft</small></span><button onClick={() => activeTab === "Campaigns" ? setDrafts(drafts.filter((_, n) => n !== i)) : setTemplates(templates.filter((_, n) => n !== i))}>Delete</button></div>)}
            </div> : activeTab === "Automation" ? <label className="mt-4 flex items-center gap-3"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />Enable automatic replies (local configuration)</label> : activeTab === "Settings" ? <><label className="mt-4 flex items-center gap-3"><input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} />Message notifications</label><button className={`${outlineButton} mt-4`} disabled={busy} onClick={() => { if (!onSaveSettings) { setNotice("Saving is unavailable until your workspace is connected."); return; } void run(async () => { await onSaveSettings({ notifications, automaticReplies: enabled }); setNotice("Settings saved."); }); }}>Save settings</button></> : <p className="mt-4 text-sm text-[var(--muted)]">No live delivery logs loaded. Connect your messaging backend to display delivery events.</p>}
            <p role="alert" className="text-sm text-[var(--danger)]">{error}</p><p role="status" className="mt-3 text-sm text-[var(--success)]">{notice}</p>
          </section>
        )}
        <dialog onCancel={e => { if (busy) e.preventDefault(); }} ref={modal} aria-labelledby="wa-modal-title" className="fixed inset-0 m-auto w-[min(440px,90vw)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-2xl backdrop:bg-black/60">
          <div className="mb-4 flex items-center justify-between"><h2 id="wa-modal-title" className="text-lg font-bold">{panel}</h2><button aria-label="Close dialog" disabled={busy} onClick={() => modal.current?.close()} className="rounded px-2 py-1">✕</button></div>
          <p role="alert" className="mb-2 text-sm text-[var(--danger)]">{error}</p>
          {panel === "Date range" ? <div className="grid gap-2">{["Last 7 days", "Last 30 days", "Last 90 days"].map(range => <button key={range} className={outlineButton} disabled={busy} onClick={() => { if (!onPeriodChange) { setError("Date filtering is unavailable until live reporting is connected."); return; } void run(async () => { await onPeriodChange(range); setPeriod(range); modal.current?.close(); }); }}>{range}</button>)}<p className="text-xs text-[var(--muted)]">Choose the reporting period for your channel metrics.</p></div>
          : panel === "New campaign" || panel === "New template" ? <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (!name.trim() || !message.trim()) return; if (!onSaveDraft) { setError("Draft saving is unavailable until your workspace is connected."); return; } void run(async () => { await onSaveDraft({ kind: panel === "New campaign" ? "campaign" : "template", name: name.trim(), message: message.trim() }); if (panel === "New campaign") { setDrafts([...drafts, name.trim()]); setActiveTab("Campaigns"); } else { setTemplates([...templates, name.trim()]); setActiveTab("Templates"); } modal.current?.close(); }); }}>
            <label className="block text-sm font-medium">Name<input autoFocus required maxLength={100} value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3" placeholder="e.g. November follow-up" /></label>
            <label className="block text-sm font-medium">Message<textarea required maxLength={4096} rows={4} value={message} onChange={e => setMessage(e.target.value)} className="mt-2 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3" placeholder="Write your message…" /></label>
            <p className="text-xs text-[var(--muted)]">Save for review. Saving a draft does not send messages.</p>
            <div className="flex justify-end gap-2"><button type="button" disabled={busy} className={outlineButton} onClick={() => modal.current?.close()}>Cancel</button><button disabled={busy || !name.trim() || !message.trim()} type="submit" className={outlineButton}>{busy ? "Saving…" : "Save draft"}</button></div>
          </form>
          : panel === "Account options" ? <div className="grid gap-2"><button className={outlineButton} onClick={() => setPanel("Account details")}>View account details</button><button className={outlineButton} onClick={() => { reconnect(account); }}>Reconnect account</button></div>
          : panel === "Reconnect account" ? <p className="text-sm leading-relaxed text-[var(--text-soft)]">{busy ? "Starting your connection…" : onReconnect ? notice : "Reconnection is currently unavailable. Connect your workspace integration to continue."}</p>
          : <dl className="space-y-3 text-sm"><div><dt className="text-[var(--muted)]">Provider</dt><dd>{account === "meta" ? "Meta WhatsApp" : "Baileys WhatsApp"}</dd></div><div><dt className="text-[var(--muted)]">Phone</dt><dd>{account === "meta" ? metaPhone : baileysPhone}</dd></div>{account === "meta" && <div><dt className="text-[var(--muted)]">WABA ID</dt><dd>{wabaId}</dd></div>}<p className="text-xs text-[var(--muted)]">Showing the account data supplied to this component.</p></dl>}
        </dialog>
      </div>
    </section>
  );
}

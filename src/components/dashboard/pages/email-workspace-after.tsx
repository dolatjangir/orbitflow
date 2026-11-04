"use client";

import { useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Mail,
  Check,
  Plus,
  MoreVertical,
  BarChart3,
  Send,
  Eye,
  MousePointer2,
  Reply,
  ArrowRight,
  FileText,
  Workflow,
  Users,
  Zap,
  X,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";

const TABS = [
  "Overview",
  "Accounts",
  "Inbox",
  "Campaigns",
  "Templates",
  "Automation",
  "Analytics",
  "Settings",
] as const;
type Tab = (typeof TABS)[number];
type Provider = "gmail" | "outlook" | "smtp";
type DraftKind = "Campaigns" | "Templates" | "Automation";
type Draft = {
  id: string;
  kind: DraftKind;
  name: string;
  subject: string;
  message: string;
  recipients: string;
  enabled: boolean;
};
type Conversation = {
  id: string;
  initials: string;
  name: string;
  subject: string;
  time: string;
  unread: boolean;
  color: string;
};
type Account = { id: string; provider: Provider; name: string; email: string };
type Props = { onConnectAccount?: (provider: Provider) => Promise<void> };

// Sample records reproduce the reference. Replace these with verified API data.
const ACCOUNTS: Account[] = [
  {
    id: "gmail",
    provider: "gmail",
    name: "Gmail",
    email: "sales@aiworksforce.com",
  },
  {
    id: "outlook",
    provider: "outlook",
    name: "Outlook (Microsoft 365)",
    email: "support@aiworksforce.com",
  },
];
const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    initials: "RK",
    name: "Rahul Kumar",
    subject: "Request for Demo – AI Voice Agent",
    time: "10:24 AM",
    unread: true,
    color: "bg-violet-600",
  },
  {
    id: "2",
    initials: "AT",
    name: "Admissions Team",
    subject: "Internship Opportunity – AI/ML",
    time: "09:41 AM",
    unread: true,
    color: "bg-green-600",
  },
  {
    id: "3",
    initials: "DS",
    name: "Disha Sharma",
    subject: "Pricing Details for WhatsApp API",
    time: "Yesterday",
    unread: false,
    color: "bg-amber-500",
  },
  {
    id: "4",
    initials: "CS",
    name: "Client Success",
    subject: "Onboarding – Next Steps",
    time: "Yesterday",
    unread: false,
    color: "bg-blue-500",
  },
];
const METRICS = [
  {
    label: "Emails Sent",
    value: "5,420",
    percentage: "",
    icon: Mail,
    tone: "text-sky-400",
  },
  {
    label: "Delivered",
    value: "5,318",
    percentage: "98.1%",
    icon: Send,
    tone: "text-green-400",
  },
  {
    label: "Opens",
    value: "2,846",
    percentage: "53.5%",
    icon: Eye,
    tone: "text-rose-400",
  },
  {
    label: "Clicks",
    value: "1,124",
    percentage: "21.1%",
    icon: MousePointer2,
    tone: "text-purple-400",
  },
  {
    label: "Replies",
    value: "312",
    percentage: "5.9%",
    icon: Reply,
    tone: "text-amber-400",
  },
];
const panel =
  "rounded-2xl border border-[var(--border)] bg-linear-to-br from-[var(--surface)] to-[var(--page)]";
const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium transition hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#0066ff] px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40";
const inputClass =
  "mt-1 w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:ring-2 focus:ring-blue-500";
const newDraft = (kind: DraftKind): Draft => ({
  id: "",
  kind,
  name: "",
  subject: "",
  message: "",
  recipients: "",
  enabled: false,
});

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-medium">
      {label}
      {children}
    </label>
  );
}
function ProviderIcon({ provider }: { provider: Provider }) {
  if (provider === "gmail")
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
  if (provider === "outlook")
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-linear-to-br from-cyan-400 to-blue-800">
        <svg viewBox="0 0 36 36" className="size-8" aria-hidden="true">
          <rect x="12" y="5" width="18" height="24" rx="2" fill="#0078d4" />
          <path d="M13 13h17v8H13Z" fill="#28a8ea" />
          <path d="m9 18 12 9 12-9v13H9Z" fill="#1490df" />
          <path d="m9 18 12 8 12-8" fill="#55c4fa" />
          <rect x="3" y="11" width="16" height="18" rx="1" fill="#0364b8" />
          <text
            x="11"
            y="24"
            fill="white"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
          >
            O
          </text>
        </svg>
      </span>
    );
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-500/20 text-blue-400">
      <Mail size={26} />
    </span>
  );
}
function PerformanceChart({
  period,
  onChange,
}: {
  period: string;
  onChange: (period: string) => void;
}) {
  const id = useId().replace(/:/g, "");
  const values =
    period === "Last 7 Days"
      ? [1150, 1380, 1320, 1680, 1980, 1680, 2010]
      : [1610, 1950, 1720, 2280];
  const labels =
    period === "Last 7 Days"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Week 1", "Week 2", "Week 3", "Week 4"];
  return (
    <section className={`${panel} min-w-0 p-3`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-3 text-sm font-semibold">
          <BarChart3 size={24} className="shrink-0 text-blue-400" />
          Campaign Performance
        </h2>
        <label>
          <span className="sr-only">Campaign performance period</span>
          <select
            value={period}
            onChange={(event) => onChange(event.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[11px] outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </label>
      </div>
      <svg
        viewBox="0 0 380 140"
        preserveAspectRatio="none"
        className="mt-2 h-[140px] w-full"
        role="img"
        aria-label={`Sample campaign performance for ${period.toLowerCase()}`}
      >
        <defs>
          <linearGradient id={`${id}-blue`} x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#168cff" />
            <stop offset="1" stopColor="#0061ff" />
          </linearGradient>
          <linearGradient id={`${id}-purple`} x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#a643ff" />
            <stop offset="1" stopColor="#7631ec" />
          </linearGradient>
        </defs>
        {[0, 500, 1000, 1500, 2000, 2500].map((v) => (
          <g key={v}>
            <line
              x1="40"
              x2="370"
              y1={112 - (v / 2500) * 100}
              y2={112 - (v / 2500) * 100}
              stroke="var(--border)"
              opacity=".5"
            />
            <text
              x="32"
              y={116 - (v / 2500) * 100}
              textAnchor="end"
              fill="var(--text-soft)"
              fontSize="11"
            >
              {v >= 1000 ? `${v / 1000}K` : v}
            </text>
          </g>
        ))}
        {values.map((v, i) => {
          const x = 40 + ((i + 0.5) * 330) / values.length - 14;
          const height = (v / 2500) * 100;
          return (
            <g key={labels[i]}>
              <rect
                x={x}
                y={112 - height}
                width="28"
                height={height}
                rx="3"
                fill={`url(#${id}-purple)`}
              />
              <rect
                x={x}
                y={112 - height * 0.72}
                width="28"
                height={height * 0.72}
                fill={`url(#${id}-blue)`}
              />
              <text
                x={x + 14}
                y="130"
                textAnchor="middle"
                fill="var(--text-soft)"
                fontSize="11"
              >
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-center gap-10 text-xs">
        <span className="flex items-center gap-2">
          <i className="size-3 rounded-full bg-blue-500" />
          Sent
        </span>
        <span className="flex items-center gap-2">
          <i className="size-3 rounded-full bg-violet-500" />
          Opens
        </span>
      </div>
    </section>
  );
}

/**
 * Connected email workspace, with screenshot sample data and session-only drafts.
 * Uses your global.css theme variables, inherited font and Tailwind v4 utilities.
 * No app sidebar, global header, inline styles or external image dependencies.
 * Real connections require onConnectAccount; sending and mailbox APIs are not included.
 */
export default function EmailConnected({ onConnectAccount }: Props) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [period, setPeriod] = useState("Last 7 Days");
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [account, setAccount] = useState<Account>(ACCOUNTS[0]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draft, setDraft] = useState<Draft>(newDraft("Campaigns"));
  const [modal, setModal] = useState<
    "connect" | "account" | "conversation" | "edit" | "preview" | "delete"
  >("connect");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [settings, setSettings] = useState({
    sender: "AI WorksForce",
    replyTo: "sales@aiworksforce.com",
    notifications: true,
  });
  const dialog = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const navigate = (next: Tab) => {
    setTab(next);
    setQuery("");
    setPage(0);
    setNotice("");
  };
  const open = (next: typeof modal) => {
    setModal(next);
    setError("");
    dialog.current?.showModal();
  };
  const close = () => {
    if (!busyRef.current) dialog.current?.close();
  };
  const edit = (kind: DraftKind, item?: Draft) => {
    setDraft(item ? { ...item } : newDraft(kind));
    open("edit");
  };
  const readConversation = (item: Conversation) => {
    setSelectedConversation(item);
    setConversations((items) =>
      items.map((c) => (c.id === item.id ? { ...c, unread: false } : c)),
    );
    open("conversation");
  };
  async function connect(provider: Provider) {
    if (busyRef.current) return;
    if (!onConnectAccount) {
      setError(
        "Account connection is not configured. Connect onConnectAccount to your provider setup or server-side authorization flow.",
      );
      return;
    }
    setError("");
    busyRef.current = true;
    setBusy(true);
    try {
      await onConnectAccount(provider);
      dialog.current?.close();
      setNotice(
        "Connection flow requested. Refresh account data from your backend after verification.",
      );
    } catch {
      setError("The connection flow could not be started. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.subject.trim() || !draft.message.trim()) {
      setError("Enter a name, subject and message.");
      return;
    }
    const recipients = draft.recipients
      .split(/[,;\n]+/)
      .map((v) => v.trim())
      .filter(Boolean);
    if (recipients.some((v) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) {
      setError("Enter valid recipient email addresses.");
      return;
    }
    const saved = {
      ...draft,
      id: draft.id || crypto.randomUUID(),
      name: draft.name.trim(),
      recipients: [...new Set(recipients.map((v) => v.toLowerCase()))].join(
        ", ",
      ),
    };
    setDrafts((items) =>
      draft.id
        ? items.map((d) => (d.id === draft.id ? saved : d))
        : [saved, ...items],
    );
    navigate(draft.kind);
    dialog.current?.close();
    setNotice("Draft saved for this session. No email was sent.");
  }
  const filtered = drafts.filter(
    (d) =>
      d.kind === tab &&
      `${d.name} ${d.subject}`.toLowerCase().includes(query.toLowerCase()),
  );
  const lastPage = Math.max(0, Math.ceil(filtered.length / 3) - 1),
    currentPage = Math.min(page, lastPage);
  const actions = [
    {
      label: "Create Email Campaign",
      icon: Plus,
      action: () => edit("Campaigns"),
    },
    {
      label: "New Email Template",
      icon: FileText,
      action: () => edit("Templates"),
    },
    {
      label: "Create Automation",
      icon: Workflow,
      action: () => edit("Automation"),
    },
    {
      label: "Manage Accounts",
      icon: Users,
      action: () => navigate("Accounts"),
    },
    {
      label: "View Analytics",
      icon: BarChart3,
      action: () => navigate("Analytics"),
    },
  ];
  const accountCards = (
    <div className="grid grid-cols-1 gap-3 @min-[1050px]:grid-cols-2">
      {ACCOUNTS.map((item) => (
        <article
          key={item.id}
          className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"
        >
          <ProviderIcon provider={item.provider} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <h3 className="text-xs leading-snug font-semibold">
                {item.name}
              </h3>
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-green-700 px-1.5 py-0.5 text-[9px] font-medium text-white">
                <Check size={10} />
                Connected
              </span>
            </div>
            <p className="mt-1 break-all text-[11px] leading-snug text-[var(--text-soft)]">
              {item.email}
            </p>
          </div>
          <button
            type="button"
            aria-label={`${item.name} account options`}
            className="shrink-0 rounded p-1 hover:bg-[var(--surface-3)]"
            onClick={() => {
              setAccount(item);
              open("account");
            }}
          >
            <MoreVertical size={16} />
          </button>
        </article>
      ))}
    </div>
  );
  function conversationList(items: Conversation[]) {
    return (
      <div className="divide-y divide-[var(--border)]">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => readConversation(item)}
            className="grid w-full min-w-0 grid-cols-[auto_minmax(0,.8fr)_minmax(0,1.4fr)_auto_auto] items-center gap-2 rounded px-1 py-1.5 text-left transition hover:bg-[var(--surface-2)]"
          >
            <span
              className={`grid size-7 place-items-center rounded-full text-[11px] font-medium text-white ${item.color}`}
            >
              {item.initials}
            </span>
            <span className="truncate text-xs font-semibold" title={item.name}>
              {item.name}
            </span>
            <span className="truncate text-xs" title={item.subject}>
              {item.subject}
            </span>
            <span className="text-[10px] whitespace-nowrap text-[var(--text-soft)]">
              {item.time}
            </span>
            <span
              className={`size-2 rounded-full ${item.unread ? "bg-blue-500" : "bg-transparent"}`}
              aria-label={item.unread ? "Unread" : "Read"}
            />
          </button>
        ))}
      </div>
    );
  }
  return (
    <section
      aria-label="Email workspace"
      className="@container w-full min-w-0 text-[var(--text)] antialiased [&_button]:cursor-pointer [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-blue-500"
    >
      <div className="flex items-center gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-blue-950 via-blue-600 to-blue-950 text-white">
          <Mail size={29} />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight font-bold tracking-tight">
            Email Workspace
          </h1>
          <p className="mt-1 text-sm leading-snug text-[var(--text-soft)]">
            Manage your email accounts, conversations, campaigns and automations
            from a single workspace.
          </p>
        </div>
      </div>
      <nav
        aria-label="Email sections"
        className="my-2.5 grid grid-cols-4 gap-1 rounded-lg border border-[var(--border)] p-0.5 @min-[750px]:grid-cols-8"
      >
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            aria-current={tab === item ? "page" : undefined}
            onClick={() => navigate(item)}
            className={`rounded-lg px-2 py-1.5 text-xs ${tab === item ? "bg-[#0066ff] font-semibold text-white" : "font-medium hover:bg-[var(--surface-2)]"}`}
          >
            {item}
          </button>
        ))}
      </nav>
      {notice && (
        <div
          role="status"
          className="mb-2 flex items-center justify-between gap-3 rounded-lg bg-blue-500/10 px-3 py-2 text-xs"
        >
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss notice"
            onClick={() => setNotice("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {tab === "Overview" && (
        <>
          <div className="grid min-w-0 grid-cols-1 gap-4 @min-[900px]:grid-cols-2">
            <section className={`${panel} min-w-0 p-3`}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 place-items-center rounded-md bg-green-500 text-white">
                    <Check size={20} strokeWidth={3} />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold">
                      Connected Email Accounts (2)
                    </h2>
                    <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-soft)]">
                      Manage and monitor your connected email accounts.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${secondaryButton} shrink-0 text-blue-400`}
                  onClick={() => open("connect")}
                >
                  Add Account
                  <Plus size={13} />
                </button>
              </div>
              {accountCards}
            </section>
            <section className={`${panel} min-w-0 p-3`}>
              <div className="mb-2 flex items-start gap-3">
                <BarChart3 size={28} className="shrink-0 text-blue-400" />
                <div>
                  <h2 className="text-sm font-semibold">
                    This Month Performance
                  </h2>
                  <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-soft)]">
                    Overall email engagement and delivery performance.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {METRICS.map(
                  ({ label, value, percentage, icon: Icon, tone }) => (
                    <article
                      key={label}
                      className="flex min-w-0 flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-1 py-2 text-center"
                    >
                      <Icon size={25} className={tone} />
                      <strong className="mt-1 text-base leading-tight font-bold tabular-nums">
                        {value}
                      </strong>
                      <h3 className="mt-1 text-[11px] leading-tight">
                        {label}
                      </h3>
                      <p className="mt-0.5 min-h-3.5 text-[10px] leading-tight text-[var(--text-soft)]">
                        {percentage && `(${percentage})`}
                      </p>
                    </article>
                  ),
                )}
              </div>
            </section>
          </div>
          <div className="mt-2.5 grid min-w-0 grid-cols-1 gap-4 @min-[850px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @min-[1150px]:grid-cols-[minmax(0,1.95fr)_minmax(0,1.7fr)_minmax(0,1fr)]">
            <section className={`${panel} min-w-0 p-3`}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <Mail size={26} className="shrink-0 text-sky-400" />
                  <div>
                    <h2 className="text-sm font-semibold">
                      Recent Conversations
                    </h2>
                    <p className="mt-0.5 text-[11px] text-[var(--text-soft)]">
                      Latest emails from your connected inboxes.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${secondaryButton} shrink-0`}
                  onClick={() => navigate("Inbox")}
                >
                  View Inbox
                  <ArrowRight size={13} />
                </button>
              </div>
              {conversationList(conversations)}
            </section>
            <PerformanceChart period={period} onChange={setPeriod} />
            <section
              className={`${panel} min-w-0 p-3 @min-[850px]:col-span-2 @min-[1150px]:col-span-1`}
            >
              <h2 className="mb-2 flex items-center gap-3 text-sm font-semibold">
                <Zap size={22} className="text-blue-200" />
                Quick Actions
              </h2>
              <div className="grid gap-1.5 @min-[850px]:grid-cols-5 @min-[1150px]:grid-cols-1">
                {actions.map(({ label, icon: Icon, action }, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={action}
                    className={`flex min-h-7 items-center gap-3 rounded-lg border px-3 py-1 text-left text-xs font-medium transition ${i === 0 ? "border-blue-600 bg-[#0066ff] text-white hover:bg-blue-500" : "border-[var(--border)] bg-[var(--surface-2)] hover:border-blue-500"}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
      {tab === "Accounts" && (
        <section className={`${panel} p-4`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Email Accounts</h2>
            <button
              type="button"
              className={primaryButton}
              onClick={() => open("connect")}
            >
              <Plus size={16} />
              Add Account
            </button>
          </div>
          {accountCards}
          <p className="mt-3 text-xs text-[var(--text-soft)]">
            Reference account records. Supply verified account data from your
            backend for live use.
          </p>
        </section>
      )}
      {tab === "Inbox" && (
        <section className={`${panel} p-4`}>
          <h2 className="text-lg font-semibold">Inbox</h2>
          <label className="relative my-3 block">
            <span className="sr-only">Search conversations</span>
            <Search
              size={16}
              className="absolute top-3.5 left-3 text-[var(--text-soft)]"
            />
            <input
              type="search"
              className={`${inputClass} pl-9`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by sender or subject"
            />
          </label>
          {conversationList(
            conversations.filter((c) =>
              `${c.name} ${c.subject}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            ),
          )}
          {!conversations.some((c) =>
            `${c.name} ${c.subject}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          ) && (
            <p className="py-12 text-center text-sm text-[var(--text-soft)]">
              No matching conversations.
            </p>
          )}
        </section>
      )}
      {(["Campaigns", "Templates", "Automation"] as string[]).includes(tab) && (
        <section className={`${panel} p-4`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{tab}</h2>
            <button
              type="button"
              className={primaryButton}
              onClick={() => edit(tab as DraftKind)}
            >
              <Plus size={15} />
              Create{" "}
              {tab === "Campaigns"
                ? "campaign"
                : tab === "Templates"
                  ? "template"
                  : "automation"}
            </button>
          </div>
          <label className="my-3 block">
            <span className="sr-only">Search drafts</span>
            <input
              type="search"
              className={inputClass}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search drafts"
            />
          </label>
          <div className="min-h-[180px] space-y-2">
            {filtered
              .slice(currentPage * 3, currentPage * 3 + 3)
              .map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">
                      {item.name}
                    </h3>
                    <p className="truncate text-xs text-[var(--text-soft)]">
                      {item.subject}
                    </p>
                    <p className="mt-1 text-[10px] text-[var(--text-soft)]">
                      {item.kind === "Automation"
                        ? item.enabled
                          ? "Enabled locally · not deployed"
                          : "Paused locally"
                        : "Draft · not sent"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={secondaryButton}
                      onClick={() => {
                        setDraft(item);
                        open("preview");
                      }}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      className={secondaryButton}
                      aria-label={`Edit ${item.name}`}
                      onClick={() => edit(item.kind, item)}
                    >
                      <Pencil size={14} />
                    </button>
                    {item.kind === "Templates" && (
                      <button
                        type="button"
                        className={secondaryButton}
                        onClick={() =>
                          edit("Campaigns", {
                            ...item,
                            id: "",
                            kind: "Campaigns",
                          })
                        }
                      >
                        Use template
                      </button>
                    )}
                    {item.kind === "Automation" && (
                      <button
                        type="button"
                        className={secondaryButton}
                        aria-pressed={item.enabled}
                        onClick={() =>
                          setDrafts((items) =>
                            items.map((d) =>
                              d.id === item.id
                                ? { ...d, enabled: !d.enabled }
                                : d,
                            ),
                          )
                        }
                      >
                        {item.enabled ? "Pause" : "Enable locally"}
                      </button>
                    )}
                    <button
                      type="button"
                      className={secondaryButton}
                      aria-label={`Delete ${item.name}`}
                      onClick={() => {
                        setDraft(item);
                        open("delete");
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              ))}
            {!filtered.length && (
              <p className="py-16 text-center text-sm text-[var(--text-soft)]">
                {query
                  ? "No matching drafts."
                  : "No drafts yet. Create one to get started."}
              </p>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-[var(--text-soft)]">
              Session drafts · {currentPage + 1}/{lastPage + 1}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className={secondaryButton}
                disabled={!currentPage}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className={secondaryButton}
                disabled={currentPage === lastPage}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}
      {tab === "Analytics" && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-soft)]">
            Sample analytics from the reference design. Connect your reporting
            API for actual results.
          </p>
          <PerformanceChart period={period} onChange={setPeriod} />
        </div>
      )}
      {tab === "Settings" && (
        <section className={`${panel} p-4`}>
          <h2 className="text-lg font-semibold">Email Settings</h2>
          <form
            className="mt-4 grid gap-4 @min-[600px]:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!settings.sender.trim()) {
                setNotice("Enter a sender name.");
                return;
              }
              setNotice(
                "Preferences saved for this session. No live account was changed.",
              );
            }}
          >
            <Field label="Sender name">
              <input
                required
                className={inputClass}
                value={settings.sender}
                onChange={(e) =>
                  setSettings({ ...settings, sender: e.target.value })
                }
              />
            </Field>
            <Field label="Reply-to email">
              <input
                required
                type="email"
                className={inputClass}
                value={settings.replyTo}
                onChange={(e) =>
                  setSettings({ ...settings, replyTo: e.target.value })
                }
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) =>
                  setSettings({ ...settings, notifications: e.target.checked })
                }
              />
              Inbox notification preference
            </label>
            <div>
              <button type="submit" className={primaryButton}>
                Save settings
              </button>
            </div>
          </form>
        </section>
      )}
      <dialog
        ref={dialog}
        aria-labelledby={`${uid}-dialog`}
        onCancel={(e) => {
          if (busyRef.current) e.preventDefault();
        }}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[min(560px,94vw)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-2xl backdrop:bg-black/65"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={`${uid}-dialog`} className="text-lg font-semibold">
            {modal === "connect"
              ? "Connect email account"
              : modal === "account"
                ? account.name
                : modal === "conversation"
                  ? "Conversation"
                  : modal === "delete"
                    ? "Delete draft?"
                    : modal === "preview"
                      ? draft.name
                      : "Email draft"}
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            disabled={busy}
            className={secondaryButton}
            onClick={close}
          >
            <X size={17} />
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="mb-3 rounded-lg bg-red-500/10 p-3 text-sm text-[var(--danger)]"
          >
            {error}
          </p>
        )}
        {modal === "connect" && (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-soft)]">
              Choose a provider to begin your connection flow.
            </p>
            {(
              [
                { id: "gmail", name: "Gmail / Google Workspace" },
                { id: "outlook", name: "Outlook / Microsoft 365" },
                { id: "smtp", name: "Custom SMTP" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={busy}
                onClick={() => connect(p.id)}
                className={`${secondaryButton} w-full justify-start py-3`}
              >
                <ProviderIcon provider={p.id} />
                <span>{p.name}</span>
                <ArrowRight size={16} className="ml-auto" />
              </button>
            ))}
            {busy && (
              <p role="status" className="text-xs">
                Opening connection flow…
              </p>
            )}
          </div>
        )}
        {modal === "account" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ProviderIcon provider={account.provider} />
              <p className="break-all text-sm">{account.email}</p>
            </div>
            <p className="text-xs text-[var(--text-soft)]">
              This is a screenshot sample account. No provider session has been
              verified by this component.
            </p>
            <button
              type="button"
              className={primaryButton}
              onClick={() => {
                close();
                navigate("Accounts");
              }}
            >
              Manage accounts
            </button>
          </div>
        )}
        {modal === "conversation" && selectedConversation && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">{selectedConversation.name}</p>
            <h3 className="text-base font-semibold">
              {selectedConversation.subject}
            </h3>
            <p className="text-xs text-[var(--text-soft)]">
              {selectedConversation.time}
            </p>
            <p className="rounded-xl border border-[var(--border)] p-4 text-sm text-[var(--text-soft)]">
              The reference includes the subject only. Connect your mailbox API
              to display the message body and replies.
            </p>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => {
                close();
                navigate("Inbox");
              }}
            >
              Open inbox
            </button>
          </div>
        )}
        {modal === "edit" && (
          <form className="space-y-3" onSubmit={saveDraft}>
            <Field label="Draft name">
              <input
                autoFocus
                required
                maxLength={100}
                className={inputClass}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </Field>
            {draft.kind === "Campaigns" && (
              <Field label="Recipients (optional for draft)">
                <textarea
                  rows={2}
                  className={inputClass}
                  value={draft.recipients}
                  onChange={(e) =>
                    setDraft({ ...draft, recipients: e.target.value })
                  }
                />
              </Field>
            )}
            <Field label="Subject">
              <input
                required
                maxLength={200}
                className={inputClass}
                value={draft.subject}
                onChange={(e) =>
                  setDraft({ ...draft, subject: e.target.value })
                }
              />
            </Field>
            <Field label="Message">
              <textarea
                required
                rows={4}
                maxLength={20000}
                className={inputClass}
                value={draft.message}
                onChange={(e) =>
                  setDraft({ ...draft, message: e.target.value })
                }
              />
            </Field>
            <p className="text-xs text-[var(--text-soft)]">
              Saving creates a session-only draft. Sending and automation
              execution require your backend.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" className={secondaryButton} onClick={close}>
                Cancel
              </button>
              <button type="submit" className={primaryButton}>
                Save draft
              </button>
            </div>
          </form>
        )}
        {modal === "preview" && (
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-soft)]">
              To: {draft.recipients || "Not specified"}
            </p>
            <h3 className="font-semibold">{draft.subject}</h3>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {draft.message}
            </p>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => edit(draft.kind, draft)}
            >
              Edit draft
            </button>
          </div>
        )}
        {modal === "delete" && (
          <div className="space-y-4">
            <p className="text-sm">Delete “{draft.name}” from this session?</p>
            <div className="flex justify-end gap-2">
              <button type="button" className={secondaryButton} onClick={close}>
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                onClick={() => {
                  setDrafts((items) => items.filter((d) => d.id !== draft.id));
                  close();
                  setNotice("Draft deleted.");
                }}
              >
                Delete draft
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}

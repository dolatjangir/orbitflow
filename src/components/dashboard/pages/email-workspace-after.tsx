"use client";

import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, CircleHelp, Link2, Mail, MoreVertical, MousePointer2, Plus, Send, ShieldCheck, X } from "lucide-react";

type Action = "manage-accounts" | "add-account" | "new-campaign" | "view-campaigns";
type Props = {
  onAction?: (action: Action) => void;
  onAccountMenu?: (email: string) => void;
};

// Screenshot sample data. Replace with verified values from your email backend.
export default function EmailWorkspaceAfter({ onAction, onAccountMenu }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const show = (heading: string, body: string) => { setTitle(heading); setDetails(body); dialog.current?.showModal(); };
  const act = (action: Action, heading: string) => {
    if (onAction) onAction(action);
    else show(heading, "Connect this control to your existing email workflow. This preview does not connect accounts or send emails.");
  };
  const outline = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-sky-500/70 bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-sky-400 transition hover:bg-[var(--surface-2)]";
  const panel = "rounded-xl border border-[var(--border)] bg-linear-to-br from-[var(--surface)] to-[var(--page)]";
  const accounts = [
    { email: "adarsh@yourcompany.com", provider: "Gmail", sent: "245", delivery: "92.4%", campaigns: "12" },
    { email: "marketing@yourcompany.com", provider: "Outlook", sent: "1,842", delivery: "98.1%", campaigns: "5" },
  ];
  const campaigns = [
    { name: "Real Estate Outreach", status: "Active", sent: "2,420", rate: "48.6%", created: "Oct 30, 2026" },
    { name: "CA Firms Follow-up", status: "Scheduled", sent: "1,250", rate: "–", created: "Oct 29, 2026" },
    { name: "Jaipur Leads Outreach", status: "Completed", sent: "5,840", rate: "52.3%", created: "Oct 28, 2026" },
  ];
  return (
    <section aria-labelledby="email-title" className="@container w-full min-w-0 text-[var(--text)] [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-[var(--primary)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-[.14em] text-sky-400 uppercase"><Send size={11} />Email Channel</p><h1 id="email-title" className="text-[26px] leading-tight font-bold tracking-tight">Email workspace</h1><p className="mt-1.5 text-xs text-[var(--text-soft)]">Manage your connected email accounts, campaigns and track performance.</p></div>
        <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => act("manage-accounts", "Manage accounts")} className={`${outline} !border-[var(--border-strong)] !text-[var(--text)]`}><ShieldCheck size={14} />Manage accounts</button><button type="button" onClick={() => act("new-campaign", "New campaign")} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-sky-400 bg-linear-to-b from-sky-400 to-blue-600 px-3 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-blue-500/15 hover:brightness-110"><Plus size={15} />New campaign</button></div>
      </div>

      <section aria-labelledby="email-accounts" className={`${panel} p-4`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h2 id="email-accounts" className="text-sm font-bold">Connected accounts (2)</h2><p className="mt-0.5 text-xs text-[var(--text-soft)]">Manage your email accounts and their status.</p></div><button type="button" onClick={() => act("add-account", "Add another account")} className={outline}><Plus size={14} />Add another account</button></div>
        <div className="grid min-w-0 grid-cols-1 gap-3 @min-[580px]:grid-cols-2">
          {accounts.map(account => <article key={account.email} className="min-w-0 rounded-xl border border-[var(--border)] bg-linear-to-br from-[var(--surface-2)] to-[var(--surface)] p-3">
            <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white p-1.5 shadow-sm">
              {account.provider === "Gmail" ? <svg viewBox="0 0 32 32" className="size-full" role="img" aria-label="Gmail"><path d="M4 25V9l12 9L28 9v16" fill="none" stroke="#e5e7eb" strokeWidth="5"/><path d="M4 25V9l5 4" fill="none" stroke="#4285f4" strokeWidth="5"/><path d="m4 9 12 9L28 9" fill="none" stroke="#ea4335" strokeWidth="5" strokeLinejoin="round"/><path d="M28 9v16" stroke="#34a853" strokeWidth="5"/><path d="m24 12 4-3" stroke="#fbbc04" strokeWidth="5"/></svg> : <svg viewBox="0 0 32 32" className="size-full" role="img" aria-label="Outlook"><rect x="12" y="3" width="17" height="23" rx="2" fill="#0078d4"/><path d="M15 7h5v5h-5zM22 7h5v5h-5zM15 14h5v5h-5zM22 14h5v5h-5z" fill="#50b6ff"/><path d="m10 18 11-7 10 7v12H10Z" fill="#1490df"/><path d="m10 18 11 7 10-7v12H10Z" fill="#40baff"/><rect x="1" y="9" width="17" height="18" rx="2" fill="#0754a2"/><text x="9.5" y="22" fill="white" fontFamily="Arial" fontWeight="700" fontSize="13" textAnchor="middle">O</text></svg>}
            </span><div className="min-w-0 flex-1"><h3 className="break-all text-[11px] leading-snug font-bold">{account.email}</h3><p className="mt-1 text-xs text-[var(--text-soft)]">{account.provider}</p></div><span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] leading-none font-semibold text-[var(--success)]">Connected</span><button type="button" aria-label={`Options for ${account.email}`} onClick={() => onAccountMenu ? onAccountMenu(account.email) : show(account.provider, `${account.email} · Connected sample account`)} className="shrink-0 rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-3)]"><MoreVertical size={15} /></button></div>
            <dl className="mt-3 grid grid-cols-3 divide-x divide-[var(--border)] border-t border-[var(--border)] pt-3"><div className="min-w-0 pr-2"><dd className="text-lg leading-none font-semibold">{account.sent}</dd><dt className="mt-1 text-[11px] text-[var(--text-soft)]">Emails sent</dt></div><div className="min-w-0 px-3"><dd className="text-lg leading-none font-semibold">{account.delivery}</dd><dt className="mt-1 text-[11px] text-[var(--text-soft)]">Deliverability</dt></div><div className="min-w-0 pl-3"><dd className="text-lg leading-none font-semibold">{account.campaigns}</dd><dt className="mt-1 text-[11px] text-[var(--text-soft)]">Active campaigns</dt></div></dl>
          </article>)}
        </div>
      </section>

      <div className="my-3 grid min-w-0 grid-cols-2 gap-3 @min-[600px]:grid-cols-4">
        {[
          {label:"Emails sent ↗",value:"8,420",growth:"+12%",description:"Across all connected accounts",icon:Send},
          {label:"Deliverability rate",value:"98.2%",growth:"+8%",description:"Based on inbox placement",icon:Mail},
          {label:"Unique opens",value:"642",growth:"+15%",description:"People who opened your emails",icon:MousePointer2},
          {label:"Link clicks",value:"312",growth:"+18%",description:"People who clicked links",icon:Link2},
        ].map(({label,value,growth,description,icon:Icon}) => <article key={label} className={`${panel} min-w-0 p-4`}><div className="mb-3 flex items-start justify-between gap-2"><span className="grid size-9 place-items-center rounded-lg bg-linear-to-br from-blue-500/30 to-blue-800/40 text-sky-400"><Icon size={18}/></span><span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-[var(--success)]">{growth}</span></div><p className="flex flex-wrap items-baseline gap-1 text-[26px] leading-none font-bold tracking-tight">{value}<ArrowUpRight size={17} className="text-sky-400" /></p><h2 className="mt-2 text-xs font-semibold">{label}</h2><p className="mt-1 text-[10px] leading-snug text-[var(--text-soft)]">{description}</p></article>)}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 @min-[600px]:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <section aria-labelledby="recent-email-campaigns" className={`${panel} min-w-0 p-3.5`}><div className="mb-4 flex items-center justify-between gap-2"><h2 id="recent-email-campaigns" className="text-sm font-bold">Recent campaigns</h2><button type="button" onClick={() => act("view-campaigns", "All campaigns")} className="flex items-center gap-1 text-xs text-sky-400 hover:underline">View all<ArrowRight size={13}/></button></div><table className="w-full table-fixed border-collapse text-left text-[10px]"><thead className="text-[var(--text-soft)]"><tr><th className="w-[33%] pb-2 font-normal">Campaign name</th><th className="w-[21%] pb-2 font-normal">Status</th><th className="w-[15%] pb-2 font-normal">Sent</th><th className="w-[17%] pb-2 font-normal">Open rate</th><th className="pb-2 font-normal">Created</th></tr></thead><tbody>{campaigns.map(c => <tr key={c.name} className="border-t border-[var(--border)]"><td className="py-2 pr-2 text-[var(--text-soft)]">{c.name}</td><td className={`py-2 pr-1 ${c.status === "Scheduled" ? "text-sky-400" : "text-[var(--success)]"}`}><span className="mr-1 inline-block size-1.5 rounded-full bg-current"/>{c.status}</td><td className="py-2">{c.sent}</td><td className="py-2">{c.rate}</td><td className="py-2 text-[var(--text-soft)]">{c.created}</td></tr>)}</tbody></table></section>
        <section aria-labelledby="email-health" className={`${panel} min-w-0 p-3.5`}><div className="mb-3 flex items-center justify-between"><h2 id="email-health" className="text-sm font-bold">Account health</h2><button type="button" aria-label="About account health" onClick={() => show("Account health", "SPF, DKIM and DMARC describe your domain authentication. Domain reputation and sending limits should come from your connected email service. Values in this preview are sample data.")} className="rounded text-[var(--text-soft)]"><CircleHelp size={14}/></button></div><ul className="space-y-2">{[["SPF record","Valid ↗"],["DKIM record","Valid ↗"],["DMARC record","Valid ↗"],["Domain reputation","Good ↗"],["Sending limit","Healthy"]].map(([label,value]) => <li key={label} className="flex min-w-0 items-center gap-2 text-[11px]"><span className="grid size-3.5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"><Check size={10} strokeWidth={3}/></span><span className="min-w-0 flex-1 text-[var(--text-soft)]">{label}</span><strong className="text-[var(--success)]">{value}</strong></li>)}</ul></section>
      </div>
      <dialog ref={dialog} aria-labelledby="email-dialog-title" className="fixed inset-0 m-auto w-[min(420px,90vw)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-2xl backdrop:bg-black/60"><div className="flex items-center justify-between"><h2 id="email-dialog-title" className="font-bold">{title}</h2><button type="button" aria-label="Close dialog" onClick={() => dialog.current?.close()} className="rounded-lg p-2 hover:bg-[var(--surface-2)]"><X size={18}/></button></div><p className="mt-3 text-sm leading-relaxed text-[var(--text-soft)]">{details}</p></dialog>
    </section>
  );
}

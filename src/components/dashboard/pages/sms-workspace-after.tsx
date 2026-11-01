"use client";

import { useId, useState, useRef } from "react";
import { Smartphone, CalendarDays, ChevronDown, Plus, MoreVertical, Check, Send, MessageSquare, X, Users, FileText, Workflow } from "lucide-react";

type Tab = "Overview" | "Campaigns" | "Templates" | "Automation" | "Delivery Logs" | "Settings";
type Props = {
  onNavigate?: (tab: Tab) => void;
  onAction?: (action: "add-provider" | "new-campaign" | "message-template" | "automation-flow" | "import-contacts") => void;
  onProviderMenu?: (provider: "Twilio" | "MessageBird") => void;
  onPeriodChange?: (period: string) => void;
};

// Screenshot-matching demonstration data. Replace with your verified API data.
export default function SMSConnected({ onNavigate, onAction, onProviderMenu, onPeriodChange }: Props) {
  const id = useId().replace(/:/g, "");
  const [range, setRange] = useState("30 Days");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [items, setItems] = useState<{id: number; kind: string; name: string; message: string; enabled: boolean}[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [modalKind, setModalKind] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState("Twilio");
  const [sender, setSender] = useState("OrbitFlow");
  const [notifications, setNotifications] = useState(true);
  const [contacts, setContacts] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const open = (kind: string) => { setModalKind(kind); setEditing(null); setName(""); setMessage(""); setFormError(""); dialog.current?.showModal(); };
  const switchTab = (tab: Tab) => { setActiveTab(tab); setPage(0); setQuery(""); setNotice(""); onNavigate?.(tab); };
  const field = "mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-blue-500";
  const secondary = "rounded-lg border border-[var(--border-strong)] px-3 py-2 text-xs hover:bg-[var(--surface-2)]";
  const filtered = items.filter(item => item.kind === activeTab && (item.name + item.message).toLowerCase().includes(query.toLowerCase()));
  const action = (key: Parameters<NonNullable<Props["onAction"]>>[0]) => {
    onAction?.(key);
    if (key === "new-campaign") { switchTab("Campaigns"); open("Campaigns"); }
    if (key === "message-template") { switchTab("Templates"); open("Templates"); }
    if (key === "automation-flow") { switchTab("Automation"); open("Automation"); }
    if (key === "import-contacts") open("Import Contacts");
    if (key === "add-provider") open("Add Provider");
  };
  const periods = ["Today", "7 Days", "30 Days"];
  const series: Record<string, { sent: number[]; delivered: number[] }> = {
    "30 Days": { sent: [2,4,3,3,5,5,6.5,5.5,7.5,7.3,5.8,7.7,8,7.5,10], delivered: [1,1.8,2,1.7,3,2.5,3.8,2.9,4.5,4.7,3.7,4.5,5.3,5,6.2] },
    "7 Days": { sent: [4,5,4.4,6.5,7,6,8], delivered: [2.8,3.5,3,4.2,5.2,4.5,6] },
    "Today": { sent: [1,2,1.4,3,4.3,4,5.6], delivered: [.5,1.5,1,2.2,3,2.8,4] },
  };
  const line = (values: number[]) => values.map((v, i) => `${i ? "L" : "M"}${40 + i * 660 / (values.length - 1)},${116 - v * 10}`).join(" ");
  const primary = "rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400";
  return (
    <section aria-labelledby="sms-title" className="@container w-full min-w-0 text-[var(--text)] [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-[var(--primary)]">
      <div className="flex items-center gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-600/25 text-cyan-400"><Smartphone size={27} /></span>
        <div><h1 id="sms-title" className="text-2xl leading-tight font-bold tracking-tight">SMS Workspace</h1><p className="text-sm text-[var(--text-soft)]">Manage your SMS providers, campaigns, templates, automation and delivery in one place.</p></div>
      </div>
      <div className="my-3 flex flex-wrap items-center justify-between gap-2 border-y border-[var(--border)] py-1">
        <nav aria-label="SMS sections" className="grid min-w-0 flex-1 grid-cols-3 gap-1 @min-[720px]:grid-cols-6">
          {(["Overview", "Campaigns", "Templates", "Automation", "Delivery Logs", "Settings"] as const).map(tab => <button key={tab} type="button" aria-current={tab === activeTab ? "page" : undefined} onClick={() => switchTab(tab)} className={`rounded-lg px-2 py-2 text-xs ${tab === activeTab ? "bg-blue-600 font-semibold text-white" : "hover:bg-[var(--surface-2)]"}`}>{tab}</button>)}
        </nav>
        <label className="relative ml-auto flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1.5 text-xs"><CalendarDays size={15} /><span className="sr-only">Reporting period</span><select value={range} onChange={e => { setRange(e.target.value); onPeriodChange?.(e.target.value); }} className="appearance-none bg-transparent pr-5 outline-none">{periods.map(p => <option key={p} value={p} className="bg-[var(--surface)]">{p === "Today" ? p : `Last ${p}`}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-2" /></label>
      </div>
      {notice && <div role="status" className="mb-2 flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-3 py-2 text-xs">{notice}<button type="button" aria-label="Dismiss" onClick={() => setNotice("")}><X size={15} /></button></div>}

      {activeTab === "Overview" && <>
      <div className="grid min-w-0 grid-cols-1 gap-3 @min-[900px]:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-3">
          <div className="mb-2 flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold">SMS Provider Connections</h2><p className="text-[11px] text-[var(--text-soft)]">Your connected SMS providers and their status.</p></div><button type="button" onClick={() => action("add-provider")} className={`${primary} flex shrink-0 items-center gap-1 !py-1.5`}><Plus size={14} />Add Provider</button></div>
          <div className="grid min-w-0 grid-cols-1 gap-3 @min-[520px]:grid-cols-2">
            {(["Twilio", "MessageBird"] as const).map((provider, i) => <article key={provider} className="min-w-0 rounded-xl border border-[var(--border-strong)] bg-linear-to-br from-[var(--surface-2)] to-[var(--page)] p-2.5">
              <div className="flex items-start gap-2"><span className={`grid size-9 shrink-0 place-items-center rounded-xl text-white ${i ? "bg-blue-500" : "bg-rose-500"}`}>{i ? <Send size={24} /> : <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true"><circle cx="16" cy="16" r="12" fill="none" stroke="white" strokeWidth="4" />{[[12,12],[20,12],[12,20],[20,20]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="white" />)}</svg>}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-xs font-bold">{provider}</h3><span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-[var(--success)]"><Check size={11} />Connected</span></div><p className="mt-1 text-[10px] leading-tight text-[var(--text-soft)]">{i ? "Scalable SMS for global businesses." : "Global SMS, high delivery and developer friendly API."}</p></div><button type="button" aria-label={`${provider} options`} onClick={() => { setProvider(provider); onProviderMenu?.(provider); open("Provider details"); }} className="rounded p-1 hover:bg-[var(--surface-3)]"><MoreVertical size={15} /></button></div>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-[11px]"><div><dt className="text-[var(--text-soft)]">Sender ID</dt><dd className="font-bold">OrbitFlow</dd></div><div><dt className="text-[var(--text-soft)]">Balance</dt><dd className="font-bold">{i ? "₹ 7,800.00" : "₹ 4,250.00"}</dd></div><div><dt className="text-[var(--text-soft)]">Delivery Rate</dt><dd className="font-bold">{i ? "98.9%" : "99.3%"}</dd></div></dl>
            </article>)}
          </div>
        </section>
        <aside className="relative flex min-w-0 items-center overflow-hidden rounded-xl border border-indigo-500 bg-linear-to-br from-indigo-600 via-indigo-800 to-blue-950 p-4 text-white">
          <div className="relative z-10 w-[70%]"><h2 className="text-lg leading-tight font-bold">Run powerful<br />SMS campaigns</h2><ul className="mt-3 space-y-2 text-[10px]">{["Transactional (OTP, order, updates)","Marketing & promotional SMS","Automated alerts & reminders"].map(t => <li key={t} className="flex items-center gap-2"><Check size={14} className="shrink-0" />{t}</li>)}</ul></div>
          <svg viewBox="0 0 130 160" role="img" aria-label="SMS phone illustration" className="absolute right-1 bottom-0 h-[145px] w-[110px]"><circle cx="24" cy="34" r="13" fill="#525cff" opacity=".3"/><path d="M64 35h40q10 0 8 12l-14 91q-1 9-10 9H48q-10 0-8-12l14-89q1-11 10-11Z" fill="#2428ac" stroke="#949aff" strokeWidth="3"/><path d="M73 42h20" stroke="#9c9dff" strokeWidth="2"/><path d="m93 18 28-9-12 27-6-12Z" fill="#a6a4ff"/><rect x="12" y="57" width="69" height="45" rx="12" fill="#6b72ff"/><text x="46" y="86" fill="white" fontSize="21" fontWeight="700" textAnchor="middle">SMS</text><path d="m51 99-3 13 16-13" fill="#6b72ff"/></svg>
        </aside>
      </div>

      <div className="my-3 grid min-w-0 grid-cols-2 gap-2 @min-[640px]:grid-cols-5">
        {[
          {label:"Messages Sent",value:"52,840",detail:"↑ +14.8%",icon:Send,tone:"bg-indigo-500/25 text-sky-400"},
          {label:"Delivered",value:"51,938",detail:"99.3%",icon:Check,tone:"bg-emerald-500/25 text-emerald-400"},
          {label:"Replies",value:"3,762",detail:"↑ +21.4%",icon:MessageSquare,tone:"bg-indigo-500/25 text-blue-400"},
          {label:"Failed",value:"902",detail:"1.7%",icon:X,tone:"bg-rose-500/25 text-rose-400"},
          {label:"Active Campaigns",value:"6",detail:"◉ Running",icon:Users,tone:"bg-blue-500/25 text-cyan-400"},
        ].map(({label,value,detail,icon:Icon,tone}) => <article key={label} className="flex min-w-0 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5"><span className={`grid size-9 shrink-0 place-items-center rounded-full ${tone}`}><Icon size={23} /></span><div className="min-w-0 flex-1"><h3 className="text-[10px]">{label}</h3><div className="flex flex-wrap items-center justify-between gap-1"><strong className="text-xl leading-tight">{value}</strong><span className={`text-[10px] font-bold ${label === "Failed" ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>{detail}</span></div></div></article>)}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 @min-[800px]:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-3">
          <div className="flex items-start justify-between gap-2"><div><h2 className="text-sm font-bold">Message Performance</h2><p className="text-[11px] text-[var(--text-soft)]">SMS volume and delivery trend</p></div><div className="flex rounded-lg border border-[var(--border)] p-0.5">{periods.map(p => <button key={p} type="button" aria-pressed={range === p} onClick={() => {setRange(p);onPeriodChange?.(p);}} className={`rounded-md px-2 py-1 text-[10px] ${range === p ? "bg-blue-600 font-bold text-white" : "hover:bg-[var(--surface-2)]"}`}>{p}</button>)}</div></div>
          <svg viewBox="0 0 720 140" role="img" aria-label={`Sample SMS performance for ${range}`} className="mt-1 h-[138px] w-full" preserveAspectRatio="none">
            <defs><linearGradient id={`${id}-sent`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#008bff" stopOpacity=".6"/><stop offset="1" stopColor="#008bff" stopOpacity=".05"/></linearGradient><linearGradient id={`${id}-delivered`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#00e579" stopOpacity=".45"/><stop offset="1" stopColor="#00e579" stopOpacity=".03"/></linearGradient></defs>
            {[0,2,4,6,8,10].map(v => <g key={v}><line x1="40" x2="700" y1={116-v*10} y2={116-v*10} stroke="var(--border)" opacity=".5"/><text x="25" y={120-v*10} textAnchor="end" fill="var(--text-soft)" fontSize="10">{v ? `${v}K` : "0"}</text></g>)}
            <path d={`${line(series[range].sent)} L700,116 L40,116 Z`} fill={`url(#${id}-sent)`}/><path d={line(series[range].sent)} fill="none" stroke="#0099ff" strokeWidth="2.3"/>
            <path d={`${line(series[range].delivered)} L700,116 L40,116 Z`} fill={`url(#${id}-delivered)`}/><path d={line(series[range].delivered)} fill="none" stroke="#00e579" strokeWidth="2.3"/>
            {(range === "30 Days" ? ["Oct 1","Oct 4","Oct 7","Oct 10","Oct 13","Oct 16","Oct 19","Oct 22","Oct 25","Oct 28","Oct 31"] : range === "7 Days" ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] : ["00:00","04:00","08:00","12:00","16:00","20:00"]).map((t,i,a) => <text key={t} x={40+i*660/(a.length-1)} y="133" textAnchor={i === 0 ? "start" : i === a.length-1 ? "end" : "middle"} fill="var(--text-soft)" fontSize="10">{t}</text>)}
          </svg>
          <div className="flex justify-center gap-5 text-[10px]"><span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-blue-500"/>Messages Sent</span><span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-emerald-400"/>Delivered</span></div>
        </section>
        <section className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-3"><h2 className="text-sm font-bold">Quick Actions</h2><p className="text-[11px] text-[var(--text-soft)]">Common SMS tasks to get you started.</p><div className="mt-2 grid grid-cols-2 gap-2">{[
          {key:"new-campaign",title:"New SMS Campaign",text:"Create and send a campaign",icon:Plus},
          {key:"message-template",title:"Message Template",text:"Create reusable SMS templates",icon:FileText},
          {key:"automation-flow",title:"Automation Flow",text:"Send automated SMS (OTP, reminders, alerts)",icon:Workflow},
          {key:"import-contacts",title:"Import Contacts",text:"Upload contacts or sync from CRM",icon:Users},
        ].map(({key,title,text,icon:Icon}) => <button key={key} type="button" onClick={() => action(key as Parameters<NonNullable<Props["onAction"]>>[0])} className="flex min-w-0 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-2 text-left transition hover:border-blue-500 hover:bg-[var(--surface-3)]"><span className={`grid size-9 shrink-0 place-items-center rounded-full ${key === "automation-flow" ? "bg-violet-600/40 text-violet-300" : "bg-blue-600/30 text-cyan-400"}`}><Icon size={23}/></span><span className="min-w-0"><strong className="block text-[11px] leading-tight">{title}</strong><span className="mt-1 block text-[10px] leading-tight text-[var(--text-soft)]">{text}</span></span></button>)}</div></section>
      </div>
      </>}
      {activeTab !== "Overview" && <section className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">{activeTab}</h2><p className="mt-1 text-xs text-[var(--muted)]">{activeTab === "Delivery Logs" ? "Live delivery events appear when your SMS backend is connected." : "Manage your SMS workspace. Changes here are kept for this session."}</p></div>
          {["Campaigns","Templates","Automation"].includes(activeTab) && <button className={primary} onClick={() => open(activeTab)}>＋ {activeTab === "Automation" ? "New automation" : activeTab === "Templates" ? "New template" : "New campaign"}</button>}
        </div>
        {["Campaigns","Templates","Automation"].includes(activeTab) && <>
          <label className="mt-4 block max-w-sm text-xs">Search {activeTab.toLowerCase()}<input className={field} value={query} onChange={e => {setQuery(e.target.value);setPage(0);}} placeholder="Search by name or message" /></label>
          <div className="mt-4 space-y-2">{filtered.length === 0 ? <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">{query ? "No matching items." : `No ${activeTab.toLowerCase()} yet. Create your first one above.`}</div> : filtered.slice(page * 3, page * 3 + 3).map(item => <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3"><div className="min-w-0 flex-1"><h3 className="text-sm font-semibold">{item.name}</h3><p className="mt-1 truncate text-xs text-[var(--muted)]">{item.message}</p><span className="mt-1 inline-block text-[10px] text-blue-400">{item.kind === "Automation" ? item.enabled ? "Enabled locally · not deployed" : "Paused" : "Draft · not sent"}</span></div><div className="flex gap-2">{item.kind === "Automation" && <button className={secondary} onClick={() => setItems(items.map(x => x.id === item.id ? {...x,enabled:!x.enabled} : x))}>{item.enabled ? "Pause" : "Enable"}</button>}<button className={secondary} onClick={() => {open(item.kind);setEditing(item.id);setName(item.name);setMessage(item.message);}}>Edit</button><button className={secondary} onClick={() => {open("Delete item");setEditing(item.id);setName(item.name);}}>Delete</button></div></article>)}</div>
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]"><span>{filtered.length} items</span><div className="flex items-center gap-2"><button disabled={page === 0} className={`${secondary} disabled:opacity-40`} onClick={() => setPage(page - 1)}>Previous</button><span>{page + 1} / {Math.max(1,Math.ceil(filtered.length / 3))}</span><button disabled={(page + 1) * 3 >= filtered.length} className={`${secondary} disabled:opacity-40`} onClick={() => setPage(page + 1)}>Next</button></div></div>
        </>}
        {activeTab === "Delivery Logs" && <div className="mt-4"><div className="grid grid-cols-4 rounded-lg bg-[var(--surface-2)] p-3 text-xs font-semibold"><span>Recipient</span><span>Provider</span><span>Status</span><span>Sent at</span></div><div className="py-12 text-center text-sm text-[var(--muted)]">No live delivery events available. Creating local drafts does not send SMS.</div></div>}
        {activeTab === "Settings" && <form className="mt-4 grid max-w-2xl gap-4" onSubmit={e => {e.preventDefault();setNotice("Settings saved for this session. No provider settings were changed.");}}><div className="grid grid-cols-2 gap-3"><label className="text-xs">Default provider<select className={field} value={provider} onChange={e => setProvider(e.target.value)}><option>Twilio</option><option>MessageBird</option></select></label><label className="text-xs">Sender ID<input className={field} required maxLength={11} value={sender} onChange={e => setSender(e.target.value)} /></label></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} />Delivery notifications</label><div className="flex items-center gap-3"><button className={primary} type="submit">Save settings</button><button className={secondary} type="button" onClick={() => open("Import Contacts")}>Import contacts ({contacts.length})</button></div></form>}
      </section>}
      <dialog ref={dialog} aria-labelledby="sms-modal-title" className="fixed inset-0 m-auto w-[min(480px,92vw)] rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-2xl backdrop:bg-black/60">
        <div className="mb-4 flex items-center justify-between"><h2 id="sms-modal-title" className="text-lg font-bold">{modalKind === "Delete item" ? "Delete item?" : editing !== null ? "Edit draft" : modalKind}</h2><button aria-label="Close" className="rounded-lg p-2 hover:bg-[var(--surface-2)]" onClick={() => dialog.current?.close()}><X size={18}/></button></div>
        <p role="alert" className="mb-2 text-xs text-[var(--danger)]">{formError}</p>
        {["Campaigns","Templates","Automation"].includes(modalKind) ? <form className="space-y-3" onSubmit={e => {e.preventDefault();if (!name.trim() || !message.trim()) {setFormError("Enter a name and message.");return;}setItems(editing === null ? [...items,{id:Date.now(),kind:modalKind,name:name.trim(),message:message.trim(),enabled:false}] : items.map(x => x.id === editing ? {...x,name:name.trim(),message:message.trim()} : x));setQuery("");setPage(0);dialog.current?.close();}}><label className="block text-xs">Name<input autoFocus required maxLength={100} className={field} value={name} onChange={e => setName(e.target.value)} /></label><label className="block text-xs">{modalKind === "Automation" ? "Reply message" : "Message"}<textarea rows={4} required maxLength={1600} className={`${field} resize-none`} value={message} onChange={e => setMessage(e.target.value)} /></label><p className="text-xs text-[var(--muted)]">{message.length}/1600 characters · Saved locally for this session. No SMS is sent.</p><div className="flex justify-end gap-2"><button type="button" className={secondary} onClick={() => dialog.current?.close()}>Cancel</button><button type="submit" className={primary}>Save draft</button></div></form>
        : modalKind === "Delete item" ? <div><p className="text-sm">Delete “{name}” from this session?</p><div className="mt-5 flex justify-end gap-2"><button className={secondary} onClick={() => dialog.current?.close()}>Cancel</button><button className="rounded-lg bg-red-600 px-3 py-2 text-xs text-white" onClick={() => {setItems(items.filter(x => x.id !== editing));setPage(0);dialog.current?.close();}}>Delete</button></div></div>
        : modalKind === "Import Contacts" ? <form className="space-y-3" onSubmit={e => {e.preventDefault();const values=message.split(/[\n,;]/).map(x => x.trim()).filter(Boolean);if (!values.length || values.some(x => !/^\+[1-9]\d{7,14}$/.test(x))) {setFormError("Use international numbers such as +919876543210, one per line. No names or headers.");return;}setContacts([...new Set([...contacts,...values])]);setNotice("Contacts imported for this session. No messages sent.");dialog.current?.close();}}><label className="block text-xs">Phone numbers<textarea required rows={5} className={`${field} resize-none`} value={message} onChange={e => setMessage(e.target.value)} placeholder="+919876543210" /></label><p className="text-xs text-[var(--muted)]">One international number per line. Duplicates are removed.</p><button type="submit" className={primary}>Import contacts</button></form>
        : <div className="space-y-4"><label className="block text-xs">Provider<select className={field} value={provider} onChange={e => setProvider(e.target.value)}><option>Twilio</option><option>MessageBird</option></select></label>{modalKind === "Provider details" && <dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-[var(--muted)]">Sender</dt><dd>OrbitFlow</dd></div><div><dt className="text-[var(--muted)]">Account</dt><dd>Sample connected account</dd></div></dl>}<p className="text-sm text-[var(--text-soft)]">Live connection and credential management require your server-side provider integration. No credentials are stored by this interface.</p><button className={primary} onClick={() => {dialog.current?.close();switchTab("Settings");}}>Open SMS settings</button></div>}
      </dialog>
    </section>
  );
}

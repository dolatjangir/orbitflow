"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check, Plug, Send, Settings, MessageSquare, BookOpen, X } from "lucide-react";

type Provider = "Google RCS" | "Route Mobile";
type Props = {
  /** Start your server-backed provider connection flow. Never expose API secrets here. */
  onConnect?: (provider: Provider) => Promise<void>;
};

export default function RCSWorkspace({ onConnect }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [provider, setProvider] = useState<Provider>("Google RCS");
  const [guide, setGuide] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const connect = async () => {
    if (!onConnect || busy) return;
    setBusy(true); setError("");
    try { await onConnect(provider); setStarted(true); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to start the connection. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <section aria-labelledby="rcs-workspace-title" className="@container w-full min-w-0 bg-[var(--page)] text-[var(--text)]">
      <div className="flex w-full min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-4 px-1">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-linear-to-br from-blue-600/30 to-blue-800/60 text-cyan-400 shadow-lg shadow-blue-600/10"><MessageSquare size={28} strokeWidth={2.5} /></span>
          <div className="min-w-0 flex-1"><h1 id="rcs-workspace-title" className="text-2xl leading-tight font-bold tracking-tight">RCS Workspace</h1><p className="mt-1 text-sm leading-snug text-[var(--text-soft)]">Rich Communication Services (RCS) – Send rich, interactive messages with images, buttons, carousels and more.</p></div>
          <button type="button" onClick={() => {setGuide(true); dialog.current?.showModal();}} className="ml-auto inline-flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"><BookOpen size={17} />RCS Guide</button>
        </div>

        <section aria-labelledby="rcs-connect-title" className="grid min-w-0 grid-cols-1 items-center gap-4 rounded-xl border border-[var(--border-strong)] bg-linear-to-br from-[var(--surface)] via-[var(--page)] to-[var(--surface)] p-4 @min-[780px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] @min-[1100px]:gap-6 @min-[1100px]:p-5">
          <div className="grid min-w-0 grid-cols-[110px_minmax(0,1fr)] items-center gap-3 @min-[1000px]:grid-cols-[minmax(140px,.85fr)_minmax(0,1.15fr)] @min-[1200px]:gap-6">
            <svg viewBox="0 0 300 240" role="img" aria-label="RCS rich messaging phone illustration" className="mx-auto block max-h-[230px] w-full">
              <defs>
                <linearGradient id="rcs-phone-body" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#172e91" /><stop offset="1" stopColor="#19166f" /></linearGradient>
                <linearGradient id="rcs-phone-edge" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5f9bff" /><stop offset="1" stopColor="#6747ff" /></linearGradient>
                <linearGradient id="rcs-bubble" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6975ff" /><stop offset="1" stopColor="#5334ff" /></linearGradient>
                <radialGradient id="rcs-glow"><stop stopColor="#4338ca" stopOpacity=".5" /><stop offset="1" stopColor="#4338ca" stopOpacity="0" /></radialGradient>
              </defs>
              <ellipse cx="145" cy="144" rx="140" ry="105" fill="url(#rcs-glow)" />
              <circle cx="42" cy="62" r="20" fill="#2945c1" opacity=".3" /><circle cx="35" cy="188" r="23" fill="#4235d2" opacity=".3" /><circle cx="249" cy="169" r="20" fill="#243cba" opacity=".2" />
              <path d="m42 58 1 3 3 1-3 1-1 3-1-3-3-1 3-1ZM250 165l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="#7cb9ff" />
              <path d="M105 18h88q22 0 17 24l-34 159q-3 18-20 18H68q-21 0-16-22L86 39q4-21 19-21Z" fill="#302bc2" transform="translate(7 4)" />
              <path d="M105 18h88q22 0 17 24l-34 159q-3 18-20 18H68q-21 0-16-22L86 39q4-21 19-21Z" fill="url(#rcs-phone-body)" stroke="url(#rcs-phone-edge)" strokeWidth="5" />
              <path d="M133 29h32" stroke="#4d76fc" strokeWidth="5" strokeLinecap="round" />
              <path d="m102 166 65-2-7 35h-65Z" fill="#5548fa"/><path d="m101 193 18-20 12 12 14-11 13 17Z" fill="#b7d3ff"/><circle cx="116" cy="170" r="3" fill="#a5ceff"/><circle cx="108" cy="209" r="3" fill="#777dff"/><circle cx="119" cy="209" r="3" fill="#777dff"/><circle cx="130" cy="209" r="3" fill="#777dff"/>
              <path d="M78 167c-20 38 118 37 174-80" stroke="#5369ff" strokeWidth="1.5" strokeDasharray="6 6" fill="none" />
              <path d="M126 72h72q16 0 12 18l-7 39q-2 14-17 14h-39l-21 16 3-16h-7q-17 0-14-16l6-38q2-17 12-17Z" fill="url(#rcs-bubble)" />
              <text x="161" y="119" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="31" fontWeight="700">RCS</text>
              <rect x="239" y="59" width="44" height="42" rx="12" fill="#303cc2" stroke="#666bff"/><path d="m253 69 17 11-17 11Z" stroke="#b5d8ff" fill="none" strokeWidth="2"/><rect x="224" y="131" width="54" height="40" rx="12" fill="#303cc2" stroke="#666bff"/><rect x="234" y="144" width="33" height="14" rx="2" fill="none" stroke="#b5d8ff" strokeWidth="2"/><path d="M239 149h22" stroke="#b5d8ff" strokeWidth="2"/><rect x="18" y="29" width="43" height="39" rx="11" fill="#303cc2"/><rect x="27" y="37" width="26" height="23" rx="2" fill="none" stroke="#b5d8ff" strokeWidth="2"/><path d="m28 55 8-9 6 6 4-4 6 8" stroke="#b5d8ff" fill="none" strokeWidth="2"/>
            </svg>
            <div className="min-w-0">
              <h2 id="rcs-connect-title" className="text-xl leading-tight font-bold tracking-tight @min-[1150px]:text-[22px]">Connect Your RCS Provider</h2>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-soft)]">Enable RCS to deliver richer, more engaging and brand-verified customer experiences.</p>
              <ul className="mt-4 space-y-2 text-xs leading-snug">
                {["Send rich media (images, videos, carousels)", "Use interactive buttons (CTA, quick replies)", "Brand-verified and trusted communication", "Higher engagement and conversion"].map(text => <li key={text} className="flex items-center gap-2.5"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-linear-to-br from-blue-400 to-indigo-500 text-white"><Check size={14} strokeWidth={2.5} /></span>{text}</li>)}
              </ul>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-2 items-stretch gap-3 @min-[1100px]:gap-4">
            {(["Google RCS", "Route Mobile"] as const).map(name => <article key={name} className="flex min-w-0 flex-col rounded-xl border border-[var(--border-strong)] bg-linear-to-br from-[var(--surface-2)] to-[var(--surface)] p-3 @min-[1100px]:p-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-white ${name === "Google RCS" ? "bg-white" : "bg-transparent"}`}>
                  {name === "Google RCS" ? <svg viewBox="0 0 32 32" className="size-8" role="img" aria-label="Google"><circle cx="16" cy="16" r="15" fill="white"/><path d="M25 16h-9" stroke="#4285f4" strokeWidth="4"/><path d="M24 16a8 8 0 0 1-3 6" fill="none" stroke="#4285f4" strokeWidth="4"/><path d="M21 22a8 8 0 0 1-12-3" fill="none" stroke="#34a853" strokeWidth="4"/><path d="M9 19a8 8 0 0 1 0-6" fill="none" stroke="#fbbc05" strokeWidth="4"/><path d="M9 13a8 8 0 0 1 12-3" fill="none" stroke="#ea4335" strokeWidth="4"/></svg> : <svg viewBox="0 0 36 36" className="size-9" role="img" aria-label="Route Mobile"><path d="M5 8q0-7 7-4l19 10q7 4 0 8L12 33q-7 3-7-4Z" fill="#913cf5"/><path d="m8 6 12 7-8 5-7-5V9Z" fill="#c869ef"/><path d="m14 12 12 6-12 7Z" fill="#261055"/><path d="m26 18 7 1-21 14q-7 2-7-4l9-4Z" fill="#6520ca"/></svg>}
                </span><h3 className="min-w-0 break-words text-sm font-bold @min-[1100px]:text-base">{name === "Google RCS" ? <>Google RCS<span className="block text-xs font-semibold">(Business Messaging)</span></> : "Route Mobile RCS"}</h3>
              </div>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-[var(--text-soft)] @min-[1150px]:text-sm">{name === "Google RCS" ? "Enterprise-grade RCS with verified brand and rich messaging." : "Global RCS platform for business messaging at scale."}</p>
              <span className="my-3 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--surface-3)] px-2.5 py-1 text-[11px] leading-none"><span className="size-2 rounded-full bg-[var(--muted)]" />Not Connected</span>
              <button type="button" onClick={() => { setGuide(false); setProvider(name); setError(""); setStarted(false); dialog.current?.showModal(); }} className={`flex min-h-9 w-full items-center justify-center gap-2 rounded-lg px-2 py-2 text-[11px] font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] @min-[1100px]:text-xs ${name === "Google RCS" ? "bg-linear-to-r from-blue-600 to-blue-500" : "bg-linear-to-r from-indigo-600 to-violet-600"}`}>Connect {name}<ArrowRight size={16} className="shrink-0" /></button>
            </article>)}
          </div>
        </section>

        <section aria-labelledby="rcs-steps-title" className="grid min-w-0 grid-cols-1 items-center gap-4 rounded-xl border border-[var(--border)] bg-linear-to-br from-[var(--surface)] to-[var(--surface-2)] p-4 @min-[1000px]:grid-cols-[minmax(0,1fr)_minmax(0,2.8fr)] @min-[1150px]:p-5">
          <div><h2 id="rcs-steps-title" className="text-base leading-tight font-bold tracking-tight">Get Started in 3 Steps</h2><p className="mt-1.5 text-xs leading-snug text-[var(--text-soft)]">Set up your RCS channel and launch your first campaign.</p></div>
          <ol className="grid min-w-0 grid-cols-3 gap-3">
            {[
              { title: "Choose Provider", description: "Select Google RCS or Route Mobile.", icon: Plug },
              { title: "Configure", description: "Add API credentials, sender & brand details.", icon: Settings },
              { title: "Launch Campaign", description: "Create a rich RCS campaign and go live.", icon: Send },
            ].map(({ title, description, icon: Icon }, index) => <li key={title} className="relative flex min-w-0 items-center gap-2 pr-2 @min-[1100px]:gap-3">
              <div className="relative shrink-0"><span className="absolute -top-1 -left-1 grid size-4 place-items-center rounded-full bg-linear-to-b from-blue-300 to-blue-600 text-[10px] text-white">{index + 1}</span><span className="grid size-9 place-items-center rounded-full bg-blue-500/20 text-blue-300 @min-[1100px]:size-12"><Icon size={23} /></span></div>
              <div className="min-w-0"><h3 className="text-[11px] leading-tight font-bold @min-[1150px]:text-xs">{title}</h3><p className="mt-1 text-[10px] leading-snug text-[var(--text-soft)] @min-[1150px]:text-[11px]">{description}</p></div>
              {index < 2 && <ArrowRight aria-hidden="true" size={17} className="ml-auto hidden shrink-0 text-blue-300 @min-[1200px]:block" />}
            </li>)}
          </ol>
        </section>
      </div>

      <dialog ref={dialog} aria-labelledby="rcs-dialog-title" onCancel={e => { if (busy) e.preventDefault(); }} className="fixed inset-0 m-auto w-[min(420px,90vw)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-2xl backdrop:bg-black/60">
        <div className="flex items-center justify-between gap-3"><h2 id="rcs-dialog-title" className="text-lg font-bold">{guide ? "RCS Guide" : `Connect ${provider}`}</h2><button type="button" disabled={busy} aria-label="Close" onClick={() => dialog.current?.close()} className="rounded-lg p-2 hover:bg-[var(--surface-2)]"><X size={18} /></button></div>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-soft)]">{guide ? "1. Choose Google RCS or Route Mobile. 2. Complete your provider onboarding and configure your brand and sender details. 3. Test your rich messages before launching a campaign. Provider credentials must be handled by your server." : started ? "Connection flow started. Your account status will update after verification in your integration." : onConnect ? `Continue to securely connect your ${provider} account.` : "Provider connection is not configured yet. Your application needs a server-side integration before you can connect this account."}</p>
        <p role="alert" className="mt-2 text-sm text-[var(--danger)]">{error}</p>
        <div className="mt-5 flex justify-end gap-2"><button type="button" disabled={busy} onClick={() => dialog.current?.close()} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm">Close</button>{!guide && onConnect && !started && <button type="button" disabled={busy} onClick={() => void connect()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Connecting…" : "Continue"}</button>}</div>
      </dialog>
    </section>
  );
}

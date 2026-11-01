"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Keep globals.css imported once in your root layout.
// Replace the connect button handlers below with your existing backend flows.
export default function WhatsAppPage() {
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [guide, setGuide] = useState<"baileys" | "meta">("baileys");

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const fit = () => {
      const parent = element.parentElement;
      const padding = parent ? parseFloat(getComputedStyle(parent).paddingBottom) || 0 : 0;
      const viewport = window.visualViewport?.height ?? window.innerHeight;
      const available = Math.max(0, viewport - element.getBoundingClientRect().top - padding - 1);
      element.style.height = `${available}px`;
      element.dataset.density = available < 540 ? "compact" : "comfortable";
    };
    fit();
    const observer = new ResizeObserver(fit);
    if (element.parentElement) observer.observe(element.parentElement);
    window.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("resize", fit);
    };
  }, []);

  const showGuide = (provider: "baileys" | "meta") => {
    setGuide(provider);
    dialog.current?.showModal();
  };

  const whatsappMark = (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-full w-full">
      <path d="M39 23a15 15 0 0 1-22 13L8 39l3-9a15 15 0 1 1 28-7Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M18 15c-2 0-3 3-2 6 2 6 7 10 12 11 3 0 5-3 4-4l-5-3-2 2c-3-1-5-3-6-6l2-2-2-4h-1Z" fill="currentColor" />
    </svg>
  );
  const metaMark = (
    <svg viewBox="0 0 64 44" fill="none" aria-hidden="true" className="h-full w-full">
      <path d="M7 31C7 14 14 6 20 8c9 3 17 29 25 29 16 0 8-30 1-30-9 0-18 30-27 30-7 0-12-1-12-6Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <section ref={root} aria-labelledby="whatsapp-title" className="wa-workspace relative min-w-0 overflow-hidden bg-[var(--page)] text-[var(--text)]">
      <div className="wa-content">
        <header className="wa-heading mb-2 flex items-center gap-4">
          <span className="wa-brand grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-700 p-2 text-white shadow-lg shadow-emerald-500/15">{whatsappMark}</span>
          <div className="min-w-0">
            <h1 id="whatsapp-title" className="m-0 text-[clamp(20px,2.1vw,30px)] leading-tight font-bold tracking-tight">WhatsApp Workspace</h1>
            <p className="wa-subtitle mt-1 text-sm text-[var(--text-soft)]">Connect WhatsApp to start messaging, campaigns and automation.</p>
          </div>
        </header>

        <div className="wa-grid grid grid-cols-1 gap-5 @min-[780px]:grid-cols-2">
          {([
            { id: "baileys", title: "Baileys WhatsApp", badge: "Self-hosted", description: "Connect your personal or business WhatsApp using QR code.", detail: "Ideal for small to medium usage.", features: ["Quick setup with QR code", "Two-way messaging", "Chat, automation and campaigns"], help: "How it works" },
            { id: "meta", title: "Meta WhatsApp", badge: "Official API", description: "Connect with WhatsApp Business Platform (Meta).", detail: "Best for business, scale and compliance.", features: ["Official & reliable business API", "Approved message templates", "Higher limits and business verification"], help: "Setup guide" },
          ] as const).map((provider) => (
            <article key={provider.id} className="wa-card relative isolate min-w-0 overflow-hidden rounded-2xl border p-5 xl:p-6" style={{ borderColor: "color-mix(in srgb, #a78bfa 65%, var(--border))", background: "radial-gradient(ellipse at 95% 0%, color-mix(in srgb, #7c3aed 19%, transparent), transparent 65%), linear-gradient(120deg, var(--surface), var(--page))" }}>
              <div className="wa-card-head relative z-10 flex items-start gap-4">
                <span className={`wa-provider-icon grid h-12 w-12 shrink-0 place-items-center rounded-xl p-1.5 text-white shadow-lg ${provider.id === "baileys" ? "bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-700" : "bg-gradient-to-br from-sky-400 via-blue-600 to-blue-700"}`}>
                  {provider.id === "baileys" ? whatsappMark : metaMark}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="wa-card-title text-lg leading-tight font-bold tracking-tight">{provider.title}</h2>
                    <span className="wa-badge rounded-full bg-[var(--surface-3)] px-2.5 py-1 text-[11px] leading-none text-[var(--text-soft)]">{provider.badge}</span>
                  </div>
                  <p className="wa-description mt-2 text-xs leading-relaxed text-[var(--text-soft)]">{provider.description}<br /><span className="wa-detail">{provider.detail}</span></p>
                </div>
              </div>

              <ul className="wa-features relative z-10 my-5 space-y-2 text-[13px]">
                {provider.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] shrink-0 text-[var(--success)]" aria-hidden="true"><path d="M20 11v1a8 8 0 1 1-4.7-7.3M8 11l4 4L21 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="wa-art pointer-events-none" aria-hidden="true">
                {provider.id === "baileys" ? (
                  <svg viewBox="0 0 180 150" fill="none" className="h-full w-full drop-shadow-[0_0_20px_#0891b244]">
                    <path d="m43 30 110-20q7-1 7 7l-3 99-120-1 6-85Z" fill="var(--surface-2)" stroke="#38bdf8" strokeWidth="3" />
                    <path d="m37 115-27 13 127 5 20-17-120-1Z" fill="#2563eb" stroke="#60a5fa" strokeWidth="2" />
                    <path d="m66 121 44 1-5 4-46-1 7-4Z" fill="#0c4a6e" />
                    <g transform="translate(67 43) skewY(-8)"><rect width="60" height="60" rx="4" fill="#e0f2fe" />
                      <path d="M7 7h17v17H7zM36 7h17v17H36zM7 36h17v17H7z" stroke="#075985" strokeWidth="4" />
                      <path d="M12 12h7v7h-7zM41 12h7v7h-7zM12 41h7v7h-7zM29 7h3v24h-3zM36 31h8v7h9v7H40v8h-9V40h5zM8 28h16v4H8zM47 49h6v5h-6z" fill="#075985" />
                    </g>
                    <circle cx="97" cy="69" r="12" fill="#10b981" stroke="#e0f2fe" strokeWidth="2" /><path d="M92 64q0 9 9 11l3-3-4-2-2 1-3-4 1-2-4-1Z" fill="white" />
                  </svg>
                ) : (
                  <div className="wa-meta-window relative mt-3 h-32 rotate-[-5deg] rounded-lg border-2 border-violet-500 bg-[var(--surface-2)] shadow-[0_0_28px_#7c3aed33]">
                    <div className="flex h-4 gap-1 rounded-t-md bg-violet-600/60 px-1.5 pt-1">{[0, 1, 2].map((n) => <i key={n} className="h-1 w-1 rounded-full bg-violet-200" />)}</div>
                    <div className="mx-auto mt-2 h-10 w-14 text-blue-500">{metaMark}</div>
                    <div className="text-center text-sm leading-tight font-semibold">Meta<br /><span className="font-normal">WhatsApp</span></div>
                    <span className="absolute right-[-10px] bottom-3 grid h-8 w-8 place-items-center rounded-full border-4 border-[var(--surface)] bg-emerald-400 text-white">✓</span>
                  </div>
                )}
              </div>

              <div className="wa-actions relative z-10 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => showGuide(provider.id)} className="wa-connect inline-flex min-h-10 items-center justify-center gap-2 rounded-[9px] border border-indigo-500 bg-gradient-to-b from-indigo-500 to-indigo-700 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/15 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]">
                  <span className="text-xl leading-none" aria-hidden="true">＋</span>Connect {provider.title}
                </button>
                <button type="button" onClick={() => showGuide(provider.id)} className="wa-help inline-flex min-h-10 items-center justify-center gap-2 rounded-[9px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold transition hover:bg-[var(--surface-3)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]">
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M5 2h7l4 4v12H5V2Zm7 0v5h4M8 10h5M8 13h5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>{provider.help}
                </button>
              </div>
            </article>
          ))}
        </div>

        <section className="wa-bottom mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]" aria-labelledby="wa-bottom-title">
          <div className="wa-bottom-heading flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--primary)] uppercase">More than messaging</p>
              <h2 id="wa-bottom-title" className="mt-1 text-base font-bold">One workspace. Every conversation.</h2>
            </div>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-[10px] text-[var(--muted)]">Connect a channel to get started</span>
          </div>
          <div className="wa-benefits grid grid-cols-4 gap-3 p-4">
            {[
              { title: "Shared inbox", text: "Keep customer conversations together.", color: "#10b981", path: "M4 4h16v12h-5l-3 4-3-4H4V4Zm4 5h8M8 12h5" },
              { title: "Campaigns", text: "Reach your audience with purpose.", color: "#818cf8", path: "m4 10 13-6v16L4 14v-4Zm3 5 2 6h3M20 9l2-1M20 15l2 1" },
              { title: "Automations", text: "Make your follow-ups feel effortless.", color: "#f59e0b", path: "m13 2-9 12h7l-1 8 10-13h-7l1-7Z" },
              { title: "Team collaboration", text: "Give every conversation a clear owner.", color: "#38bdf8", path: "M15 21v-3a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v3M16 4a4 4 0 0 1 0 8M21 21v-3a4 4 0 0 0-3-4M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" },
            ].map((item) => (
              <div key={item.title} className="wa-benefit rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ color: item.color, background: `color-mix(in srgb, ${item.color} 13%, transparent)` }}>
                    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true"><path d={item.path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <h3 className="text-xs font-semibold">{item.title}</h3>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--muted)]">{item.text}</p>
              </div>
            ))}
          </div>
          {/* <div className="wa-journey flex items-center justify-center gap-4 border-t border-[var(--border)] bg-[var(--primary-soft)] px-4 py-3 text-[11px] text-[var(--text-soft)]">
            <span><b className="mr-2 text-[var(--primary)]">01</b>Connect your account</span>
            <span aria-hidden="true" className="text-[var(--muted)]">→</span>
            <span><b className="mr-2 text-[var(--primary)]">02</b>Set up your workspace</span>
            <span aria-hidden="true" className="text-[var(--muted)]">→</span>
            <span><b className="mr-2 text-[var(--primary)]">03</b>Start conversations</span>
          </div> */}
        </section>
      </div>

      <dialog ref={dialog} aria-labelledby="wa-guide-title" className="fixed inset-0 m-auto max-h-[85dvh] w-[min(440px,90vw)] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text)] shadow-2xl backdrop:bg-black/60">
        <div className="flex items-start justify-between gap-4">
          <h2 id="wa-guide-title" className="text-lg font-bold">{guide === "baileys" ? "Connect Baileys WhatsApp" : "Connect Meta WhatsApp"}</h2>
          <button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Close setup guide" className="rounded px-2 text-xl focus-visible:outline-2">×</button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-soft)]">This interface is ready. A backend connection has not been configured yet.</p>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-[var(--text-soft)]">
          {(guide === "baileys" ? ["Connect this button to your server-side Baileys session endpoint.", "Display the live QR code returned by your server and scan it from WhatsApp → Linked devices.", "Read connection status from your server before showing the account as connected."] : ["Connect this button to your Meta Embedded Signup flow or existing server-side connection flow.", "Complete the business and WhatsApp phone number setup.", "Verify credentials and webhooks on your server before showing the account as connected."]).map((step) => <li key={step}>{step}</li>)}
        </ol>
      </dialog>

      <style jsx>{`
        .wa-workspace { height: calc(100dvh - var(--header-height, 66px)); container-type: inline-size; }
        .wa-workspace { width: 100%; max-width: none; margin: 0; }
        .wa-content { width: 100%; max-width: none; margin: 0; padding: 16px; }
        .wa-heading { margin-bottom: 16px; }
        .wa-grid { gap: 16px; }
        .wa-card { padding: 18px; }
        .wa-bottom { margin-top: 16px; }
        .wa-card { display: grid; grid-template-columns: minmax(0, 1fr) 142px; gap: 14px 12px; align-content: start; }
        .wa-card-head { grid-column: 1 / -1; }
        .wa-features { grid-column: 1; margin: 0; align-self: center; padding: 0; }
        .wa-art { display: block; position: relative; grid-column: 2; grid-row: 2; width: 142px; height: 116px; align-self: center; }
        .wa-actions { grid-column: 1 / -1; margin-top: 0; }
        .wa-meta-window { margin: 0 7px; height: 116px; }
        .wa-card::after { content: ""; position: absolute; right: -60px; top: 60px; width: 200px; height: 200px; background: radial-gradient(circle, #6366f119, transparent 70%); pointer-events: none; z-index: -1; }
        .wa-bottom { background: radial-gradient(ellipse at 100% 100%, var(--primary-soft), transparent 60%), var(--surface); }
        @container (max-width: 1000px) {
          .wa-content { padding: 14px; }
          .wa-card { padding: 16px; grid-template-columns: minmax(0, 1fr) 112px; gap: 12px 8px; }
          .wa-art { width: 112px; height: 126px; }
          .wa-card-title { font-size: 16px; }
          .wa-features { font-size: 12px; }
          .wa-provider-icon { width: 40px; height: 40px; }
          .wa-meta-window { height: 118px; }
          .wa-actions { gap: 8px; }
          .wa-connect, .wa-help { padding-inline: 9px; font-size: 11px; }
        }
        @container (max-width: 779px) {
          .wa-grid { gap: 12px; }
          .wa-card { grid-template-columns: minmax(0, 1fr) 130px; }
          .wa-card-head { grid-column: 1; }
          .wa-art { grid-row: 1 / 3; width: 130px; height: 138px; }
          .wa-description { font-size: 11px; }
          .wa-detail { display: none; }
          .wa-features { font-size: 11px; }
          .wa-features li + li { margin-top: 4px; }
          .wa-benefits { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding: 10px; }
          .wa-bottom-heading { padding: 12px; }
          .wa-bottom-heading > span { display: none; }
          .wa-benefit { padding: 10px; }
          .wa-benefit p { display: none; }
          .wa-benefit > div { margin-bottom: 0; }
          .wa-journey { gap: 8px; font-size: 10px; }
          .wa-journey b { display: none; }
        }
        @container (max-width: 440px) {
          .wa-content { padding: 10px; }
          .wa-heading { gap: 10px; margin-bottom: 12px; }
          .wa-brand { width: 42px; height: 42px; }
          .wa-subtitle { font-size: 11px; }
          .wa-card { padding: 12px; grid-template-columns: minmax(0, 1fr) 85px; }
          .wa-card-head { gap: 8px; }
          .wa-provider-icon { width: 30px; height: 30px; }
          .wa-card-title { font-size: 14px; }
          .wa-badge { font-size: 9px; }
          .wa-art { width: 85px; height: 110px; }
          .wa-meta-window { height: 106px; }
          .wa-meta-window > div:nth-child(2) { width: 40px; height: 30px; }
          .wa-meta-window > div:nth-child(3) { font-size: 12px; }
          .wa-connect, .wa-help { min-height: 34px; font-size: 10px; gap: 4px; padding: 5px 7px; }
          .wa-bottom { margin-top: 12px; }
        }
        /* Reduce spacing and illustration height, never the page width or text scale. */
        .wa-workspace[data-density="compact"] .wa-content { padding: 10px 14px; }
        .wa-workspace[data-density="compact"] .wa-heading { margin-bottom: 12px; }
        .wa-workspace[data-density="compact"] .wa-brand { width: 44px; height: 44px; }
        .wa-workspace[data-density="compact"] .wa-heading h1 { font-size: 24px; }
        .wa-workspace[data-density="compact"] .wa-grid { gap: 14px; }
        .wa-workspace[data-density="compact"] .wa-card { padding: 14px; gap: 10px; }
        .wa-workspace[data-density="compact"] .wa-art { height: 96px; }
        .wa-workspace[data-density="compact"] .wa-meta-window { height: 96px; }
        .wa-workspace[data-density="compact"] .wa-meta-window > div:nth-child(2) { height: 28px; margin-top: 4px; }
        .wa-workspace[data-density="compact"] .wa-meta-window > div:nth-child(3) { font-size: 12px; }
        .wa-workspace[data-density="compact"] .wa-description { margin-top: 5px; }
        .wa-workspace[data-density="compact"] .wa-provider-icon { width: 40px; height: 40px; }
        .wa-workspace[data-density="compact"] .wa-connect,
        .wa-workspace[data-density="compact"] .wa-help { min-height: 36px; padding-block: 6px; }
        .wa-workspace[data-density="compact"] .wa-bottom { margin-top: 12px; }
        .wa-workspace[data-density="compact"] .wa-bottom-heading { padding: 9px 14px; }
        .wa-workspace[data-density="compact"] .wa-bottom-heading h2 { font-size: 14px; }
        .wa-workspace[data-density="compact"] .wa-benefits { padding: 10px; gap: 8px; }
        .wa-workspace[data-density="compact"] .wa-benefit { padding: 8px; }
        .wa-workspace[data-density="compact"] .wa-benefit > div { margin-bottom: 4px; }
        .wa-workspace[data-density="compact"] .wa-journey { padding-block: 8px; }
      `}</style>
    </section>
  );
}

'use client';

import { getFilteredWhatsapp, whatsappAllCustomer } from '@/store/whatsapp/whatsapp';

import React, { useEffect, useMemo, useState } from 'react';

type Kind = 'text' | 'image' | 'video' | 'document' | 'poll' | 'location';

type Tpl = {

    _id: string; name: string; body: string; description?: string | null; status?: string | null;

    category?: string | null; whatsappMediaType?: string | null; whatsappFileName?: string | null;

    whatsappImage?: any; whatsappLinkPreview?: any; whatsappLocation?: any; whatsappPoll?: any;

};

/* ───────── helpers ───────── */

const asJson = (v: any, fallback: any = null) => {

    if (v == null || v === '') return fallback;

    if (typeof v === 'string') { try { return JSON.parse(v) ?? fallback; } catch { return fallback; } }

    return v;

};

const filesOf = (t: Tpl): string[] => { const v = asJson(t.whatsappImage, []); return Array.isArray(v) ? v.filter(Boolean) : []; };

const pollOf = (t: Tpl) => { const p = asJson(t.whatsappPoll); return p?.name ? p : null; };

const locOf = (t: Tpl) => { const l = asJson(t.whatsappLocation); return l && l.lat != null && l.lng != null ? l : null; };

const linkOf = (t: Tpl) => { const l = asJson(t.whatsappLinkPreview); return l?.sourceUrl ? l : null; };

// Same rule as resolveMediaType() on the backend, so the preview matches what is actually sent

const kindOf = (t: Tpl): Kind => {

    const mt = t.whatsappMediaType;

    if ((mt === 'image' || mt === 'video' || mt === 'document') && filesOf(t)[0]) return mt;

    if (pollOf(t)) return 'poll';

    if (locOf(t)) return 'location';

    return 'text';

};

/* ───────── icons ───────── */

const Ic = ({ children, className = 'w-4 h-4' }: { children: React.ReactNode; className?: string }) => (

    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{children}</svg>

);

type P = { className?: string };

const I = {

    Close: (p: P) => <Ic {...p}><path d="M6 18L18 6M6 6l12 12" /></Ic>,

    Search: (p: P) => <Ic {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Ic>,

    Text: (p: P) => <Ic {...p}><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="14" y2="18" /></Ic>,

    Image: (p: P) => <Ic {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></Ic>,

    Video: (p: P) => <Ic {...p}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></Ic>,

    Doc: (p: P) => <Ic {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></Ic>,

    Pin: (p: P) => <Ic {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></Ic>,

    Poll: (p: P) => <Ic {...p}><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></Ic>,

    Send: ({ className = 'w-4 h-4' }: P) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>,

    Spinner: ({ className = 'w-4 h-4' }: P) => (

        <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">

            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />

            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />

        </svg>

    ),

};

const KINDS: Record<Kind, { label: string; icon: React.ComponentType<P>; tone: string }> = {

    text: { label: 'Text', icon: I.Text, tone: 'bg-[var(--primary-soft)] text-[var(--primary)]' },

    image: { label: 'Image', icon: I.Image, tone: 'bg-[var(--primary-soft)] text-[var(--primary)]' },

    video: { label: 'Video', icon: I.Video, tone: 'bg-[var(--primary-soft)] text-[var(--primary)]' },

    document: { label: 'Document', icon: I.Doc, tone: 'bg-[var(--primary-soft)] text-[var(--primary)]' },

    poll: { label: 'Poll', icon: I.Poll, tone: 'bg-[var(--primary-soft)] text-[var(--primary)]' },

    location: { label: 'Location', icon: I.Pin, tone: 'bg-[var(--primary-soft)] text-[var(--primary)]' },

};

/* ───────── placeholders: green = will be filled, amber = will be sent as typed ───────── */

const KNOWN = new Set(['Name', 'City', 'Campaign', 'ContactNumber', 'Email']);

const Placeholders = ({ text }: { text: string }) => (

    <>

        {text.split(/(\{\{[^{}]+\}\})/g).map((part, i) => {

            if (!/^\{\{[^{}]+\}\}$/.test(part)) return <React.Fragment key={i}>{part}</React.Fragment>;

            const key = part.slice(2, -2);

            const ok = KNOWN.has(key) || key.startsWith('CustomerFields.');

            return (

                <span

                    key={i}

                    title={ok ? 'Filled in for each customer' : 'Not recognised, will be sent exactly as written'}

                    className={`rounded-md px-1.5 py-0.5 font-medium ring-1 ${ok ? 'bg-emerald-500/10 text-[var(--success)] ring-emerald-500/20' : 'bg-amber-500/10 text-[var(--text-soft)] ring-amber-500/20'}`}

                >

                    {part}

                </span>

            );

        })}

    </>

);

/* ───────── preview ───────── */

const Bubble = ({ children }: { children: React.ReactNode }) => (

    <div className="ml-auto w-fit max-w-[320px] rounded-2xl rounded-tr-sm border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-sm text-[13px] text-[var(--text)]">

        {children}

        <p className="mt-1 text-right text-[9.5px] text-[var(--muted)]">now ✓</p>

    </div>

);

const Preview = ({ t }: { t: Tpl }) => {

    const kind = kindOf(t);

    const url = filesOf(t)[0];

    const poll = pollOf(t);

    const loc = locOf(t);

    const link = linkOf(t);

    const body = t.body ? (

        <p className="whitespace-pre-wrap break-words text-[var(--text)]"><Placeholders text={t.body} /></p>

    ) : null;

    const fileName = t.whatsappFileName || url?.split('?')[0].split('/').pop() || 'Document';

    return (

        <div className="space-y-2">

            {kind === 'image' && (

                <Bubble>

                    <img src={url} alt="" className="w-72 max-h-72 object-cover rounded-xl mb-1" />

                    {body}

                </Bubble>

            )}

            {kind === 'video' && (

                <Bubble>

                    <video src={url} controls preload="metadata" className="w-72 h-44 rounded-xl mb-1 bg-black object-contain" />

                    {body}

                </Bubble>

            )}

            {kind === 'document' && (

                <Bubble>

                    <a href={url} target="_blank" rel="noreferrer" className="mb-1 flex w-64 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2 transition-colors hover:bg-[var(--surface-3)]">

                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]"><I.Doc /></span>

                        <span className="min-w-0 flex-1">

                            <span className="block truncate text-[12px] font-medium text-[var(--text)]">{fileName}</span>

                            <span className="block text-[10px] font-semibold text-[var(--primary)]">Open file</span>

                        </span>

                    </a>

                    {body}

                </Bubble>

            )}

            {kind === 'poll' && poll && (

                <Bubble>

                    <div className="w-64">

                        <p className="mb-1.5 break-words text-[13px] font-semibold text-[var(--text)]">📊 {poll.name}</p>

                        <div className="space-y-1">

                            {(poll.options || []).map((o: string, i: number) => (

                                <div key={i} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1.5">

                                    <span className="size-3.5 shrink-0 rounded-full border-2 border-[var(--border-strong)]" />

                                    <span className="truncate text-[12px] text-[var(--text-soft)]">{o}</span>

                                </div>

                            ))}

                        </div>

                        <p className="mt-1.5 text-[10.5px] text-[var(--muted)]">

                            {(poll.selectableCount || 1) > 1 ? 'Multiple answers allowed' : 'Select one'}

                        </p>

                    </div>

                </Bubble>

            )}

            {kind === 'location' && loc && (

                <>

                    <Bubble>

                        <div className="w-64">

                            <iframe

                                src={`https://www.google.com/maps?q=${loc.lat},${loc.lng}&z=15&output=embed`}

                                loading="lazy"

                                className="w-full h-32 rounded-xl border-0 pointer-events-none"

                            />

                            {(loc.name || loc.address) && (

                                <span className="flex items-center gap-1.5 pt-1 text-[12px] font-medium text-[var(--text)]">

                                    <I.Pin className="size-3.5 shrink-0 text-[var(--primary)]" />

                                    <span className="truncate">{loc.name || loc.address}</span>

                                </span>

                            )}

                        </div>

                    </Bubble>

                    {body && <Bubble>{body}</Bubble>}

                </>

            )}

            {kind === 'text' && (

                <Bubble>

                    {link && (

                        <a href={link.sourceUrl} target="_blank" rel="noreferrer" className="mb-1 block w-64 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">

                            {link.thumbnailUrl && <img src={link.thumbnailUrl} alt="" className="w-full h-32 object-cover" />}

                            <span className="block px-2 py-1.5">

                                <span className="block truncate text-[12px] font-semibold text-[var(--text)]">{link.title || link.sourceUrl}</span>

                                {link.body && <span className="line-clamp-2 block text-[11px] text-[var(--muted)]">{link.body}</span>}

                                <span className="block truncate text-[10px] text-[var(--primary)]">{link.sourceUrl}</span>

                            </span>

                        </a>

                    )}

                    {body || <p className="italic text-[var(--muted)]">Empty message</p>}

                </Bubble>

            )}

            {kind === 'poll' && t.body && (

                <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[11px] text-[var(--text-soft)]">

                    Polls are sent on their own. The template text above the poll is not sent.

                </p>

            )}

        </div>

    );

};

/* ───────── picker ───────── */

export default function WhatsAppTemplatePicker({

    isOpen, onClose, targetIds, onSent,

}: {

    isOpen: boolean;

    onClose: () => void;

    targetIds: string[];

    onSent: (notice?: string) => void; // parent clears the selection and closes the picker

}) {

    const [templates, setTemplates] = useState<Tpl[]>([]);

    const [loading, setLoading] = useState(false);

    const [loadError, setLoadError] = useState('');

    const [reloadKey, setReloadKey] = useState(0);

    const [search, setSearch] = useState('');

    const [debounced, setDebounced] = useState('');

    const [kindFilter, setKindFilter] = useState<'all' | Kind>('all');

    const [category, setCategory] = useState('all');

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [sending, setSending] = useState(false);

    const [error, setError] = useState('');

    // reset when closed

    useEffect(() => {

        if (isOpen) return;

        setSearch(''); setDebounced(''); setKindFilter('all'); setCategory('all');

        setSelectedId(null); setError(''); setSending(false);

    }, [isOpen]);

    // debounce the search box

    useEffect(() => {

        const h = setTimeout(() => setDebounced(search.trim()), 350);

        return () => clearTimeout(h);

    }, [search]);

    // load WhatsApp templates (search runs on the server, other filters run here)

    useEffect(() => {

        if (!isOpen) return;

        let cancelled = false;

        (async () => {

            setLoading(true); setLoadError('');

            const params = new URLSearchParams({ type: 'whatsapp', page: '1', limit: '100' });

            if (debounced) params.set('search', debounced);

            const res = await getFilteredWhatsapp(params.toString());

            if (cancelled) return;

            if (!res?.success) {

                setTemplates([]);

                setLoadError('Could not load templates.');

            } else {

                setTemplates((res.data || []).filter((t: Tpl) => t.status !== 'Inactive'));

            }

            setLoading(false);

        })();

        return () => { cancelled = true; };

    }, [isOpen, debounced, reloadKey]);

    const counts = useMemo(() => {

        const c: Partial<Record<Kind, number>> = {};

        templates.forEach((t) => { const k = kindOf(t); c[k] = (c[k] || 0) + 1; });

        return c;

    }, [templates]);

    const categories = useMemo(

        () => [...new Set(templates.map((t) => (t.category || '').trim()).filter(Boolean))],

        [templates]

    );

    const visible = useMemo(

        () => templates.filter((t) =>

            (kindFilter === 'all' || kindOf(t) === kindFilter) &&

            (category === 'all' || (t.category || '').trim() === category)

        ),

        [templates, kindFilter, category]

    );

    const selected = templates.find((t) => t._id === selectedId) || null;

    const n = targetIds.length;

    const handleSend = async () => {

        if (!selected || sending || !n) return;

        setSending(true); setError('');

        try {

            const res = await whatsappAllCustomer({ templateId: selected._id, customerIds: targetIds, sendToAll: false });

            if (!res) { setError('Could not reach the server. Please try again.'); return; }

            if (!res.success) { setError(res.message || 'Failed to send. Please try again.'); return; }

            const sent = res.sent ?? 0;

            if (sent < n) {

                const firstErr = res.results?.find((r: any) => r.status === 'failed')?.error;

                onSent(`Template sent to ${sent} of ${n} customers.${firstErr ? ` ${firstErr}` : ''}`);

            } else {

                onSent();

            }

        } finally {

            setSending(false);

        }

    };

    if (!isOpen) return null;

    return (

        <div

            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"

            onClick={(e) => { e.stopPropagation(); if (!sending) onClose(); }}

        >

            <div className="wa-panel flex h-[min(86vh,820px)] min-h-[540px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl" onClick={(e) => e.stopPropagation()}>

                {/* header */}

                <div className="flex shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4">

                    <div className="min-w-0 flex-1">

                        <p className="text-sm font-bold tracking-tight text-[var(--text)]">Send a template</p>

                        <p className="mt-0.5 text-[11px] text-[var(--muted)]">To {n} customer{n === 1 ? '' : 's'}</p>

                    </div>

                    <button onClick={onClose} disabled={sending} aria-label="Close" className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-[var(--primary)] disabled:opacity-40"><I.Close /></button>

                </div>

                <div className="flex min-h-0 flex-1 flex-col sm:flex-row">

                    {/* ── left: filters + list ── */}

                    <div className="flex max-h-[48%] w-full shrink-0 flex-col border-b border-[var(--border)] sm:max-h-none sm:w-[320px] sm:border-b-0 sm:border-r">

                        <div className="space-y-3 border-b border-[var(--border)] bg-[var(--surface)] p-3.5">

                            <div className="relative">

                                <I.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

                                <input

                                    value={search}

                                    onChange={(e) => setSearch(e.target.value)}

                                    placeholder="Search templates…"

                                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2.5 pl-9 pr-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"

                                />

                            </div>

                            <div className="flex flex-wrap gap-1.5">

                                {(['all', ...(Object.keys(KINDS) as Kind[]).filter((k) => counts[k])] as ('all' | Kind)[]).map((k) => (

                                    <button

                                        key={k}

                                        onClick={() => setKindFilter(k)}

                                        className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${kindFilter === k ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-soft)] hover:bg-[var(--surface-3)]'}`}

                                    >

                                        {k === 'all' ? `All ${templates.length}` : `${KINDS[k].label} ${counts[k]}`}

                                    </button>

                                ))}

                            </div>

                            {categories.length > 0 && (

                                <select

                                    value={category}

                                    onChange={(e) => setCategory(e.target.value)}

                                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-xs text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"

                                >

                                    <option value="all">All categories</option>

                                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}

                                </select>

                            )}

                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--surface)]">

                            {loading ? (

                                <p className="flex items-center gap-2 p-4 text-xs text-[var(--muted)]"><I.Spinner /> Loading templates…</p>

                            ) : loadError ? (

                                <div className="p-4 text-xs text-[var(--danger)]">

                                    {loadError}{' '}

                                    <button onClick={() => setReloadKey((k) => k + 1)} className="font-semibold text-[var(--primary)] underline underline-offset-2">Retry</button>

                                </div>

                            ) : visible.length === 0 ? (

                                <p className="p-4 text-xs text-[var(--muted)]">No templates match.</p>

                            ) : (

                                visible.map((t) => {

                                    const kind = kindOf(t);

                                    const meta = KINDS[kind];

                                    const snippet = kind === 'poll' ? pollOf(t)?.name : kind === 'location' ? (locOf(t)?.name || t.body) : t.body;

                                    return (

                                        <button

                                            key={t._id}

                                            onClick={() => { setSelectedId(t._id); setError(''); }}

                                            className={`flex w-full items-start gap-3 border-b border-[var(--border)] px-3.5 py-3 text-left transition-colors hover:bg-[var(--surface-2)] ${selectedId === t._id ? 'bg-[var(--primary-soft)] ring-1 ring-inset ring-[var(--primary)]/30' : ''}`}

                                        >

                                            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] ${meta.tone}`} ><meta.icon /></span>

                                            <span className="min-w-0 flex-1">

                                                <span className="flex items-center gap-2">

                                                    <span className="truncate text-[13px] font-semibold text-[var(--text)]">{t.name}</span>

                                                    {t.category && <span className="shrink-0 truncate rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--muted)]">{t.category}</span>}

                                                </span>

                                                <span className="line-clamp-2 block break-words text-[11.5px] text-[var(--muted)]">{snippet || meta.label}</span>

                                            </span>

                                        </button>

                                    );

                                })

                            )}

                        </div>

                    </div>

                    {/* ── right: preview ── */}

                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">

                        <div

                            className="min-h-0 flex-1 overflow-y-auto bg-[var(--surface-2)] p-4 sm:p-6"

                            style={{ backgroundImage: "radial-gradient(circle, color-mix(in srgb, var(--muted) 16%, transparent) 1px, transparent 1px)", backgroundSize: "18px 18px" }}

                        >

                            {selected ? (

                                <Preview t={selected} />

                            ) : (

                                <p className="flex h-full items-center justify-center text-center text-sm text-[var(--muted)]">Select a template to preview it</p>

                            )}

                        </div>

                        {selected && (

                            <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--muted)]">

                                <p className="truncate font-semibold text-[var(--text)]">{selected.name}</p>

                                {selected.description && <p className="truncate">{selected.description}</p>}

                                <p className="mt-1 leading-5">

                                    <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-medium text-[var(--success)] ring-1 ring-emerald-500/20">Green</span> placeholders are filled in per customer.{' '}

                                    <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 font-medium text-[var(--text-soft)] ring-1 ring-amber-500/20">Amber</span> ones are sent exactly as written.

                                </p>

                            </div>

                        )}

                    </div>

                </div>

                {/* footer */}

                <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] p-3.5">

                    <button

                        onClick={handleSend}

                        disabled={!selected || sending || !n}

                        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"

                    >

                        {sending ? <><I.Spinner /> Sending…</> : <><I.Send /> Send to {n} customer{n === 1 ? '' : 's'}</>}

                    </button>

                    {sending && n > 1 && (

                        <p className="mt-1.5 text-center text-[11px] text-[var(--muted)]">Sending one by one with a short delay. Messages appear in each chat as they go out.</p>

                    )}

                    {error && <p className="mt-1.5 text-center text-[11px] text-[var(--danger)]">{error}</p>}

                </div>

            </div>

        </div>

    );

}
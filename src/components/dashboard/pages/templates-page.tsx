import { ArrowRight, FileText, Plus, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/dashboard/page-header";
import type { ToastFn } from "@/components/layout/topbar";
import { CHANNEL_ACTION_ICON } from "@/data/channel-icons";

export function TemplatesPage({ onUse, onToast }: { onUse: (name: string, channel: string) => void; onToast: ToastFn }) {
  const templates = [
    { title: "Welcome new customers", channel: "WhatsApp", purpose: "Onboarding", copy: "A friendly welcome with the next step to get started." },
    { title: "Monthly product digest", channel: "Email", purpose: "Newsletter", copy: "Share releases, helpful tips, and customer stories." },
    { title: "Appointment reminder", channel: "SMS", purpose: "Reminder", copy: "A concise reminder with time and an action link." },
    { title: "Order confirmation", channel: "RCS", purpose: "Transactional", copy: "Confirm the purchase and surface delivery actions." },
    { title: "Feedback follow-up", channel: "WhatsApp", purpose: "Retention", copy: "Ask for feedback and invite customers to reply." },
    { title: "Re-engagement note", channel: "Email", purpose: "Retention", copy: "Reconnect with inactive customers in a helpful way." },
  ];
  return <><PageHeader eyebrow="Content library" title="Message templates" subtitle="Start from reusable, channel-aware examples and personalize them for your audience." actions={<button className="button button-primary" onClick={() => onUse("New message template", "WhatsApp")}><Plus size={14} /> New template</button>} /><div className="feature-grid">{templates.map((template) => { const Icon = CHANNEL_ACTION_ICON[template.channel] ?? FileText; return <article className="section-panel feature-card" key={template.title}><div className="channel-symbol"><Icon size={19} /></div><div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}><span className="status-pill">{template.channel}</span><span className="status-pill warning">{template.purpose}</span></div><h3>{template.title}</h3><p>{template.copy}</p><div style={{ display: "flex", gap: 7 }}><button className="button button-primary button-sm" style={{ flex: 1 }} onClick={() => onUse(template.title, template.channel)}>Use template <ArrowRight size={12} /></button><button className="icon-button bordered" aria-label={`Preview ${template.title}`} onClick={() => onToast(template.title, `Preview: ${template.copy}`)}><ExternalLink size={14} /></button></div></article>; })}</div></>;
}

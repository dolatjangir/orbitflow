import { Activity, CheckCircle2, ChevronRight, FileText, MessageCircle, Plus, Send, Plug } from "lucide-react";
import { Smartphone, Layers3, Mail, Mic } from "lucide-react";
import { PageHeader } from "@/components/ui/dashboard/page-header";
import { MetricCard } from "@/components/ui/dashboard/metric-card";
import type { ToastFn } from "@/components/layout/topbar";



const CHANNELS = [
  { id: "whatsapp", name: "WhatsApp", description: "Two-way customer messaging, templates, and service conversations.", icon: MessageCircle },
  { id: "sms", name: "SMS", description: "Reach customers with concise, time-sensitive messages.", icon: Smartphone },
  { id: "rcs", name: "RCS", description: "Branded messages with rich cards, suggested actions, and media.", icon: Layers3 },
  { id: "email", name: "Email", description: "Lifecycle messaging, announcements, and customer newsletters.", icon: Mail },
  { id: "voice", name: "AI Voice", description: "Voice experiences with smart routing and human handoff.", icon: Mic },
];

export function ChannelPage({ section, onConnect, onCampaign }: { section: string; onConnect: (name: string) => void; onCampaign: () => void }) {
  const current = CHANNELS.find((channel) => channel.id === section) ?? CHANNELS[0];
  const Icon = current.icon;
  return <>
    <PageHeader eyebrow={current.name + " channel"} title={current.name + " workspace"} subtitle={current.description} actions={<><button className="button button-outline" onClick={() => onConnect(current.name)}><Plug size={14} /> {"Connect " + current.name}</button><button className="button button-primary" onClick={onCampaign}><Plus size={14} /> New campaign</button></>} />
    <div className="section-panel panel-padding" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <div className="panel-icon" style={{ width: 56, height: 56, borderRadius: 17 }}><Icon size={25} /></div>
      <div style={{ flex: 1, minWidth: 220 }}><h2 className="panel-title" style={{ fontSize: 17 }}>{current.name} overview</h2><p className="panel-description">This starter interface is ready for a provider integration. Sending and receiving real messages is not enabled until credentials and server-side APIs are connected.</p></div>
      <span className="status-pill warning">Demo connection</span>
    </div>
    <div className="stats-grid"><MetricCard label="Messages sent" value={section === "email" ? "8,420" : "2,841"} detail="Across recent demo campaigns" icon={Send} /><MetricCard label="Delivery rate" value="98.2%" detail="Based on sample message events" icon={CheckCircle2} /><MetricCard label="Replies received" value="642" detail="Inbound conversations this month" icon={MessageCircle} /><MetricCard label="Active templates" value="12" detail="Approved or ready for review" icon={FileText} accent /></div>
    <div className="dashboard-grid">
      <div className="section-panel panel-padding"><div className="panel-heading"><div><h2 className="panel-title">Channel health</h2><p className="panel-description">Sample operational signals</p></div><Activity size={16} color="var(--primary)" /></div>{[{ label: "Provider connection", value: "Needs setup", tone: "warning" }, { label: "Message templates", value: "Ready to configure", tone: "success" }, { label: "Inbound routing", value: "Human handoff available", tone: "success" }, { label: "Delivery webhooks", value: "Not connected", tone: "warning" }].map((row) => <div className="activity-row" key={row.label}><div className="activity-main"><p className="activity-title">{row.label}</p></div><span className={`status-pill ${row.tone}`}>{row.value}</span></div>)}</div>
      <div className="section-panel panel-padding"><div className="panel-heading"><div><h2 className="panel-title">Recommended next steps</h2><p className="panel-description">Get your {current.name} channel ready</p></div></div>{[{ title: "Connect your provider", text: "Add credentials and verify the webhook." }, { title: "Review message templates", text: "Create compliant, reusable content." }, { title: "Send a test campaign", text: "Validate delivery before scaling." }].map((step, index) => <div className="activity-row" key={step.title}><div className="step-check">{index + 1}</div><div className="activity-main"><p className="activity-title">{step.title}</p><p className="activity-meta">{step.text}</p></div><button className="icon-button" aria-label={step.title} onClick={() => index === 0 ? onConnect(current.name) : onCampaign()}><ChevronRight size={15} /></button></div>)}</div>
    </div>
  </>;
}

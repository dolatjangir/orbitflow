"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, ArrowRight, ArrowUpRight, Bot, BriefcaseBusiness, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleHelp, Cloud, ContactRound, CreditCard, Download,
  FileText, Filter, Globe2, Headphones, LayoutDashboard, Mail, MessageCircle, MessageSquare,
  Mic, MoreHorizontal, Plus, Search, Send, Settings2, ShieldCheck, Sparkles, Smartphone,
  Timer, Users, Wallet, X, Zap, Plug, BookOpen, Layers3, CalendarClock, ChartNoAxesCombined,
  LockKeyhole, RefreshCw, ExternalLink, CircleDollarSign, Workflow, AudioLines,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar, type ToastFn } from "@/components/dashboard/topbar";
import { OverviewPage } from "@/components/dashboard/overview-page";
import { Modal } from "@/components/ui/modal";
import { ToastRegion, type Toast } from "@/components/ui/toast-region";
import { formatCurrency, initialContacts, initialDeals, onboardingSteps, routeMeta, type Contact, type Deal } from "@/lib/data";

const CHANNELS = [
  { id: "whatsapp", name: "WhatsApp", description: "Two-way customer messaging, templates, and service conversations.", icon: MessageCircle, feature: "Rich messaging", color: "green" },
  { id: "sms", name: "SMS", description: "Reach customers with concise, time-sensitive messages.", icon: Smartphone, feature: "Quick delivery", color: "blue" },
  { id: "rcs", name: "RCS", description: "Branded messages with rich cards, suggested actions, and media.", icon: Layers3, feature: "Interactive messages", color: "purple" },
  { id: "email", name: "Email", description: "Lifecycle messaging, announcements, and customer newsletters.", icon: Mail, feature: "Rich content", color: "amber" },
  { id: "voice", name: "AI Voice", description: "Voice experiences with smart routing and human handoff.", icon: Mic, feature: "AI-assisted calls", color: "pink" },
];

const CHANNEL_ACTION_ICON: Record<string, typeof MessageCircle> = {
  WhatsApp: MessageCircle, SMS: Smartphone, Email: Mail, RCS: Layers3, Voice: Mic,
};

type ModalName = "campaign" | "credits" | "tutorials" | "assistant" | "step" | "contact" | "deal" | "agent" | null;
type Props = { initialSection: string };

function getSection(raw: string) {
  if (raw === "support") return "help";
  return raw || "overview";
}

function csvCell(value: string | number) {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCSV(filename: string, rows: Array<Record<string, string | number>>) {
  if (!rows.length) return false;
  const headers = Object.keys(rows[0]);
  const content = [headers.map(csvCell).join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}

function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow: string; title: string; subtitle: string; actions?: ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow"><Sparkles size={12} /> {eyebrow}</div><h1 className="page-title">{title}</h1><p className="page-subtitle">{subtitle}</p></div>{actions ? <div className="page-actions">{actions}</div> : null}</div>;
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-state-icon"><Search size={20} /></div><h3>{title}</h3><p>{body}</p>{action}</div>;
}

function ContactsTable({ contacts, onEdit }: { contacts: Contact[]; onEdit: (contact: Contact) => void }) {
  return <div className="section-panel table-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>Contact</th><th>Company</th><th>Preferred channel</th><th>Status</th><th>Added on</th><th /></tr></thead><tbody>{contacts.map((contact) => <tr key={contact.id}><td><div className="table-name"><span className="person-avatar">{contact.name.split(" ").map((s) => s[0]).join("")}</span><span>{contact.name}<span className="table-subtext">{contact.email}</span></span></div></td><td>{contact.company}</td><td>{contact.channel}</td><td><span className={`status-pill ${contact.status === "Active" ? "success" : contact.status === "Engaged" ? "warning" : ""}`}>{contact.status}</span></td><td>{contact.added}</td><td><button className="icon-button" aria-label={`View ${contact.name}`} onClick={() => onEdit(contact)}><ChevronRight size={15} /></button></td></tr>)}</tbody></table></div>{contacts.length === 0 ? <EmptyState title="No contacts found" body="Try a different search or add a new contact." /> : null}<div className="table-footer"><span>Showing {contacts.length} contact{contacts.length === 1 ? "" : "s"}</span><span>Demo data · synced just now</span></div></div>;
}

function DealsTable({ deals, onEdit }: { deals: Deal[]; onEdit: (deal: Deal) => void }) {
  const tone = (stage: Deal["stage"]) => stage === "Won" ? "success" : stage === "Negotiation" || stage === "Proposal" ? "warning" : "";
  return <div className="section-panel table-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>Opportunity</th><th>Value</th><th>Stage</th><th>Owner</th><th>Expected close</th><th /></tr></thead><tbody>{deals.map((deal) => <tr key={deal.id}><td><div className="table-name"><span className="person-avatar"><BriefcaseBusiness size={14} /></span><span>{deal.name}<span className="table-subtext">{deal.company} · {deal.id}</span></span></div></td><td style={{ fontWeight: 800, color: "var(--text)" }}>{formatCurrency(deal.value)}</td><td><span className={`status-pill ${tone(deal.stage)}`}>{deal.stage}</span></td><td>{deal.owner}</td><td>{deal.closeDate}</td><td><button className="icon-button" aria-label={`View ${deal.name}`} onClick={() => onEdit(deal)}><ChevronRight size={15} /></button></td></tr>)}</tbody></table></div>{deals.length === 0 ? <EmptyState title="No deals match" body="Try changing the search or create a new opportunity." /> : null}<div className="table-footer"><span>{deals.length} opportunities</span><span>Pipeline value: {formatCurrency(deals.reduce((sum, deal) => sum + deal.value, 0))}</span></div></div>;
}

function MetricCard({ label, value, detail, icon: Icon, accent = false }: { label: string; value: string; detail: string; icon: typeof Activity; accent?: boolean }) {
  return <div className="section-panel stat-card"><div className="stat-top"><span className="stat-icon"><Icon size={17} /></span><span className={`status-pill ${accent ? "warning" : "success"}`}>{accent ? "In progress" : "Healthy"}</span></div><div className="stat-value-row"><span className="stat-value">{value}</span><ArrowUpRight size={15} color="var(--primary)" /></div><div className="stat-label" style={{ marginTop: 8 }}>{label}</div><div className="stat-foot">{detail}</div></div>;
}

function ChannelPage({ section, onConnect, onCampaign }: { section: string; onConnect: (name: string) => void; onCampaign: () => void }) {
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

function CampaignsPage({ campaigns, onCreate, onExport, onToast }: { campaigns: Array<{ name: string; channel: string; audience: string; status: string; date: string }>; onCreate: () => void; onExport: () => void; onToast: ToastFn }) {
  return <><PageHeader eyebrow="Campaign studio" title="Campaigns" subtitle="Bring every customer touchpoint together. Draft, schedule, and review communication campaigns." actions={<><button className="button button-outline" onClick={onExport}><Download size={14} /> Export</button><button className="button button-primary" onClick={onCreate}><Plus size={14} /> New campaign</button></>} />
    <div className="stats-grid"><MetricCard label="Total campaigns" value={String(campaigns.length + 12)} detail="Created across the workspace" icon={Send} /><MetricCard label="Active campaigns" value="3" detail="Running or scheduled" icon={Activity} /><MetricCard label="Average delivery" value="98.2%" detail="Across connected channels" icon={CheckCircle2} /><MetricCard label="Scheduled next" value="4" detail="Upcoming in the next 7 days" icon={CalendarClock} accent /></div>
    <div className="section-panel table-panel"><div className="table-toolbar"><div><h2 className="panel-title">All campaigns</h2><p className="panel-description">Sample records and campaigns created in this session</p></div><div className="table-toolbar-right"><button className="button button-secondary button-sm" onClick={() => onToast("Filters", "Campaign status and channel filters can be connected to your API as the campaign table grows.")}><Filter size={13} /> Filters</button></div></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Campaign</th><th>Channel</th><th>Audience</th><th>Status</th><th>Updated</th><th /></tr></thead><tbody>{[{ name: "Autumn product update", channel: "WhatsApp", audience: "1,248 contacts", status: "Completed", date: "Oct 23, 2026" }, { name: "October newsletter", channel: "Email", audience: "4,820 contacts", status: "In review", date: "Oct 22, 2026" }, { name: "Order follow-up", channel: "SMS", audience: "326 contacts", status: "Completed", date: "Oct 21, 2026" }, ...campaigns].map((campaign, i) => <tr key={`${campaign.name}-${i}`}><td><div className="table-name"><span className="person-avatar"><Send size={13} /></span><span>{campaign.name}<span className="table-subtext">CAM-{String(127 + i).padStart(4, "0")}</span></span></div></td><td>{campaign.channel}</td><td>{campaign.audience}</td><td><span className={`status-pill ${campaign.status === "Completed" ? "success" : campaign.status === "Draft" ? "" : "warning"}`}>{campaign.status}</span></td><td>{campaign.date}</td><td><button className="icon-button" aria-label={`Open ${campaign.name}`} onClick={() => onToast(campaign.name, "Campaign detail view is ready to connect to your campaign API.")}><ChevronRight size={15} /></button></td></tr>)}</tbody></table></div>
    </div>
  </>;
}

function AgentsPage({ onCreate, onAssistant, onToast }: { onCreate: () => void; onAssistant: () => void; onToast: ToastFn }) {
  const agents = [
    { name: "Customer support agent", type: "Knowledge assistant", detail: "Answers common questions and routes complex issues to your team.", status: "Active", icon: Headphones },
    { name: "Lead qualification agent", type: "Sales assistant", detail: "Collects lead context and suggests the next best action.", status: "Draft", icon: Users },
    { name: "Order status assistant", type: "Workflow assistant", detail: "Guides customers through common order and delivery questions.", status: "Draft", icon: Workflow },
  ];
  return <><PageHeader eyebrow="AI automation" title="Chatbot & AI agents" subtitle="Create useful assistants with a defined role, trusted knowledge, and a clear human handoff." actions={<><button className="button button-outline" onClick={onAssistant}><Sparkles size={14} /> Try Orbit AI</button><button className="button button-primary" onClick={onCreate}><Plus size={14} /> Create agent</button></>} />
    <div className="section-panel panel-padding" style={{ marginBottom: 16, background: "radial-gradient(ellipse at 86% 0%, var(--primary-soft), transparent 55%), var(--surface)" }}><div className="panel-heading-main"><div className="panel-icon" style={{ width: 43, height: 43 }}><Bot size={21} /></div><div><h2 className="panel-title">AI agents that work alongside your team</h2><p className="panel-description">Start with one repetitive task. Add approved knowledge, test sample questions, and define when conversations should be handed to a person.</p></div></div></div>
    <div className="feature-grid">{agents.map((agent) => { const Icon = agent.icon; return <article className="section-panel feature-card" key={agent.name}><div className="channel-symbol"><Icon size={19} /></div><div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginTop: 11 }}><span className="status-pill">{agent.type}</span><span className={`status-pill ${agent.status === "Active" ? "success" : "warning"}`}>{agent.status}</span></div><h3>{agent.name}</h3><p>{agent.detail}</p><button className="button button-secondary button-sm" style={{ width: "100%" }} onClick={() => onToast(agent.name, "Agent configuration is represented as a UI demo. Connect model and knowledge APIs to activate it.")}>Configure <ArrowRight size={13} /></button></article>; })}</div>
  </>;
}

function AnalyticsPage({ onExport }: { onExport: () => void }) {
  return <><PageHeader eyebrow="Performance" title="Analytics & insights" subtitle="Follow delivery, engagement, and conversion signals across your customer channels." actions={<button className="button button-primary" onClick={onExport}><Download size={14} /> Export report</button>} />
    <div className="stats-grid"><MetricCard label="Messages sent" value="48,296" detail="+8.4% compared with prior period" icon={Send} /><MetricCard label="Delivered" value="47,427" detail="98.2% successful delivery" icon={CheckCircle2} /><MetricCard label="Engaged audience" value="15,270" detail="31.6% cross-channel engagement" icon={Users} /><MetricCard label="Conversions attributed" value="1,284" detail="7.9% campaign conversion" icon={ChartNoAxesCombined} accent /></div>
    <div className="dashboard-grid"><div className="section-panel panel-padding"><div className="panel-heading"><div><h2 className="panel-title">Performance highlights</h2><p className="panel-description">Illustrative monthly performance</p></div><span className="status-pill success">+18.6% overall</span></div><div className="chart-wrap"><svg className="chart-svg" viewBox="0 0 420 174" role="img" aria-label="Performance trend"><line className="chart-gridline" x1="0" x2="410" y1="30" y2="30"/><line className="chart-gridline" x1="0" x2="410" y1="75" y2="75"/><line className="chart-gridline" x1="0" x2="410" y1="120" y2="120"/><polyline points="0,130 40,117 80,122 120,87 160,95 200,65 240,81 280,45 320,49 360,30 410,12" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><polyline points="0,143 40,134 80,138 120,119 160,124 200,109 240,114 280,91 320,96 360,78 410,69" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 4"/></svg></div><div className="chart-legend"><span><i className="legend-dot"/>Engagement</span><span><i className="legend-dot amber"/>Conversions</span></div></div><div className="section-panel panel-padding"><h2 className="panel-title">Channel contribution</h2><p className="panel-description">Share of delivered messages</p>{[{ name: "WhatsApp", value: 58, color: "var(--primary)" }, { name: "Email", value: 24, color: "var(--accent)" }, { name: "SMS", value: 12, color: "#5e9de8" }, { name: "RCS & Voice", value: 6, color: "#b48ce6" }].map((item) => <div key={item.name} style={{ marginTop: 20 }}><div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-soft)", fontSize: 11, marginBottom: 8 }}><span>{item.name}</span><strong>{item.value}%</strong></div><div className="progress-track" style={{ margin: 0, height: 7 }}><div className="progress-fill" style={{ width: `${item.value}%`, background: item.color }} /></div></div>)}</div></div>
  </>;
}

function SettingsPage({ onToast }: { onToast: ToastFn }) {
  return <><PageHeader eyebrow="Preferences" title="Workspace settings" subtitle="Fine-tune your workspace experience. Account, billing and security controls can be wired to your backend." />
    <div className="dashboard-grid"><div className="section-panel panel-padding"><div className="panel-heading"><div><h2 className="panel-title">Workspace profile</h2><p className="panel-description">Basic settings for this demo workspace</p></div><Settings2 size={17} color="var(--primary)" /></div><div className="form-stack"><div className="form-field"><label className="field-label">Workspace name</label><input className="input" defaultValue="OrbitFlow Workspace" /></div><div className="form-field"><label className="field-label">Workspace URL</label><input className="input" defaultValue="orbitflow.demo" /></div><div className="form-field"><label className="field-label">Default timezone</label><select className="select" defaultValue="Asia/Kolkata"><option value="Asia/Kolkata">India Standard Time (UTC+05:30)</option><option value="UTC">UTC</option><option value="America/New_York">Eastern Time</option><option value="Europe/London">London</option></select></div><button className="button button-primary" onClick={() => onToast("Settings saved", "Demo preferences are shown here. Add your persistence API to save these settings across accounts.")}>Save workspace settings</button></div></div>
      <div className="section-panel panel-padding"><div className="panel-heading"><div><h2 className="panel-title">Security & connected services</h2><p className="panel-description">Integration status and account safeguards</p></div><ShieldCheck size={17} color="var(--primary)" /></div>{[{ icon: LockKeyhole, title: "Two-factor authentication", detail: "Managed by your identity provider", state: "Not configured" }, { icon: Plug, title: "Messaging provider", detail: "No provider credentials connected", state: "Needs setup" }, { icon: Cloud, title: "Data backup", detail: "No live database connected in starter", state: "Demo mode" }].map((row) => { const Icon = row.icon; return <div className="activity-row" key={row.title}><div className="activity-dot"><Icon size={15} /></div><div className="activity-main"><p className="activity-title">{row.title}</p><p className="activity-meta">{row.detail}</p></div><span className="status-pill warning">{row.state}</span></div>; })}<button className="button button-secondary" style={{ marginTop: 15, width: "100%" }} onClick={() => onToast("Security settings", "Authentication controls should be implemented server-side before production deployment.")}>Review security <ArrowRight size={13} /></button></div></div>
  </>;
}

function TemplatesPage({ onUse, onToast }: { onUse: (name: string, channel: string) => void; onToast: ToastFn }) {
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

function IntegrationsPage({ onToast }: { onToast: ToastFn }) {
  const integrations = [
    { name: "Google Sheets", detail: "Sync contact lists and campaign outcomes.", icon: FileText, state: "Available" },
    { name: "HubSpot CRM", detail: "Keep records, lifecycle stages, and deals aligned.", icon: ContactRound, state: "Available" },
    { name: "Webhook API", detail: "Send event updates into your existing stack.", icon: Workflow, state: "Developer setup" },
    { name: "Google Gemini", detail: "Power AI-assisted responses and research flows.", icon: Sparkles, state: "API key required" },
    { name: "Email provider", detail: "Deliver email campaigns through your chosen provider.", icon: Mail, state: "API key required" },
    { name: "Voice provider", detail: "Connect phone routing and voice agent calls.", icon: AudioLines, state: "API key required" },
  ];
  return <><PageHeader eyebrow="Connected workspace" title="Integrations" subtitle="Connect the tools that help your team automate workflows and keep customer data in sync." /><div className="feature-grid">{integrations.map((integration) => { const Icon = integration.icon; return <article className="section-panel feature-card" key={integration.name}><div className="channel-symbol"><Icon size={19} /></div><h3>{integration.name}</h3><p>{integration.detail}</p><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}><span className={`status-pill ${integration.state === "Available" ? "success" : "warning"}`}>{integration.state}</span><button className="button button-secondary button-sm" onClick={() => onToast(integration.name, "The UI control is ready. Add OAuth or provider credentials and a server-side connection route to complete setup.")}>Configure</button></div></article>; })}</div></>;
}

function HelpPage({ onTutorials, onToast }: { onTutorials: () => void; onToast: ToastFn }) {
  const topics = [
    { title: "Getting started", detail: "Learn the key steps to set up your workspace.", icon: BookOpen },
    { title: "Campaign delivery", detail: "Understand channel setup, templates, and delivery states.", icon: Send },
    { title: "AI agent best practices", detail: "Keep agent scope clear and make human escalation reliable.", icon: Bot },
    { title: "Billing & credits", detail: "Review demo wallet controls and production billing requirements.", icon: CircleDollarSign },
  ];
  return <><PageHeader eyebrow="Support center" title="How can we help?" subtitle="Browse starter guides, explore the product, or contact your workspace support team." actions={<button className="button button-primary" onClick={() => onToast("Support request", "Support form submitted in demo mode. Add a support API to route this to your team.")}>Contact support <ArrowRight size={14} /></button>} /><div className="section-panel panel-padding" style={{ marginBottom: 16, background: "radial-gradient(ellipse at 85% 0%, var(--primary-soft), transparent 55%), var(--surface)" }}><div className="panel-heading-main"><div className="panel-icon" style={{ width: 46, height: 46 }}><Headphones size={21} /></div><div style={{ flex: 1 }}><h2 className="panel-title">Explore the product walkthrough</h2><p className="panel-description">Learn how to set up channels, bring in contacts, and create a first campaign.</p></div><button className="button button-primary" onClick={onTutorials}><BookOpen size={14} /> View tutorials</button></div></div><div className="feature-grid">{topics.map((topic) => { const Icon = topic.icon; return <article className="section-panel feature-card" key={topic.title}><div className="channel-symbol"><Icon size={18} /></div><h3>{topic.title}</h3><p>{topic.detail}</p><button className="button button-ghost button-sm" onClick={() => onToast(topic.title, "Help article preview is available in the starter UI; add your knowledge base URL to connect it.")}>Read guide <ArrowRight size={12} /></button></article>; })}</div></>;
}

export function DashboardApp({ initialSection }: Props) {
  const section = getSection(initialSection);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [modal, setModal] = useState<ModalName>(null);
  const [walletBalance, setWalletBalance] = useState(381.63);
  const [creditsAmount, setCreditsAmount] = useState("500");
  const [searchValue, setSearchValue] = useState("");
  const [contactFilter, setContactFilter] = useState("All contacts");
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [campaigns, setCampaigns] = useState<Array<{ name: string; channel: string; audience: string; status: string; date: string }>>([]);
  const [campaignName, setCampaignName] = useState("");
  const [campaignChannel, setCampaignChannel] = useState("WhatsApp");
  const [campaignAudience, setCampaignAudience] = useState("All active contacts");
  const [campaignSchedule, setCampaignSchedule] = useState("Draft");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactChannel, setContactChannel] = useState("WhatsApp");
  const [dealName, setDealName] = useState("");
  const [dealCompany, setDealCompany] = useState("");
  const [dealValue, setDealValue] = useState("15000");
  const [agentName, setAgentName] = useState("");
  const [agentPurpose, setAgentPurpose] = useState("Customer support");
  const [selectedStep, setSelectedStep] = useState<string>("connect");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<Array<{ id: number; role: "assistant" | "user"; text: string }>>([{ id: 1, role: "assistant", text: "Hi Anushka! I’m Orbit AI, your workspace guide. Ask me about campaign ideas, contact segmentation, or setup steps. This demo uses local sample responses." }]);

  const notify = useCallback<ToastFn>((title, description) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, title, description }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const closeModal = useCallback(() => setModal(null), []);
  const openStep = useCallback((id: string) => { setSelectedStep(id); setModal("step"); }, []);

  const filteredContacts = useMemo(() => contacts.filter((contact) => {
    const term = searchValue.trim().toLowerCase();
    const matchesSearch = !term || [contact.name, contact.email, contact.company, contact.id].some((value) => value.toLowerCase().includes(term));
    const matchesFilter = contactFilter === "All contacts" || contact.status === contactFilter;
    return matchesSearch && matchesFilter;
  }), [contacts, searchValue, contactFilter]);
  const filteredDeals = useMemo(() => deals.filter((deal) => !searchValue.trim() || [deal.name, deal.company, deal.owner, deal.id].some((value) => value.toLowerCase().includes(searchValue.trim().toLowerCase()))), [deals, searchValue]);

  const exportData = useCallback(() => {
    if (section === "contacts") {
      const ok = downloadCSV("orbitflow-contacts.csv", filteredContacts.map(({ id, name, email, company, channel, status, added }) => ({ id, name, email, company, preferred_channel: channel, status, added } )));
      notify(ok ? "Contacts exported" : "Nothing to export", ok ? `${filteredContacts.length} contacts downloaded as CSV.` : "No matching contacts found.");
    } else if (section === "deals") {
      const ok = downloadCSV("orbitflow-deals.csv", filteredDeals.map(({ id, name, company, value, stage, owner, closeDate }) => ({ id, deal: name, company, value_inr: value, stage, owner, expected_close: closeDate })));
      notify(ok ? "Deals exported" : "Nothing to export", ok ? `${filteredDeals.length} deals downloaded as CSV.` : "No matching deals found.");
    } else {
      const ok = downloadCSV(`orbitflow-${section}-report.csv`, [
        { metric: "Total contacts", value: contacts.length }, { metric: "Messages delivered", value: 48296 },
        { metric: "Engagement rate", value: "31.6%" }, { metric: "Open opportunities (INR)", value: deals.reduce((sum, deal) => sum + deal.value, 0) },
      ]);
      notify(ok ? "Report exported" : "Nothing to export", "A CSV report was generated from the current demo data.");
    }
  }, [section, filteredContacts, filteredDeals, contacts.length, deals, notify]);

  const createCampaign = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!campaignName.trim()) return;
    setCampaigns((current) => [{ name: campaignName.trim(), channel: campaignChannel, audience: campaignAudience, status: campaignSchedule, date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) }, ...current]);
    notify("Campaign created", `${campaignName.trim()} was added as a ${campaignSchedule.toLowerCase()} campaign in this demo.`);
    setCampaignName(""); setCampaignAudience("All active contacts"); setCampaignSchedule("Draft"); setModal(null);
  };

  const addContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contactName.trim() || !contactEmail.trim()) return;
    const newContact: Contact = { id: `CT-${1050 + contacts.length}`, name: contactName.trim(), email: contactEmail.trim(), company: contactCompany.trim() || "Independent", channel: contactChannel, status: "Active", added: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) };
    setContacts((current) => [newContact, ...current]);
    setContactName(""); setContactEmail(""); setContactCompany(""); setContactChannel("WhatsApp"); setModal(null);
    notify("Contact added", `${newContact.name} is now in your demo contact book.`);
  };

  const addDeal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dealName.trim() || !dealValue || Number(dealValue) <= 0) return;
    const newDeal: Deal = { id: `DL-${2082 + deals.length}`, name: dealName.trim(), company: dealCompany.trim() || "New customer", value: Number(dealValue), stage: "New lead", owner: "Anushka Jangid", closeDate: "Nov 20, 2026" };
    setDeals((current) => [newDeal, ...current]);
    setDealName(""); setDealCompany(""); setDealValue("15000"); setModal(null);
    notify("Deal created", `${newDeal.name} was added with a value of ${formatCurrency(newDeal.value)}.`);
  };

  const addCredits = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(creditsAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) { notify("Check the amount", "Enter a value between ₹1 and ₹100,000."); return; }
    setWalletBalance((value) => value + amount);
    setModal(null);
    notify("Demo credits added", `${formatCurrency(amount)} was added to the local demo balance. No real payment was taken.`);
  };

  const createAgent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agentName.trim()) return;
    setModal(null);
    notify("Agent draft created", `${agentName.trim()} was added as a ${agentPurpose.toLowerCase()} draft. Connect an AI provider to activate it.`);
    setAgentName(""); setAgentPurpose("Customer support");
  };

  const sendAssistantMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = assistantInput.trim();
    if (!message) return;
    setAssistantMessages((current) => [...current, { id: Date.now(), role: "user", text: message }]);
    setAssistantInput("");
    window.setTimeout(() => {
      const answer = /campaign|message|broadcast/i.test(message)
        ? "A good starting point is to define one audience, choose the channel they prefer, and set a single clear CTA. Start with a small test segment, review delivery and response rates, then scale what works."
        : /contact|lead|segment/i.test(message)
          ? "Try segmenting contacts by recent activity, preferred channel, and lifecycle stage. Keep each segment large enough to be useful and exclude people who have opted out."
          : /setup|start|connect|integration/i.test(message)
            ? "Start with one channel and one repeatable workflow. Connect provider credentials server-side, verify delivery webhooks, test with internal contacts, and define a human handoff before enabling customers."
            : "I'd approach that by defining the goal, choosing the smallest useful workflow, and measuring the outcome. In this starter app, the AI replies are examples; connect your model API for real assistance.";
      setAssistantMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", text: answer }]);
    }, 420);
  };

  const openCampaign = (presetName = "", presetChannel = "WhatsApp") => { setCampaignName(presetName); setCampaignChannel(presetChannel); setModal("campaign"); };
  const openCredits = () => setModal("credits");
  const openAssistant = () => setModal("assistant");
  const openTutorials = () => setModal("tutorials");
  const connectChannel = (name: string) => notify(`${name} connection`, "Connection settings opened in demo mode. Add provider credentials and secure server-side API routes to connect a live account.");

  useEffect(() => {
    setMobileSidebarOpen(false);
    setSearchValue("");
    setContactFilter("All contacts");
  }, [section]);

  const meta = routeMeta[section] ?? routeMeta.overview;
  return (
    <div className="app-frame" style={{ display: "flex", alignItems: "stretch" }}>
      <Sidebar section={section} collapsed={sidebarCollapsed} mobileOpen={mobileSidebarOpen} onToggleCollapse={() => setSidebarCollapsed((value) => !value)} onCloseMobile={() => setMobileSidebarOpen(false)} />
      <main className="app-main">
        <Topbar section={section} walletBalance={walletBalance} onOpenAssistant={openAssistant} onOpenCredits={openCredits} onOpenCampaign={() => openCampaign()} onOpenTutorials={openTutorials} onToast={notify} onMobileMenu={() => setMobileSidebarOpen(true)} searchValue={searchValue} onSearchChange={setSearchValue} />
        <div className="page-wrap">
          {section === "overview" ? <OverviewPage onExport={exportData} onCampaign={() => openCampaign()} onStep={openStep} onAssistant={openAssistant} onToast={notify} /> : null}

          {section === "contacts" ? <>
            <PageHeader eyebrow={meta.eyebrow} title={meta.title} subtitle={meta.subtitle} actions={<><button className="button button-outline" onClick={exportData}><Download size={14} /> Export CSV</button><button className="button button-primary" onClick={() => setModal("contact")}><Plus size={14} /> Add contact</button></>} />
            <div className="stats-grid"><MetricCard label="Total contacts" value={String(contacts.length + 12833)} detail="Across connected channels" icon={Users} /><MetricCard label="Active contacts" value={String(contacts.filter((contact) => contact.status === "Active").length + 8200)} detail="Reachable and opted in" icon={CheckCircle2} /><MetricCard label="Engaged this month" value="2,480" detail="Opened or replied recently" icon={Activity} /><MetricCard label="New this week" value={String(contacts.length)} detail="Sample data in this workspace" icon={ContactRound} accent /></div>
            <div className="section-panel table-panel"><div className="table-toolbar"><div><h2 className="panel-title">All contacts</h2><p className="panel-description">Search and review people in your customer book</p></div><div className="table-toolbar-right"><div className="search-field"><Search size={14} /><input className="input" aria-label="Search contacts" placeholder="Name, email, company…" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} /></div><select className="select" aria-label="Filter contacts by status" style={{ width: 135 }} value={contactFilter} onChange={(event) => setContactFilter(event.target.value)}><option>All contacts</option><option>Active</option><option>Engaged</option><option>Inactive</option></select></div></div><ContactsTable contacts={filteredContacts} onEdit={(contact) => { setSelectedContact(contact); notify(contact.name, `${contact.company} · ${contact.email} · ${contact.channel}`); }} /></div>
          </> : null}

          {section === "deals" ? <>
            <PageHeader eyebrow={meta.eyebrow} title={meta.title} subtitle={meta.subtitle} actions={<><button className="button button-outline" onClick={exportData}><Download size={14} /> Export CSV</button><button className="button button-primary" onClick={() => setModal("deal")}><Plus size={14} /> New deal</button></>} />
            <div className="stats-grid"><MetricCard label="Pipeline value" value={formatCurrency(deals.reduce((sum, deal) => sum + deal.value, 0))} detail="All visible opportunities" icon={BriefcaseBusiness} /><MetricCard label="Open deals" value={String(deals.filter((deal) => deal.stage !== "Won").length)} detail="Need a next step" icon={Activity} /><MetricCard label="Won this period" value="₹15,000" detail="One demo opportunity" icon={CheckCircle2} /><MetricCard label="Win rate" value="28.4%" detail="Illustrative conversion rate" icon={ChartNoAxesCombined} accent /></div>
            <div className="section-panel table-panel"><div className="table-toolbar"><div><h2 className="panel-title">Opportunity pipeline</h2><p className="panel-description">Track next steps, ownership, and expected close dates</p></div><div className="table-toolbar-right"><div className="search-field"><Search size={14} /><input className="input" aria-label="Search deals" placeholder="Deal, company, owner…" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} /></div></div></div><DealsTable deals={filteredDeals} onEdit={(deal) => { setSelectedDeal(deal); notify(deal.name, `${deal.company} · ${formatCurrency(deal.value)} · ${deal.stage}`); }} /></div>
          </> : null}

          {section === "campaigns" ? <CampaignsPage campaigns={campaigns} onCreate={() => openCampaign()} onExport={exportData} onToast={notify} /> : null}
          {section === "analytics" ? <AnalyticsPage onExport={exportData} /> : null}
          {["whatsapp", "sms", "rcs", "email", "voice"].includes(section) ? <ChannelPage section={section} onConnect={connectChannel} onCampaign={() => openCampaign("", section === "voice" ? "WhatsApp" : section === "whatsapp" ? "WhatsApp" : section === "sms" ? "SMS" : section.toUpperCase() === "RCS" ? "RCS" : section.charAt(0).toUpperCase() + section.slice(1))} /> : null}
          {section === "chatbot" ? <AgentsPage onCreate={() => setModal("agent")} onAssistant={openAssistant} onToast={notify} /> : null}
          {section === "templates" ? <TemplatesPage onUse={(name, channel) => openCampaign(name, channel)} onToast={notify} /> : null}
          {section === "integrations" ? <IntegrationsPage onToast={notify} /> : null}
          {section === "settings" ? <SettingsPage onToast={notify} /> : null}
          {section === "help" ? <HelpPage onTutorials={openTutorials} onToast={notify} /> : null}

          {!(["overview", "contacts", "deals", "campaigns", "analytics", "whatsapp", "sms", "rcs", "email", "voice", "chatbot", "templates", "integrations", "settings", "help"].includes(section)) ? <><PageHeader eyebrow={meta.eyebrow} title={meta.title} subtitle={meta.subtitle} /><EmptyState title="This workspace view is not configured yet" body="Use the sidebar to explore the available demo pages." action={<Link href="/" className="button button-primary">Back to overview</Link>} /></> : null}
        </div>
      </main>

      <Modal open={modal === "campaign"} title="Create a campaign" subtitle="Set up a draft campaign. Sending is disabled until a provider is connected." onClose={closeModal} footer={<><button className="button button-secondary" onClick={closeModal}>Cancel</button><button form="campaign-form" type="submit" className="button button-primary"><Plus size={14} /> Create campaign</button></>}>
        <form id="campaign-form" className="form-stack" onSubmit={createCampaign}>
          <div className="form-field"><label className="field-label" htmlFor="campaign-name">Campaign name *</label><input id="campaign-name" className="input" placeholder="e.g. October product launch" value={campaignName} onChange={(event) => setCampaignName(event.target.value)} required maxLength={80} autoFocus /></div>
          <div className="form-grid"><div className="form-field"><label className="field-label" htmlFor="campaign-channel">Channel</label><select id="campaign-channel" className="select" value={campaignChannel} onChange={(event) => setCampaignChannel(event.target.value)}><option>WhatsApp</option><option>SMS</option><option>RCS</option><option>Email</option><option>Voice</option></select></div><div className="form-field"><label className="field-label" htmlFor="campaign-status">Save as</label><select id="campaign-status" className="select" value={campaignSchedule} onChange={(event) => setCampaignSchedule(event.target.value)}><option>Draft</option><option>Scheduled</option><option>In review</option></select></div></div>
          <div className="form-field"><label className="field-label" htmlFor="campaign-audience">Audience</label><select id="campaign-audience" className="select" value={campaignAudience} onChange={(event) => setCampaignAudience(event.target.value)}><option>All active contacts</option><option>Recently engaged contacts</option><option>New contacts this month</option><option>Test group (internal)</option></select><p className="field-help">Audience selection is illustrative. Real targeting should be validated by a server-side campaign service.</p></div>
        </form>
      </Modal>

      <Modal open={modal === "credits"} title="Add wallet credits" subtitle="Demo-only wallet. No real payment will be processed." onClose={closeModal} footer={<><button className="button button-secondary" onClick={closeModal}>Cancel</button><button className="button button-primary" form="credits-form" type="submit"><Wallet size={14} /> Add demo credits</button></>}>
        <form id="credits-form" className="form-stack" onSubmit={addCredits}><div className="section-panel panel-padding" style={{ background: "var(--surface-2)" }}><div className="stat-label">Current balance</div><div className="stat-value" style={{ marginTop: 8 }}>{formatCurrency(walletBalance)}</div></div><div className="form-field"><label className="field-label" htmlFor="credit-amount">Amount (INR)</label><input id="credit-amount" className="input" type="number" min="1" max="100000" step="1" value={creditsAmount} onChange={(event) => setCreditsAmount(event.target.value)} required /><div style={{ display: "flex", gap: 7, marginTop: 9, flexWrap: "wrap" }}>{[100, 500, 1000, 2500].map((amount) => <button key={amount} type="button" className={`button button-sm ${creditsAmount === String(amount) ? "button-primary" : "button-secondary"}`} onClick={() => setCreditsAmount(String(amount))}>₹{amount.toLocaleString("en-IN")}</button>)}</div></div><p className="field-help">This control updates only the current browser session. A live payment system needs server-side order creation, signature verification, and webhook handling.</p></form>
      </Modal>

      <Modal open={modal === "contact"} title="Add a contact" subtitle="Create a customer profile in your local demo workspace." onClose={closeModal} footer={<><button className="button button-secondary" onClick={closeModal}>Cancel</button><button form="contact-form" className="button button-primary" type="submit"><Plus size={14} /> Add contact</button></>}>
        <form id="contact-form" className="form-stack" onSubmit={addContact}><div className="form-field"><label className="field-label" htmlFor="contact-name">Full name *</label><input id="contact-name" className="input" placeholder="e.g. Priya Sharma" value={contactName} onChange={(event) => setContactName(event.target.value)} required maxLength={80} autoFocus /></div><div className="form-field"><label className="field-label" htmlFor="contact-email">Email address *</label><input id="contact-email" className="input" type="email" placeholder="priya@company.com" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} required /></div><div className="form-grid"><div className="form-field"><label className="field-label" htmlFor="contact-company">Company</label><input id="contact-company" className="input" placeholder="Company name" value={contactCompany} onChange={(event) => setContactCompany(event.target.value)} /></div><div className="form-field"><label className="field-label" htmlFor="contact-channel">Preferred channel</label><select id="contact-channel" className="select" value={contactChannel} onChange={(event) => setContactChannel(event.target.value)}><option>WhatsApp</option><option>SMS</option><option>RCS</option><option>Email</option></select></div></div></form>
      </Modal>

      <Modal open={modal === "deal"} title="Create a deal" subtitle="Add an opportunity to your demo pipeline." onClose={closeModal} footer={<><button className="button button-secondary" onClick={closeModal}>Cancel</button><button form="deal-form" className="button button-primary" type="submit"><Plus size={14} /> Create deal</button></>}>
        <form id="deal-form" className="form-stack" onSubmit={addDeal}><div className="form-field"><label className="field-label" htmlFor="deal-name">Deal name *</label><input id="deal-name" className="input" placeholder="e.g. AI support pilot" value={dealName} onChange={(event) => setDealName(event.target.value)} required maxLength={90} autoFocus /></div><div className="form-field"><label className="field-label" htmlFor="deal-company">Company</label><input id="deal-company" className="input" placeholder="Customer or company name" value={dealCompany} onChange={(event) => setDealCompany(event.target.value)} /></div><div className="form-field"><label className="field-label" htmlFor="deal-value">Deal value (INR) *</label><input id="deal-value" className="input" type="number" min="1" max="100000000" value={dealValue} onChange={(event) => setDealValue(event.target.value)} required /></div><p className="field-help">New deals are created in the “New lead” stage. Add your CRM API to persist records across users.</p></form>
      </Modal>

      <Modal open={modal === "agent"} title="Create an AI agent" subtitle="Define a first draft before connecting your preferred AI provider." onClose={closeModal} footer={<><button className="button button-secondary" onClick={closeModal}>Cancel</button><button form="agent-form" className="button button-primary" type="submit"><Bot size={14} /> Create draft agent</button></>}>
        <form id="agent-form" className="form-stack" onSubmit={createAgent}><div className="form-field"><label className="field-label" htmlFor="agent-name">Agent name *</label><input id="agent-name" className="input" placeholder="e.g. Customer help assistant" value={agentName} onChange={(event) => setAgentName(event.target.value)} required maxLength={80} autoFocus /></div><div className="form-field"><label className="field-label" htmlFor="agent-purpose">Primary purpose</label><select id="agent-purpose" className="select" value={agentPurpose} onChange={(event) => setAgentPurpose(event.target.value)}><option>Customer support</option><option>Lead qualification</option><option>Appointment booking</option><option>Internal knowledge assistant</option></select></div><div className="form-field"><label className="field-label" htmlFor="agent-guidelines">Agent guidelines (optional)</label><textarea id="agent-guidelines" className="textarea" placeholder="What should this assistant help with? When should it hand off to a person?" /></div></form>
      </Modal>

      <Modal open={modal === "step"} title={onboardingSteps.find((step) => step.id === selectedStep)?.title ?? "Setup step"} subtitle="Getting started guide" onClose={closeModal} footer={<><button className="button button-secondary" onClick={closeModal}>Close</button><button className="button button-primary" onClick={() => { const step = onboardingSteps.find((entry) => entry.id === selectedStep); setModal(null); if (selectedStep === "agent") setModal("agent"); else if (selectedStep === "wallet") setModal("credits"); else if (selectedStep === "broadcast") openCampaign(); else if (selectedStep === "contacts") setModal("contact"); else if (selectedStep === "template") openCampaign("New message template", "WhatsApp"); else notify("Next step", `${step?.title ?? "Setup step"}: connect your provider credentials to complete this action.`); }}><ArrowRight size={14} /> Open setup</button></>}>
        <div className="section-panel panel-padding"><div className="panel-heading-main"><div className="panel-icon"><Sparkles size={17} /></div><div><h3 className="panel-title">A practical next step</h3><p className="panel-description">{onboardingSteps.find((step) => step.id === selectedStep)?.detail}</p></div></div><div className="field-help" style={{ marginTop: 15 }}>Estimated time: {onboardingSteps.find((step) => step.id === selectedStep)?.time}. This demo shows the experience; provider-specific operations need a live integration.</div></div>
      </Modal>

      <Modal open={modal === "tutorials"} title="OrbitFlow quick-start guides" subtitle="Short guides to help you explore the workspace." onClose={closeModal} wide>
        <div className="feature-grid">{[{ title: "Set up your workspace", detail: "Review profile settings, permissions, and channel setup.", icon: LayoutDashboard }, { title: "Import customer contacts", detail: "Understand contact fields, channels, and segmentation.", icon: Users }, { title: "Create a campaign", detail: "Select an audience, write a message, and review status.", icon: Send }, { title: "Build an AI agent", detail: "Define boundaries and set a human handoff process.", icon: Bot }, { title: "Review analytics", detail: "Interpret delivery, engagement, and conversion metrics.", icon: ChartNoAxesCombined }, { title: "Connect integrations", detail: "Plan credentials and secure provider connectivity.", icon: Plug }].map((tutorial) => { const Icon = tutorial.icon; return <article className="section-panel feature-card" key={tutorial.title}><div className="channel-symbol"><Icon size={18} /></div><h3>{tutorial.title}</h3><p>{tutorial.detail}</p><button className="button button-ghost button-sm" onClick={() => { setModal(null); notify(tutorial.title, "Tutorial preview selected. Add your video or documentation links to complete the guide."); }}>Open guide <ArrowRight size={12} /></button></article>; })}</div>
      </Modal>

      <Modal open={modal === "assistant"} title="Orbit AI assistant" subtitle="A local demo assistant for product and workflow guidance." onClose={closeModal} wide>
        <div className="assistant-panel"><div className="assistant-messages">{assistantMessages.map((message) => <div className={`chat-message ${message.role}`} key={message.id}>{message.text}</div>)}</div><form className="assistant-compose" onSubmit={sendAssistantMessage}><input className="input" aria-label="Message Orbit AI" placeholder="Ask about campaigns, contacts, or setup…" value={assistantInput} onChange={(event) => setAssistantInput(event.target.value)} /><button className="button button-primary" type="submit" disabled={!assistantInput.trim()} aria-label="Send message"><Send size={14} /></button></form></div><p className="field-help">Demo responses are generated by simple local rules, not a live language model. Do not enter confidential customer data.</p>
      </Modal>

      <Modal open={Boolean(selectedContact)} title={selectedContact?.name ?? "Contact details"} subtitle="Contact profile · demo data" onClose={() => setSelectedContact(null)} footer={<><button className="button button-secondary" onClick={() => setSelectedContact(null)}>Close</button><button className="button button-primary" onClick={() => { const contact = selectedContact; setSelectedContact(null); if (contact) openCampaign(`Follow up with ${contact.name}`, contact.channel === "SMS" ? "SMS" : contact.channel); }}>Create follow-up <ArrowRight size={13} /></button></>}>
        {selectedContact ? <div className="form-stack"><div className="section-panel panel-padding"><div className="table-name"><span className="person-avatar" style={{ width: 42, height: 42, fontSize: 13 }}>{selectedContact.name.split(" ").map((part) => part[0]).join("")}</span><span>{selectedContact.name}<span className="table-subtext">{selectedContact.company}</span></span></div></div><div className="form-grid"><div><div className="field-label">Email address</div><div style={{ color: "var(--text-soft)", fontSize: 12 }}>{selectedContact.email}</div></div><div><div className="field-label">Preferred channel</div><div style={{ color: "var(--text-soft)", fontSize: 12 }}>{selectedContact.channel}</div></div><div><div className="field-label">Contact status</div><span className={`status-pill ${selectedContact.status === "Active" ? "success" : selectedContact.status === "Engaged" ? "warning" : ""}`}>{selectedContact.status}</span></div><div><div className="field-label">Contact ID</div><div style={{ color: "var(--text-soft)", fontSize: 12 }}>{selectedContact.id}</div></div></div><p className="field-help">This profile is stored in local React state for this demo. Connect your CRM database for durable records and activity history.</p></div> : null}
      </Modal>

      <Modal open={Boolean(selectedDeal)} title={selectedDeal?.name ?? "Deal details"} subtitle="Opportunity profile · demo data" onClose={() => setSelectedDeal(null)} footer={<><button className="button button-secondary" onClick={() => setSelectedDeal(null)}>Close</button><button className="button button-primary" onClick={() => { const deal = selectedDeal; setSelectedDeal(null); if (deal) notify("Deal follow-up", `Next step for ${deal.name}: confirm buyer needs and agree on the next meeting.`); }}>Plan next step <ArrowRight size={13} /></button></>}>
        {selectedDeal ? <div className="form-stack"><div className="section-panel panel-padding"><div className="stat-label">Opportunity value</div><div className="stat-value" style={{ marginTop: 8 }}>{formatCurrency(selectedDeal.value)}</div><div style={{ marginTop: 10 }}><span className={`status-pill ${selectedDeal.stage === "Won" ? "success" : selectedDeal.stage === "Negotiation" || selectedDeal.stage === "Proposal" ? "warning" : ""}`}>{selectedDeal.stage}</span></div></div><div className="form-grid"><div><div className="field-label">Company</div><div style={{ color: "var(--text-soft)", fontSize: 12 }}>{selectedDeal.company}</div></div><div><div className="field-label">Deal owner</div><div style={{ color: "var(--text-soft)", fontSize: 12 }}>{selectedDeal.owner}</div></div><div><div className="field-label">Expected close</div><div style={{ color: "var(--text-soft)", fontSize: 12 }}>{selectedDeal.closeDate}</div></div><div><div className="field-label">Deal ID</div><div style={{ color: "var(--text-soft)", fontSize: 12 }}>{selectedDeal.id}</div></div></div></div> : null}
      </Modal>

      <ToastRegion toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

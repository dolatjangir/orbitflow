import { ContactRound, FileText, Mail, Send, Sparkles, Workflow, AudioLines } from "lucide-react";
import { PageHeader } from "@/components/ui/dashboard/page-header";
import type { ToastFn } from "@/components/layout/topbar";

export function IntegrationsPage({ onToast }: { onToast: ToastFn }) {
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

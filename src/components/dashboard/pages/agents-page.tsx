import { ArrowRight, Bot, Headphones, Plus, Sparkles, Users, Workflow } from "lucide-react";
import { PageHeader } from "@/components/ui/dashboard/page-header";
import type { ToastFn } from "@/components/layout/topbar";

export function AgentsPage({ onCreate, onAssistant, onToast }: { onCreate: () => void; onAssistant: () => void; onToast: ToastFn }) {
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

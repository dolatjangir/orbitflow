import { ArrowRight, Bot, Headphones, Send, BookOpen, CircleDollarSign } from "lucide-react";
import { PageHeader } from "@/components/ui/dashboard/page-header";
import type { ToastFn } from "@/components/layout/topbar";

export function HelpPage({ onTutorials, onToast }: { onTutorials: () => void; onToast: ToastFn }) {
  const topics = [
    { title: "Getting started", detail: "Learn the key steps to set up your workspace.", icon: BookOpen },
    { title: "Campaign delivery", detail: "Understand channel setup, templates, and delivery states.", icon: Send },
    { title: "AI agent best practices", detail: "Keep agent scope clear and make human escalation reliable.", icon: Bot },
    { title: "Billing & credits", detail: "Review demo wallet controls and production billing requirements.", icon: CircleDollarSign },
  ];
  return <><PageHeader eyebrow="Support center" title="How can we help?" subtitle="Browse starter guides, explore the product, or contact your workspace support team." actions={<button className="button button-primary" onClick={() => onToast("Support request", "Support form submitted in demo mode. Add a support API to route this to your team.")}>Contact support <ArrowRight size={14} /></button>} /><div className="section-panel panel-padding" style={{ marginBottom: 16, background: "radial-gradient(ellipse at 85% 0%, var(--primary-soft), transparent 55%), var(--surface)" }}><div className="panel-heading-main"><div className="panel-icon" style={{ width: 46, height: 46 }}><Headphones size={21} /></div><div style={{ flex: 1 }}><h2 className="panel-title">Explore the product walkthrough</h2><p className="panel-description">Learn how to set up channels, bring in contacts, and create a first campaign.</p></div><button className="button button-primary" onClick={onTutorials}><BookOpen size={14} /> View tutorials</button></div></div><div className="feature-grid">{topics.map((topic) => { const Icon = topic.icon; return <article className="section-panel feature-card" key={topic.title}><div className="channel-symbol"><Icon size={18} /></div><h3>{topic.title}</h3><p>{topic.detail}</p><button className="button button-ghost button-sm" onClick={() => onToast(topic.title, "Help article preview is available in the starter UI; add your knowledge base URL to connect it.")}>Read guide <ArrowRight size={12} /></button></article>; })}</div></>;
}

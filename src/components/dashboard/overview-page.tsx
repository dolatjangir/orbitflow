"use client";

import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Bot, Check, ChevronRight, CircleHelp,
  ContactRound, Download, FileText, MessageCircle, MoreHorizontal, Plus, Send,
  Sparkles, TrendingUp, Wallet, X, ChartNoAxesCombined, Users, BriefcaseBusiness,
  Mail, PhoneCall,
} from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { overviewStats } from "@/data/analytics";
import { overviewCampaigns } from "@/data/campaigns";
import { activityItems } from "@/data/activity";
import { onboardingSteps } from "@/data/onboarding";




const overviewStatIcons: Record<string, LucideIcon> = { Users, Send, TrendingUp, BriefcaseBusiness };

export type OverviewHandlers = {
  onExport: () => void;
  onCampaign: () => void;
  onStep: (id: string) => void;
  onAssistant: () => void;
  onToast: (title: string, description?: string) => void;
};

function EngagementChart() {
  const [period, setPeriod] = useState("7 days");
  const lineA = period === "7 days" ? "0,119 35,104 70,108 105,76 140,90 175,63 210,72 245,38 280,49 315,25 350,37 385,12" : period === "30 days" ? "0,117 35,92 70,101 105,84 140,93 175,58 210,72 245,49 280,55 315,22 350,33 385,12" : "0,123 35,111 70,96 105,101 140,77 175,69 210,80 245,45 280,42 315,28 350,20 385,7";
  const lineB = period === "7 days" ? "0,140 35,136 70,124 105,129 140,111 175,118 210,97 245,109 280,92 315,83 350,88 385,71" : period === "30 days" ? "0,142 35,126 70,135 105,115 140,122 175,106 210,109 245,99 280,88 315,93 350,77 385,69" : "0,144 35,133 70,126 105,133 140,118 175,104 210,113 245,88 280,96 315,80 350,72 385,62";
  return (
    <div className="section-panel panel-padding">
      <div className="panel-heading">
        <div><h2 className="panel-title">Engagement overview</h2><p className="panel-description">Message activity and customer interaction</p></div>
        <div className="segmented" aria-label="Chart period">
          {["7 days", "30 days", "90 days"].map((item) => <button key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>{item}</button>)}
        </div>
      </div>
      <div className="chart-legend"><span><i className="legend-dot" />Delivered</span><span><i className="legend-dot amber" />Engaged</span></div>
      <div className="chart-wrap">
        <svg className="chart-svg" viewBox="0 0 420 174" role="img" aria-label={`Delivered and engaged message trends over ${period.toLowerCase()}`} preserveAspectRatio="none">
          {[20, 58, 96, 134].map((y) => <line className="chart-gridline" key={y} x1="0" x2="410" y1={y} y2={y} />)}
          <defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity=".22"/><stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/></linearGradient></defs>
          <polygon points={`0,160 ${lineA} 385,160`} fill="url(#chart-fill)" />
          <polyline points={lineA} fill="none" stroke="var(--primary)" strokeWidth="2.7" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={lineB} fill="none" stroke="var(--accent)" strokeWidth="2.1" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5 4" />
          {[[105,76],[210,72],[315,25],[385,12]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />)}
          {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((label, index) => <text className="chart-label" key={label} x={index * 63 + 2} y="172">{label}</text>)}
        </svg>
      </div>
    </div>
  );
}

function ActivityPanel({ onToast }: { onToast: OverviewHandlers["onToast"] }) {
  const icons = [MessageCircle, ContactRound, Bot, BriefcaseBusiness];
  return (
    <div className="section-panel panel-padding">
      <div className="panel-heading">
        <div><h2 className="panel-title">Recent activity</h2><p className="panel-description">The latest across your workspace</p></div>
        <button className="icon-button" aria-label="More activity options" onClick={() => onToast("Activity options", "Your activity feed is up to date in this demo.")}><MoreHorizontal size={17} /></button>
      </div>
      <div className="activity-list">
        {activityItems.map((item, index) => {
          const Icon = icons[index] ?? CircleHelp;
          return <div className="activity-row" key={item.id}>
            <div className="activity-dot"><Icon size={15} /></div>
            <div className="activity-main"><p className="activity-title">{item.title}</p><div className="activity-meta">{item.detail}</div></div>
            <span className="activity-time">{item.time}</span>
          </div>;
        })}
      </div>
      <button className="button button-ghost button-sm" style={{ marginTop: 15, width: "100%" }} onClick={() => onToast("Activity history", "Full audit history can be connected to your backend when you are ready.")}>View activity history <ArrowRight size={13} /></button>
    </div>
  );
}

export function OverviewPage({ onExport, onCampaign, onStep, onAssistant, onToast }: OverviewHandlers) {
  const [steps, setSteps] = useState<string[]>(["connect", "contacts", "template", "wallet", "broadcast"]);
  const [onboardingVisible, setOnboardingVisible] = useState(true);
  const completed = steps.length;
  const progress = Math.round(completed / onboardingSteps.length * 100);
  const currentStep = onboardingSteps.find((step) => !steps.includes(step.id))?.id ?? "agent";

  const latestCampaign = overviewCampaigns;

  const toggleStep = (id: string) => setSteps((current) => current.includes(id) ? current.filter((step) => step !== id) : [...current, id]);

  return (
    <>
      <div className="hero-panel">
        <div className="hero-copy">
          <div className="hero-kicker"><Sparkles size={12} /> Smart engagement snapshot</div>
          <h1 className="hero-title">Good afternoon, Anushka — your engagement is <span className="highlight">up 18.6%</span> this month.</h1>
          <p className="hero-description">Here&apos;s what&apos;s moving across your workspace on 23 Oct 2026. 23 messages delivered today, with 10 new contacts in your book.</p>
        </div>
        <div className="hero-actions"><button className="button button-outline" onClick={onExport}><Download size={14} /> Export</button><button className="button button-primary" onClick={onCampaign}><Plus size={15} /> New campaign</button></div>
      </div>

      {onboardingVisible ? <section className="section-panel onboarding-panel">
        <div className="panel-heading">
          <div className="panel-heading-main"><div className="panel-icon"><Sparkles size={16} /></div><div><h2 className="panel-title">Getting started with OrbitFlow</h2><p className="panel-description">{completed} of {onboardingSteps.length} steps complete — finish setup to start reaching customers. <button className="inline-link" onClick={() => onToast("Quick-start videos", "Tutorial library opened in demo mode. Choose Tutorials in the top bar to revisit setup guidance.")}>Watch the quick-start guides</button></p></div></div>
          <button className="icon-button" aria-label="Hide getting started panel" onClick={() => setOnboardingVisible(false)}><X size={15} /></button>
        </div>
        <div className="progress-track" aria-label={`${progress}% of onboarding steps completed`}><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <div className="steps-grid">
          {onboardingSteps.map((step, index) => {
            const done = steps.includes(step.id);
            const current = step.id === currentStep;
            return <div className={`step-card ${current ? "is-current" : ""}`} key={step.id}>
              <button className={`step-check ${done ? "complete" : ""}`} aria-label={`${done ? "Mark incomplete" : "Mark complete"}: ${step.title}`} onClick={() => toggleStep(step.id)}>{done ? <Check size={13} /> : current ? <Bot size={13} /> : <span style={{ fontSize: 10 }}>{index + 1}</span>}</button>
              <div className="step-body"><p className={`step-title ${done ? "done" : ""}`}>{index + 1}. {step.title}{current ? <span className="step-next">NEXT</span> : null}</p><p className="step-description">{step.description}</p><button className="step-action" onClick={() => onStep(step.id)}><CircleHelp size={11} /> {done ? "Review step" : `Get started · ${step.time}`}</button></div>
              {current ? <ChevronRight size={14} color="var(--muted)" /> : null}
            </div>;
          })}
        </div>
      </section> : <button className="button button-secondary" style={{ marginBottom: 20 }} onClick={() => setOnboardingVisible(true)}><Sparkles size={14} /> Show setup checklist <ChevronRight size={13} /></button>}

      <section className="stats-grid" aria-label="Workspace metrics">
        {overviewStats.map((stat) => {
          const Icon = overviewStatIcons[stat.icon];
          return <article className="section-panel stat-card" key={stat.label}>
            <div className="stat-top"><span className="stat-icon"><Icon size={17} /></span><svg className="stat-spark" viewBox="0 0 82 29" aria-hidden="true"><polyline points={stat.series} transform="translate(0 2)" fill="none" stroke={stat.direction === "down" ? "var(--accent)" : "var(--primary)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <div className="stat-value-row"><span className="stat-value">{stat.value}</span><span className={`stat-change ${stat.direction === "down" ? "negative" : ""}`}>{stat.direction === "down" ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}{stat.change}</span></div>
            <div className="stat-label" style={{ marginTop: 8 }}>{stat.label}</div><div className="stat-foot">{stat.note}</div>
          </article>;
        })}
      </section>

      <section className="dashboard-grid"><EngagementChart /><ActivityPanel onToast={onToast} /></section>

      <section className="section-panel table-panel">
        <div className="table-toolbar"><div className="table-toolbar-left"><h2 className="panel-title">Recent campaigns</h2><p className="panel-description">A quick look at your latest sends</p></div><div className="table-toolbar-right"><button className="button button-secondary button-sm" onClick={onExport}><Download size={13} /> Export report</button><button className="button button-primary button-sm" onClick={onCampaign}><Plus size={13} /> Create campaign</button></div></div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>Campaign</th><th>Channel</th><th>Audience</th><th>Performance</th><th>Status</th><th>Action</th></tr></thead><tbody>{latestCampaign.map((campaign) => <tr key={campaign.name}><td><div className="table-name"><span className="person-avatar"><Send size={13} /></span><span>{campaign.name}<span className="table-subtext">Edited today</span></span></div></td><td>{campaign.channel}</td><td>{campaign.audience}</td><td>{campaign.delivered}</td><td><span className={`status-pill ${campaign.tone}`}>{campaign.status}</span></td><td><button className="button button-ghost button-sm" onClick={() => onToast(campaign.name, `Campaign details for ${campaign.channel} are available in this interactive demo.`)}>View <ChevronRight size={12} /></button></td></tr>)}</tbody></table></div>
      </section>
    </>
  );
}

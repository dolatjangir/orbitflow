"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent,type ReactNode } from "react";
import {
  ArrowRight, Bot, Check, LayoutDashboard, Plus, Send, Sparkles, Users, Wallet, Plug, ChartNoAxesCombined
} from "lucide-react";

import { PageHeader } from "@/components/ui/dashboard/page-header";
import { EmptyState } from "@/components/ui/dashboard/empty-state";
import { ContactsPage } from "@/components/dashboard/pages/contacts-page";
import { DealsPage } from "@/components/dashboard/pages/deals-page";
import { ChannelPage } from "@/components/dashboard/pages/channel-page";
import { CampaignsPage } from "@/components/dashboard/pages/campaigns-page";
import { AgentsPage } from "@/components/dashboard/pages/agents-page";
import { AnalyticsPage } from "@/components/dashboard/pages/analytics-page";
import { SettingsPage } from "@/components/dashboard/pages/settings-page";
import { TemplatesPage } from "@/components/dashboard/pages/templates-page";
import { IntegrationsPage } from "@/components/dashboard/pages/integrations-page";
import { HelpPage } from "@/components/dashboard/pages/help-page";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Topbar } from "@/components/layout/topbar";
import { OverviewPage } from "@/components/dashboard/overview-page";
import { Modal } from "@/components/ui/modal";
import { ToastRegion } from "@/components/ui/toast-region";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";
import { downloadCSV } from "@/lib/csv";
import { initialContacts } from "@/data/contacts";
import { initialDeals } from "@/data/deals";
import { onboardingSteps } from "@/data/onboarding";
import { routeMeta } from "@/data/route-meta";
import type { Contact } from "@/types/contact";
import type { Deal } from "@/types/deal";
import InboxWorkspace from "./pages/InboxWorkspace";

type ModalName = "campaign" | "credits" | "tutorials" | "assistant" | "step" | "contact" | "deal" | "agent" | "connect-whatsapp" | null;
type Props = { initialSection: string , children: ReactNode };

function getSection(raw: string) {
  if (raw === "support") return "help";
  return raw || "overview";
}


export function DashboardApp({ initialSection, children }: Props) {
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
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<Array<{ id: number; role: "assistant" | "user"; text: string }>>([{ id: 1, role: "assistant", text: "Hi Anushka! I’m Orbit AI, your workspace guide. Ask me about campaign ideas, contact segmentation, or setup steps. This demo uses local sample responses." }]);

  const { toasts, notify, dismissToast } = useToast();
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
const connectChannel = (name: string) => {
  if (name === "WhatsApp") {
    setModal("connect-whatsapp");
    return;
  }

  notify(
    `${name} connection`,
    "Connection settings opened in demo mode. Add provider credentials and secure server-side API routes to connect a live account."
  );
};


  useEffect(() => {
    setMobileSidebarOpen(false);
    setSearchValue("");
    setContactFilter("All contacts");
  }, [section]);

  const meta = routeMeta[section] ?? routeMeta.overview;
  return (
    <DashboardShell
      sidebar={<Sidebar section={section} collapsed={sidebarCollapsed} mobileOpen={mobileSidebarOpen} onToggleCollapse={() => setSidebarCollapsed((value) => !value)} onCloseMobile={() => setMobileSidebarOpen(false)} />}
      topbar={<Topbar section={section} walletBalance={walletBalance} onOpenAssistant={openAssistant} onOpenCredits={openCredits} onOpenCampaign={() => openCampaign()} onOpenTutorials={openTutorials} onToast={notify} onMobileMenu={() => setMobileSidebarOpen(true)} searchValue={searchValue} onSearchChange={setSearchValue} />}
    >
       <div className={section === "inbox" ? "min-w-0" : "page-wrap"}>
         {section === "inbox" ? <InboxWorkspace /> : null}
          {section === "overview" ? <OverviewPage onExport={exportData} onCampaign={() => openCampaign()} onStep={openStep} onAssistant={openAssistant} onToast={notify} /> : null}

       
{section === "contacts" ? (
  <ContactsPage
    meta={meta}
    onExport={exportData}
    onAddContact={() => setModal("contact")}
    onSelectContact={(contact) => {
      setSelectedContact(contact);
      notify(
        contact.name,
        `${contact.company} · ${contact.email} · ${contact.channel}`
      );
    }}
  />
) : null}

          {section === "deals" ? <DealsPage meta={meta} deals={deals} filteredDeals={filteredDeals} searchValue={searchValue} setSearchValue={setSearchValue} onExport={exportData} onAddDeal={() => setModal("deal")} onSelectDeal={(deal) => { setSelectedDeal(deal); notify(deal.name, `${deal.company} · ${formatCurrency(deal.value)} · ${deal.stage}`); }} /> : null}

          {section === "campaigns" ? <CampaignsPage campaigns={campaigns} onCreate={() => openCampaign()} onExport={exportData} onToast={notify} /> : null}
          {section === "analytics" ? <AnalyticsPage onExport={exportData} /> : null}
    {["whatsapp", "sms", "rcs", "email", "voice"].includes(section) && (
  (section === "whatsapp" || section === "email") && children ? (
    children
  ) : (
    <ChannelPage
      section={section}
      onConnect={connectChannel}
      onCampaign={() =>
        openCampaign(
          "",
          section === "voice"
            ? "WhatsApp"
            : section === "whatsapp"
              ? "WhatsApp"
              : section === "sms"
                ? "SMS"
                : section === "rcs"
                  ? "RCS"
                  : "Email"
        )
      }
    />
  )
)}
          {section === "chatbot" ? <AgentsPage onCreate={() => setModal("agent")} onAssistant={openAssistant} onToast={notify} /> : null}
          {section === "templates" ? <TemplatesPage onUse={(name, channel) => openCampaign(name, channel)} onToast={notify} /> : null}
          {section === "integrations" ? <IntegrationsPage onToast={notify} /> : null}
          {section === "settings" ? <SettingsPage onToast={notify} /> : null}
          {section === "help" ? <HelpPage onTutorials={openTutorials} onToast={notify} /> : null}

          {!(["overview", "contacts", "deals", "campaigns", "analytics", "whatsapp", "sms", "rcs", "email", "voice", "chatbot", "templates", "integrations", "settings", "help","inbox"].includes(section)) ? <><PageHeader eyebrow={meta.eyebrow} title={meta.title} subtitle={meta.subtitle} /><EmptyState title="This workspace view is not configured yet" body="Use the sidebar to explore the available demo pages." action={<Link href="/" className="button button-primary">Back to overview</Link>} /></> : null}
        </div>

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
    <Modal
  open={modal === "connect-whatsapp"}
  title="Connect WhatsApp"
  subtitle="Choose how you want to integrate WhatsApp."
  onClose={closeModal}
  footer={
    <button
      type="button"
      className="button button-secondary"
      onClick={closeModal}
    >
      Cancel
    </button>
  }
>
  <div className="form-stack">
    <button
      type="button"
      className="button button-secondary"
      style={{
        width: "100%",
        minHeight: 52,
        whiteSpace: "normal",
      }}
      onClick={() => {
        closeModal();

        // Add your Free WhatsApp integration flow here.
        notify(
          "Free WhatsApp integration",
          "This integration is not configured yet."
        );
      }}
    >
      <Plug size={18} />
      Integration with Free WhatsApp
    </button>

    <button
      type="button"
      className="button button-primary"
      style={{
        width: "100%",
        minHeight: 52,
        whiteSpace: "normal",
      }}
      onClick={() => {
        closeModal();

        // Add your Meta WhatsApp integration flow here.
        notify(
          "Meta WhatsApp integration",
          "This integration is not configured yet."
        );
      }}
    >
      <Plug size={18} />
      Integration with Meta WhatsApp
    </button>
  </div>
</Modal>
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />
    </DashboardShell>
  );
}

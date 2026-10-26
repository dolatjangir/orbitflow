"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell, ChevronDown, ChevronRight, CircleHelp, CreditCard, Menu, Moon, Plus,
  Search, Sparkles, Sun, Wallet, X, CheckCheck, UserRound, Settings, LogOut, PlayCircle,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export type ToastFn = (title: string, description?: string) => void;

type Props = {
  section: string;
  walletBalance: number;
  onOpenAssistant: () => void;
  onOpenCredits: () => void;
  onOpenCampaign: () => void;
  onOpenTutorials: () => void;
  onToast: ToastFn;
  onMobileMenu: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

const sectionNames: Record<string, string> = {
  overview: "Overview", contacts: "Contacts", deals: "Deals", campaigns: "Campaigns", analytics: "Analytics",
  whatsapp: "WhatsApp", sms: "SMS", rcs: "RCS", email: "Email", voice: "AI Voice", chatbot: "Chatbot & Agents",
  templates: "Templates", integrations: "Integrations", settings: "Settings", help: "Help & Support", support: "Help & Support",
};

export function Topbar({ section, walletBalance, onOpenAssistant, onOpenCredits, onOpenCampaign, onOpenTutorials, onToast, onMobileMenu, searchValue, onSearchChange }: Props) {
  const [openMenu, setOpenMenu] = useState<"theme" | "notifications" | "profile" | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const current = sectionNames[section] ?? "Overview";
  const toggle = (menu: typeof openMenu) => setOpenMenu((currentMenu) => currentMenu === menu ? null : menu);

  return (
    <header className="topbar">
      <button className="icon-button mobile-menu-button" aria-label="Open navigation" onClick={onMobileMenu}><Menu size={19} /></button>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span className="breadcrumb-root hide-mobile">Workspace</span>
        <ChevronRight size={13} className="hide-mobile" color="var(--muted)" />
        <span className="breadcrumb-current">{current}</span>
      </nav>
      <div className="topbar-spacer" />

      <div className="topbar-actions">
        <button className="button button-secondary button-sm hide-mobile" onClick={onOpenTutorials}><PlayCircle size={14} /><span className="tutorial-label">Tutorials</span></button>
        <div className="popover-anchor">
          <button className="icon-button bordered" aria-label="Choose theme" aria-expanded={openMenu === "theme"} onClick={() => toggle("theme")}>
            <Sun size={16} />
          </button>
          {openMenu === "theme" ? <ThemeSwitcher onClose={() => setOpenMenu(null)} /> : null}
        </div>
        <button className="button button-primary button-sm" onClick={onOpenAssistant}><Sparkles size={14} /><span className="hide-mobile">Orbit AI</span><span className="mobile-only">AI</span></button>
        <button className="wallet-pill" onClick={onOpenCredits} aria-label={`Wallet balance ${walletBalance} rupees`}><Wallet size={13} /> ₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</button>
        <button className="button button-secondary button-sm hide-mobile" onClick={onOpenCredits}><Plus size={13} /> Add credits</button>
        <div className="popover-anchor">
          <button className="icon-button" aria-label="Search workspace" onClick={() => { setShowSearch((v) => !v); setOpenMenu(null); }}><Search size={16} /></button>
          {showSearch ? (
            <div className="popover-panel" style={{ width: 300, padding: 12 }}>
              <div className="field-label">Search workspace</div>
              <div className="search-field" style={{ width: "100%" }}><Search size={14} /><input autoFocus className="input" placeholder="Search contacts or companies…" value={searchValue} onChange={(event) => onSearchChange(event.target.value)} /></div>
              <div className="field-help">Search filters the visible contact or deal list.</div>
              <button className="button button-ghost button-sm" style={{ marginTop: 8 }} onClick={() => { setShowSearch(false); onSearchChange(""); }}><X size={13} /> Clear search</button>
            </div>
          ) : null}
        </div>
        <div className="popover-anchor">
          <button className="icon-button" aria-label="Notifications" aria-expanded={openMenu === "notifications"} onClick={() => toggle("notifications")}><Bell size={16} /><span className="dot" /></button>
          {openMenu === "notifications" ? (
            <div className="popover-panel" style={{ width: 300 }}>
              <div className="popover-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>Notifications <span className="status-pill warning">3 new</span></div>
              <div className="popover-row"><span className="activity-dot"><CheckCheck size={15} /></span><span className="row-content"><strong>Campaign delivered</strong><small>Autumn product update reached 1,248 contacts.</small></span></div>
              <div className="popover-row"><span className="activity-dot"><CreditCard size={15} /></span><span className="row-content"><strong>Low wallet reminder</strong><small>Review your demo wallet before launching a test.</small></span></div>
              <div className="popover-row"><span className="activity-dot"><UserRound size={15} /></span><span className="row-content"><strong>New contact added</strong><small>Maya Patel was added to your workspace.</small></span></div>
              <button className="button button-secondary button-sm" style={{ width: "100%", marginTop: 5 }} onClick={() => { setOpenMenu(null); onToast("All caught up", "Notifications are marked as reviewed in this demo."); }}>Mark all as read</button>
            </div>
          ) : null}
        </div>
        <div className="popover-anchor">
          <button className="profile-button" aria-label="Account menu" aria-expanded={openMenu === "profile"} onClick={() => toggle("profile")}>
            <span className="profile-avatar">AJ</span>
            <span className="profile-copy"><span className="profile-name">Anushka Jangid</span><span className="profile-role">Workspace admin</span></span>
            <ChevronDown size={13} className="hide-mobile" color="var(--muted)" />
          </button>
          {openMenu === "profile" ? (
            <div className="popover-panel" style={{ width: 220 }}>
              <div style={{ padding: "9px 10px 11px", borderBottom: "1px solid var(--border)", marginBottom: 5 }}><strong style={{ fontSize: 12 }}>Anushka Jangid</strong><div style={{ color: "var(--muted)", fontSize: 10, marginTop: 3 }}>admin@orbitflow.demo</div></div>
              <Link href="/settings" className="popover-row" onClick={() => setOpenMenu(null)}><Settings size={15} /><span className="row-content"><strong>Settings</strong><small>Workspace preferences</small></span></Link>
              <button className="popover-row" onClick={() => { setOpenMenu(null); onToast("Demo session", "Authentication is not connected in this front-end starter."); }}><LogOut size={15} /><span className="row-content"><strong>Sign out</strong><small>Demo account session</small></span></button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

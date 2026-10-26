"use client";

import Link from "next/link";
import {
  Activity, Bot, BriefcaseBusiness, ChartNoAxesCombined, ChevronLeft, ChevronRight,
  FileText, Headphones, LayoutDashboard, Layers3, Mail, MessageCircle, Plug,
  Send, ShieldCheck, Smartphone, Users, PhoneCall, X,
} from "lucide-react";
import { navigationGroups } from "@/data/navigation";

type Props = {
  section: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

const iconMap = {
  layout: LayoutDashboard,
  users: Users,
  briefcase: BriefcaseBusiness,
  send: Send,
  chart: ChartNoAxesCombined,
  message: MessageCircle,
  sms: Smartphone,
  layers: Layers3,
  mail: Mail,
  phone: PhoneCall,
  bot: Bot,
  file: FileText,
  plug: Plug,
};

function normalizedSection(section: string) {
  if (section === "overview") return "/";
  if (section === "help" || section === "support") return "/help";
  return `/${section}`;
}

export function Sidebar({ section, collapsed, mobileOpen, onToggleCollapse, onCloseMobile }: Props) {
  const activeHref = normalizedSection(section);
  return (
    <>
      {mobileOpen ? <button className="mobile-overlay" aria-label="Close navigation" onClick={onCloseMobile} /> : null}
      <aside className={`app-sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`} aria-label="Main navigation">
        <div className="app-brand">
          <div className="brand-mark"><Activity size={19} strokeWidth={2.8} /></div>
          <div className="brand-copy"><div className="brand-name">orbit<span>flow</span></div></div>
          {mobileOpen ? <button className="icon-button mobile-only" style={{ marginLeft: "auto" }} onClick={onCloseMobile} aria-label="Close menu"><X size={17} /></button> : null}
        </div>
        <div className="sidebar-scroll">
          {navigationGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                const isActive = activeHref === item.href || (item.href === "/help" && (section === "support" || section === "help"));
                return (
                  <Link
                    className={`nav-item ${isActive ? "active" : ""}`}
                    href={item.href}
                    key={item.href}
                    aria-current={isActive ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    onClick={onCloseMobile}
                  >
                    <span className="nav-icon"><Icon size={17} strokeWidth={1.8} /></span>
                    <span className="nav-text">{item.label}</span>
                    {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
        <div className="nav-footer">
          <Link className="sidebar-help" href="/help" onClick={onCloseMobile}>
            <span className="nav-icon"><Headphones size={17} /></span>
            <span className="help-copy" style={{ flex: 1 }}>Help & support</span>
          </Link>
          <Link className="sidebar-help" href="/settings" onClick={onCloseMobile}>
            <span className="nav-icon"><ShieldCheck size={17} /></span>
            <span className="help-copy" style={{ flex: 1 }}>Workspace settings</span>
          </Link>
          <button className="collapse-button" onClick={onToggleCollapse} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            <span className="collapse-copy" style={{ fontSize: 11, fontWeight: 700 }}>Collapse sidebar</span>
          </button>
        </div>
      </aside>
    </>
  );
}

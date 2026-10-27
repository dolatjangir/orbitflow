"use client";

import { Activity, CheckCircle2, ContactRound, Download, Plus, Search, Users } from "lucide-react";
import type { Contact } from "@/types/contact";
import { PageHeader } from "@/components/ui/dashboard/page-header";
import { MetricCard } from "@/components/ui/dashboard/metric-card";
import { ContactsTable } from "@/components/ui/dashboard/contacts-table";

type PageMeta = { title: string; subtitle: string; eyebrow: string };
type Props = {
  meta: PageMeta; contacts: Contact[]; filteredContacts: Contact[]; searchValue: string; setSearchValue: (value: string) => void;
  contactFilter: string; setContactFilter: (value: string) => void; onExport: () => void; onAddContact: () => void; onSelectContact: (contact: Contact) => void;
};

export function ContactsPage({ meta, contacts, filteredContacts, searchValue, setSearchValue, contactFilter, setContactFilter, onExport, onAddContact, onSelectContact }: Props) {
  console.log("hello world")
  return <>
    <PageHeader eyebrow={meta.eyebrow} title={meta.title} subtitle={meta.subtitle} actions={<><button className="button button-outline" onClick={onExport}><Download size={14} /> Export CSV</button><button className="button button-primary" onClick={onAddContact}><Plus size={14} /> Add contact</button></>} />
    <div className="stats-grid"><MetricCard label="Total contacts" value={String(contacts.length + 12833)} detail="Across connected channels" icon={Users} /><MetricCard label="Active contacts" value={String(contacts.filter((contact) => contact.status === "Active").length + 8200)} detail="Reachable and opted in" icon={CheckCircle2} /><MetricCard label="Engaged this month" value="2,480" detail="Opened or replied recently" icon={Activity} /><MetricCard label="New this week" value={String(contacts.length)} detail="Sample data in this workspace" icon={ContactRound} accent /></div>
    <div className="section-panel table-panel"><div className="table-toolbar"><div><h2 className="panel-title">All contacts</h2><p className="panel-description">Search and review people in your customer book</p></div><div className="table-toolbar-right"><div className="search-field"><Search size={14} /><input className="input" aria-label="Search contacts" placeholder="Name, email, company…" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} /></div><select className="select" aria-label="Filter contacts by status" style={{ width: 135 }} value={contactFilter} onChange={(event) => setContactFilter(event.target.value)}><option>All contacts</option><option>Active</option><option>Engaged</option><option>Inactive</option></select></div></div><ContactsTable contacts={filteredContacts} onEdit={onSelectContact} /></div>
  </>;
}

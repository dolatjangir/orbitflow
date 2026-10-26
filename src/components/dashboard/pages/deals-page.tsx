"use client";

import { Activity, BriefcaseBusiness, ChartNoAxesCombined, CheckCircle2, Download, Plus, Search } from "lucide-react";
import type { Deal } from "@/types/deal";
import { PageHeader } from "@/components/ui/dashboard/page-header";
import { MetricCard } from "@/components/ui/dashboard/metric-card";
import { DealsTable } from "@/components/ui/dashboard/deals-table";
import { formatCurrency } from "@/lib/format";

type PageMeta = { title: string; subtitle: string; eyebrow: string };
type Props = { meta: PageMeta; deals: Deal[]; filteredDeals: Deal[]; searchValue: string; setSearchValue: (value: string) => void; onExport: () => void; onAddDeal: () => void; onSelectDeal: (deal: Deal) => void };

export function DealsPage({ meta, deals, filteredDeals, searchValue, setSearchValue, onExport, onAddDeal, onSelectDeal }: Props) {
  return <>
    <PageHeader eyebrow={meta.eyebrow} title={meta.title} subtitle={meta.subtitle} actions={<><button className="button button-outline" onClick={onExport}><Download size={14} /> Export CSV</button><button className="button button-primary" onClick={onAddDeal}><Plus size={14} /> New deal</button></>} />
    <div className="stats-grid"><MetricCard label="Pipeline value" value={formatCurrency(deals.reduce((sum, deal) => sum + deal.value, 0))} detail="All visible opportunities" icon={BriefcaseBusiness} /><MetricCard label="Open deals" value={String(deals.filter((deal) => deal.stage !== "Won").length)} detail="Need a next step" icon={Activity} /><MetricCard label="Won this period" value="₹15,000" detail="One demo opportunity" icon={CheckCircle2} /><MetricCard label="Win rate" value="28.4%" detail="Illustrative conversion rate" icon={ChartNoAxesCombined} accent /></div>
    <div className="section-panel table-panel"><div className="table-toolbar"><div><h2 className="panel-title">Opportunity pipeline</h2><p className="panel-description">Track next steps, ownership, and expected close dates</p></div><div className="table-toolbar-right"><div className="search-field"><Search size={14} /><input className="input" aria-label="Search deals" placeholder="Deal, company, owner…" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} /></div></div></div><DealsTable deals={filteredDeals} onEdit={onSelectDeal} /></div>
  </>;
}

import { BriefcaseBusiness, ChevronRight } from "lucide-react";
import type { Deal } from "@/types/deal";
import { formatCurrency } from "@/lib/format";
import { EmptyState } from "@/components/ui/dashboard/empty-state";

export function DealsTable({ deals, onEdit }: { deals: Deal[]; onEdit: (deal: Deal) => void }) {
  const tone = (stage: Deal["stage"]) => stage === "Won" ? "success" : stage === "Negotiation" || stage === "Proposal" ? "warning" : "";
  return <div className="section-panel table-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>Opportunity</th><th>Value</th><th>Stage</th><th>Owner</th><th>Expected close</th><th /></tr></thead><tbody>{deals.map((deal) => <tr key={deal.id}><td><div className="table-name"><span className="person-avatar"><BriefcaseBusiness size={14} /></span><span>{deal.name}<span className="table-subtext">{deal.company} · {deal.id}</span></span></div></td><td style={{ fontWeight: 800, color: "var(--text)" }}>{formatCurrency(deal.value)}</td><td><span className={`status-pill ${tone(deal.stage)}`}>{deal.stage}</span></td><td>{deal.owner}</td><td>{deal.closeDate}</td><td><button className="icon-button" aria-label={`View ${deal.name}`} onClick={() => onEdit(deal)}><ChevronRight size={15} /></button></td></tr>)}</tbody></table></div>{deals.length === 0 ? <EmptyState title="No deals match" body="Try changing the search or create a new opportunity." /> : null}<div className="table-footer"><span>{deals.length} opportunities</span><span>Pipeline value: {formatCurrency(deals.reduce((sum, deal) => sum + deal.value, 0))}</span></div></div>;
}

import { Activity, ArrowUpRight } from "lucide-react";

export function MetricCard({ label, value, detail, icon: Icon, accent = false }: { label: string; value: string; detail: string; icon: typeof Activity; accent?: boolean }) {
  return <div className="section-panel stat-card"><div className="stat-top"><span className="stat-icon"><Icon size={17} /></span><span className={`status-pill ${accent ? "warning" : "success"}`}>{accent ? "In progress" : "Healthy"}</span></div><div className="stat-value-row"><span className="stat-value">{value}</span><ArrowUpRight size={15} color="var(--primary)" /></div><div className="stat-label" style={{ marginTop: 8 }}>{label}</div><div className="stat-foot">{detail}</div></div>;
}

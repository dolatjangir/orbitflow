import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow: string; title: string; subtitle: string; actions?: ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow"><Sparkles size={12} /> {eyebrow}</div><h1 className="page-title">{title}</h1><p className="page-subtitle">{subtitle}</p></div>{actions ? <div className="page-actions">{actions}</div> : null}</div>;
}

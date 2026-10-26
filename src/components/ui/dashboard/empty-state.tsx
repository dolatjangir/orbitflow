import type { ReactNode } from "react";
import { Search } from "lucide-react";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-state-icon"><Search size={20} /></div><h3>{title}</h3><p>{body}</p>{action}</div>;
}

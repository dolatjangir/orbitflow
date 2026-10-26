import type { ReactNode } from "react";

/** Shared route-group boundary for all authenticated-workspace pages.
 * The dashboard shell is mounted by DashboardApp to preserve its cross-page demo interactions.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}

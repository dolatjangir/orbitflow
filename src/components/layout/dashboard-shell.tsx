import type { ReactNode } from "react";

type Props = { sidebar: ReactNode; topbar: ReactNode; children: ReactNode };

/** Shared responsive application frame for all dashboard routes. */
export function DashboardShell({ sidebar, topbar, children }: Props) {
  return (
    <div className="app-frame" style={{ display: "flex", alignItems: "stretch" }}>
      {sidebar}
      <main className="app-main">
        {topbar}
        {children}
      </main>
    </div>
  );
}

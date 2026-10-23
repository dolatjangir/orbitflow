export default function Loading() {
  return (
    <main className="app-frame" style={{ minHeight: "100vh", padding: 28 }} aria-label="Loading workspace">
      <div className="section-panel" style={{ maxWidth: 1120, margin: "0 auto", padding: 24 }}>
        <div style={{ height: 12, width: 150, borderRadius: 999, background: "var(--surface-3)" }} />
        <div style={{ height: 34, width: "min(100%, 520px)", borderRadius: 9, background: "var(--surface-3)", marginTop: 18 }} />
        <div style={{ height: 14, width: "min(100%, 640px)", borderRadius: 999, background: "var(--surface-3)", marginTop: 12 }} />
        <div className="stats-grid" style={{ marginTop: 25 }}>{[1, 2, 3, 4].map((item) => <div key={item} className="section-panel" style={{ height: 140, background: "var(--surface-2)", borderColor: "var(--border)" }} />)}</div>
        <p className="page-subtitle" style={{ textAlign: "center", margin: "18px auto 0" }}>Preparing your workspace…</p>
      </div>
    </main>
  );
}

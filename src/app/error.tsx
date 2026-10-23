"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production, send this error to your monitoring service (for example, Sentry).
    console.error("OrbitFlow route error:", error);
  }, [error]);

  return (
    <main className="app-frame" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section className="section-panel panel-padding" style={{ width: "min(100%, 480px)", textAlign: "center" }}>
        <div className="empty-state-icon" style={{ marginBottom: 15 }}><AlertTriangle size={21} /></div>
        <h1 className="page-title" style={{ fontSize: 25 }}>Something went wrong</h1>
        <p className="page-subtitle" style={{ margin: "10px auto 20px" }}>The workspace could not load this view. You can retry without losing your place.</p>
        <button className="button button-primary" onClick={() => reset()}><RefreshCw size={14} /> Try again</button>
      </section>
    </main>
  );
}

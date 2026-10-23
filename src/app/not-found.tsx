import Link from "next/link";
import { ArrowLeft, Orbit } from "lucide-react";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "var(--page)" }}>
      <div className="section-panel panel-padding" style={{ width: "min(100%, 460px)", textAlign: "center" }}>
        <div className="empty-state-icon"><Orbit size={21} /></div>
        <p className="eyebrow" style={{ justifyContent: "center" }}>404 · Page not found</p>
        <h1 className="page-title" style={{ fontSize: 28 }}>This page drifted off course.</h1>
        <p className="page-subtitle" style={{ margin: "10px auto 20px" }}>The page may have moved, or this route is not part of the demo workspace.</p>
        <Link href="/" className="button button-primary"><ArrowLeft size={14} /> Back to overview</Link>
      </div>
    </main>
  );
}

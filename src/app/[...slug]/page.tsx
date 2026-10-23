import { notFound } from "next/navigation";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

const knownRoutes = new Set([
  "contacts", "deals", "whatsapp", "sms", "rcs", "email", "voice", "chatbot",
  "campaigns", "analytics", "settings", "help", "support", "integrations", "templates",
]);

export default async function DashboardSubPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const section = slug.join("/");
  if (!knownRoutes.has(section)) notFound();
  return <DashboardApp initialSection={section} />;
}

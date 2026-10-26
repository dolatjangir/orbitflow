import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: 'Integrations', description: 'Connect tools and plan provider setup.' };

export default function IntegrationsPage() {
  return <DashboardApp initialSection="integrations" />;
}

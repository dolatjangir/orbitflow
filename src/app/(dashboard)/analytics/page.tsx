import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: 'Analytics & insights', description: 'Review reach, engagement, and response metrics.' };

export default function AnalyticsPage() {
  return <DashboardApp initialSection="analytics" />;
}

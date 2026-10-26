import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: 'Campaigns', description: 'Plan, draft, and review customer communication campaigns.' };

export default function CampaignsPage() {
  return <DashboardApp initialSection="campaigns" />;
}

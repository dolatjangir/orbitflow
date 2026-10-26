import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: 'Deals pipeline', description: 'Track opportunities from first conversation through close.' };

export default function DealsPage() {
  return <DashboardApp initialSection="deals" />;
}

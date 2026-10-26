import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: 'Help & support', description: 'Find product guidance and support resources.' };

export default function HelpPage() {
  return <DashboardApp initialSection="help" />;
}

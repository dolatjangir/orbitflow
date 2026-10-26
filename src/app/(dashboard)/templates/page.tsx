import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: 'Message templates', description: 'Manage reusable message templates.' };

export default function TemplatesPage() {
  return <DashboardApp initialSection="templates" />;
}

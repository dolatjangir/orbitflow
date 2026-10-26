import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: 'Workspace settings', description: 'Manage workspace preferences.' };

export default function SettingsPage() {
  return <DashboardApp initialSection="settings" />;
}

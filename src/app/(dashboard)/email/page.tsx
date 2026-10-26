import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: 'Email workspace', description: 'Organize lifecycle messaging and announcements.' };

export default function EmailPage() {
  return <DashboardApp initialSection="email" />;
}

import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: 'RCS workspace', description: 'Explore branded rich mobile messaging.' };

export default function RcsPage() {
  return <DashboardApp initialSection="rcs" />;
}

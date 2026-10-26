import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: 'Contacts', description: 'Customer profiles, channel preferences, and engagement status.' };

export default function ContactsPage() {
  return <DashboardApp initialSection="contacts" />;
}

import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: 'SMS workspace', description: 'Prepare concise, timely SMS communication.' };

export default function SmsPage() {
  return <DashboardApp initialSection="sms" />;
}

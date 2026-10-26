import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: 'Chatbot & AI agents', description: 'Create support and sales agent drafts.' };

export default function ChatbotPage() {
  return <DashboardApp initialSection="chatbot" />;
}

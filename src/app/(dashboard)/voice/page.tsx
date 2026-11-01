import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";
import AIVoiceWorkspace from "@/components/dashboard/pages/ai-voice-workspace-before";

export const metadata: Metadata = { title: 'AI voice workspace', description: 'Design voice experiences and human handoff.' };

export default function VoicePage() {
  return <DashboardApp initialSection="voice" >
    <AIVoiceWorkspace/>
    </DashboardApp>;
}

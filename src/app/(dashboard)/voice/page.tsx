"use client";
import { useState } from "react";
import { DashboardApp } from "@/components/dashboard/dashboard-app";
import AIVoiceWorkspace from "@/components/dashboard/pages/ai-voice-workspace-before";
import AIVoiceConnected from "@/components/dashboard/pages/ai-voice-workspace-after";


export default function VoicePage() {
    const [activeView, setActiveView] = useState<"before" | "after">("before");
  return <DashboardApp initialSection="voice" >
    {/* <AIVoiceWorkspace/> */}
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setActiveView("before")}>Before</button><button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => setActiveView("after")}>After</button>
    {activeView === "before" ? <AIVoiceWorkspace  /> : <AIVoiceConnected/>
}
    </DashboardApp>;
}

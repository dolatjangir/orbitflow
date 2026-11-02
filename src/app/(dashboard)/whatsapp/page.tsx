"use client";
import { useState } from "react";
import { DashboardApp } from "@/components/dashboard/dashboard-app";
import WhatsAppPage from "@/components/dashboard/pages/whatsapp-workspace";
import WhatsAppConnected from "@/components/dashboard/pages/whatsapp-workspace-after";



export default function WhatsappPage() {
   const [activeView, setActiveView] = useState<"before" | "after">("before");
  return <DashboardApp initialSection="whatsapp">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setActiveView("before")}>Before</button><button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => setActiveView("after")}>After</button>
    {activeView === "before" ? <WhatsAppPage  /> :  <WhatsAppConnected/>
}
   
  </DashboardApp>;
}

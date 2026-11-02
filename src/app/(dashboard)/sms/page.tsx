"use client"
import { useState } from "react";
import { DashboardApp } from "@/components/dashboard/dashboard-app";
import SMSWorkspace from "@/components/dashboard/pages/sms-workspace";
import SMSConnected from "@/components/dashboard/pages/sms-workspace-after";



export default function SmsPage() {

   const [activeView, setActiveView] = useState<"before" | "after">("before"); 
  return <DashboardApp initialSection="sms" >
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setActiveView("before")}>Before</button><button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => setActiveView("after")}>After</button>
       {activeView === "before" ? <SMSWorkspace  /> :  <SMSConnected/>
   }
    
    </DashboardApp>;
}

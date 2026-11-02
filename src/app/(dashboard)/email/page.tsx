"use client";
import { useState } from "react";
import { DashboardApp } from "@/components/dashboard/dashboard-app";
import EmailWorkspace from "@/components/dashboard/pages/email-workspace";
import { EmailPageContent } from "@/components/dashboard/pages/email-page-content";
import EmailWorkspaceAfter from "@/components/dashboard/pages/email-workspace-after";


export default function EmailPage() {
  const connectChannel = (name: string) => {
    alert(
      `${name} connection flow is not configured yet. Please configure your provider credentials.`
    );
  };

     const [activeView, setActiveView] = useState<"before" | "after">("before"); 
  return( 
  
  <DashboardApp initialSection="email" >
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setActiveView("before")}>Before</button><button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => setActiveView("after")}>After</button>
            {activeView === "before" ? <EmailWorkspace  privacyHref="/"/> :    <EmailWorkspaceAfter/>
        }
  
    </DashboardApp>
  )
}

"use client";
import { useState } from "react";
import { DashboardApp } from "@/components/dashboard/dashboard-app";
import RCSWorkspace from "@/components/dashboard/pages/rcs-workspace";
import RCSConnected from "@/components/dashboard/pages/rcs-workspace-after";



export default function RcsPage() {
   const [activeView, setActiveView] = useState<"before" | "after">("before"); 
  return <DashboardApp initialSection="rcs">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setActiveView("before")}>Before</button><button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => setActiveView("after")}>After</button>
          {activeView === "before" ? <RCSWorkspace  /> :  <RCSConnected/>
      }

    </DashboardApp>;
}

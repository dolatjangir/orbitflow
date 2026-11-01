import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";
import SMSWorkspace from "@/components/dashboard/pages/sms-workspace";
import SMSConnected from "@/components/dashboard/pages/sms-workspace-after";

export const metadata: Metadata = { title: 'SMS workspace', description: 'Prepare concise, timely SMS communication.' };

export default function SmsPage() {
  return <DashboardApp initialSection="sms" >
    {/* <SMSWorkspace/> */}
    <SMSConnected/>
    </DashboardApp>;
}

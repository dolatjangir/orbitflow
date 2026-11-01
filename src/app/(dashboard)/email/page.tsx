import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";
import EmailWorkspace from "@/components/dashboard/pages/email-workspace";
import { EmailPageContent } from "@/components/dashboard/pages/email-page-content";
import EmailWorkspaceAfter from "@/components/dashboard/pages/email-workspace-after";

export const metadata: Metadata = { title: 'Email workspace', description: 'Organize lifecycle messaging and announcements.' };

export default function EmailPage() {

  const connectChannel = (name: string) => {
    alert(
      `${name} connection flow is not configured yet. Please configure your provider credentials.`
    );
  };
  
  return( 
  
  <DashboardApp initialSection="email" >
    {/* <EmailPageContent/> */}
    <EmailWorkspaceAfter/>
    </DashboardApp>
  )
}

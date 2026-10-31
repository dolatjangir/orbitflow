import { DashboardApp } from "@/components/dashboard/dashboard-app";
import InboxWorkspace from "@/components/dashboard/pages/InboxWorkspace";


export default function InboxPage() {
  return (
    <DashboardApp initialSection="inbox">
      <InboxWorkspace/>
    </DashboardApp>
  );
}
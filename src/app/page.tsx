import type { Metadata } from "next";
import { DashboardApp } from "@/components/dashboard/dashboard-app";

export const metadata: Metadata = { title: "Overview", description: "OrbitFlow customer engagement overview and workspace activity." };

export default function HomePage() {
  return <DashboardApp initialSection="overview" />;
}

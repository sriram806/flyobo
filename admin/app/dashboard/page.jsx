"use client";

import AllAnalyticsDashboard from "@/Components/Dashboard/AllAnalyticsDashboard";
import DashboardOverview from "@/Components/Dashboard/DashboardOverview";
import { useSearchParams } from "next/navigation";

export default function DashboardPage() {
  const params = useSearchParams();
  const tab = params?.get('tab') || 'list';
  return (
    <div className="space-y-6">
      {tab === "analytics" && <AllAnalyticsDashboard />}
      {tab === "overview" && <DashboardOverview />}
    </div>
  );
}

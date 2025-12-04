"use client";

import PlatformServices from "@/Components/Dashboard/PlatformServices";
import RevenueSystem from "@/Components/Dashboard/RevenueSystem";
import SiteAnalytics from "@/Components/Dashboard/SiteAnalytics";
import { useSearchParams } from "next/navigation";

export default function DashboardPage() {
  const params = useSearchParams();
  const tab = params?.get('tab') || 'list';
  return (
    <div className="space-y-6">
      <SiteAnalytics />
      <RevenueSystem />
      <PlatformServices />
    </div>
  );
}

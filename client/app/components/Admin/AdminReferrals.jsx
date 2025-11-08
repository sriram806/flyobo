"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/app/components/ui/skeleton";

const SimpleAdminReferrals = dynamic(() => import("@/app/admin/referrals/simple"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  ),
});

const AdminReferrals = () => {
  return (
    <div className="w-full">
      <SimpleAdminReferrals />
    </div>
  );
};

export default AdminReferrals;

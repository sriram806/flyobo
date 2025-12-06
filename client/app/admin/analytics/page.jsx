"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";
import AdminProtected from "@/Components/hooks/adminProtected";

export default function AdminAnalyticsPage() {
  const router = useRouter();

  return (
    <AdminProtected>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-10 flex flex-col items-center justify-center space-y-5 max-w-lg w-full border border-gray-200 dark:border-gray-700 text-center">
          {/* Icon */}
          <div className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 p-4 rounded-full">
            <Wrench size={40} />
          </div>

          {/* Title & Text */}
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Analytics — Under Maintenance
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            This section is temporarily unavailable while we perform updates.  
            Please check back soon.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => router.push("/admin")}
              className="px-5 py-2 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition duration-300"
            >
              Back to Dashboard
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </AdminProtected>
  );
}

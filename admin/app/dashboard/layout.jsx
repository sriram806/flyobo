"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import Header from '@/Components/Layout/Header';
import Sidebar from '@/Components/Sidebar';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const params = useSearchParams();
    const tab = params?.get('tab') || 'list';
    const go = (next) => router.push(`/dashboard?tab=${encodeURIComponent(next)}`);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
            <Header onToggleSidebar={() => setCollapsed((c) => !c)} sidebarCollapsed={collapsed} />
            <div className="flex flex-1">
                <Sidebar tab={tab} go={go} collapsed={collapsed} onToggleSidebar={() => setCollapsed((c) => !c)} />
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

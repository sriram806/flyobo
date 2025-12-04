"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import AllPackages from '@/Components/Package/AllPackages';
import EditPackage from '@/Components/Package/EditPackage';
import AllPackageAnalytics from '@/Components/Package/AllPackageAnalytics';
import CreatePackage from '@/Components/Package/CreatePackage';

export default function Page() {
    const params = useSearchParams();
    const tab = params?.get('tab') || 'list';

    return (
        <>
            <div className="flex">
                <main className="flex-1 pr-5 pl-5">
                    {tab === 'create' && <CreatePackage />}
                    {tab === 'packages' && <AllPackages />}
                    {tab === 'edit' && <EditPackage />}
                    {tab === 'analytics' && <AllPackageAnalytics />}
                </main>
            </div>
        </>
    );
}

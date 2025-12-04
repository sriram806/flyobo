"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import AdminContacts from '@/Components/Contact/Contact';
export default function Page() {
    const params = useSearchParams();
    const tab = params?.get('tab') || 'list';

    return (
        <>
            <div className="flex">
                <main className="flex-1 pr-5 pl-5">
                    <AdminContacts />
                </main>
            </div>
        </>
    );
}

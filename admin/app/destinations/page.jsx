"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import AllDestinationAnalytics from '@/Components/Destination/AllDestinationAnalytics';
import CreateDestination from '@/Components/Destination/CreateDestination';
import AllDestinations from '@/Components/Destination/AllDestinations';
import EditDestination from '@/Components/Destination/EditDestination';

export default function Page() {
  const params = useSearchParams();
  const tab = params?.get('tab') || 'list';

  return (
    <>
      <div className="flex">
        <main className="flex-1 pr-5 pl-5">
          {tab === 'analytics' && <AllDestinationAnalytics />}
          {tab === 'create' && <CreateDestination />}
          {tab === 'edit' && <EditDestination />}
          {tab === 'alldestinations' && <AllDestinations />}
        </main>
      </div>
    </>
  );
}

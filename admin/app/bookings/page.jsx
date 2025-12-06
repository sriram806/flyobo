"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import CreateBookingCustomer from '@/Components/Bookings/CreateBooking';
import AllBookings from '@/Components/Bookings/AllBookings';
import AllBookingsAnalytics from '@/Components/Bookings/AllBookingsAnalytics';

export default function Page() {
  const params = useSearchParams();
  const tab = params?.get('tab') || 'list';

  return (
    <>
      <div className="flex">
        <main className="flex-1 pr-5 pl-5">
          {tab === "create" && <CreateBookingCustomer />}
          {tab === "allbookings" && <AllBookings />}
          {tab === "analytics" && <AllBookingsAnalytics />}
        </main>
      </div>
    </>
  );
}

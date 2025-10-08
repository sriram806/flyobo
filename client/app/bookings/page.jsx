"use client";

import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import FavouriteBookings from '../components/Profile/FavouriteBookings';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import Heading from '../components/MetaData/Heading';
import { useState } from 'react';

export default function BookingsPage() {
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");
  const user = useSelector((state) => state?.auth?.user);
  const router = useRouter();

  return (
    <>
      <Heading 
        title="My Bookings | Flyobo" 
        description="View and manage your travel bookings. Track your trip history and upcoming adventures." 
        url="https://www.flyobo.com/bookings" 
      />
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FavouriteBookings />
        </div>
      </main>
      
      <Footer />
    </>
  );
}
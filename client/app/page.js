"use client";

import React, { useState } from 'react';
import Heading from './components/MetaData/Heading';
import Header from './components/Layout/Header';
import Hero from './components/Home/Hero';
import TopDestinations from './components/Home/TopDestinations';
import BoldShowcase from './components/Home/BoldShowcase';
import ReferralBanner from './components/Home/ReferralBanner';
import Newsletter from './components/Home/Newsletter';
import Footer from './components/Layout/Footer';
import WhatsApp from './components/styles/whatsapp';

const Home = () => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const [route, setRoute] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Heading
        title="Flyobo"
        description="Discover travel tips, destination guides, and vacation inspiration for your next adventure. Explore the world's amazing places with expert advice, top itineraries, and travel deals tailored for every kind of explorer."
        keywords="Travel, Adventure, Destinations, Vacation, Itineraries, Hotels, Flights, Tourism, Sightseeing, Travel Tips, Holiday, Guided Tours, Budget Travel, Luxury Travel, Family Travel, Solo Travel, Travel Deals"
        url="https://www.flyobo.com"
      />
      <Header
        open={open}
        setOpen={setOpen}
        activeItem={activeItem}
        setRoute={setRoute}
        route={route}
      />
      <Hero />
      <TopDestinations />
      <BoldShowcase />
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <ReferralBanner />
      </div>
      <Newsletter />
      <Footer />
      <WhatsApp />
    </div>
  );
};

export default Home;
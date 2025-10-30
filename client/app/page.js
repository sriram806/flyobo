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
import SEO from './components/MetaData/SEO';
import { WebsiteStructuredData, OrganizationStructuredData } from './components/MetaData/StructuredData';
import FeaturedPackages from './components/Home/FeaturedPackages';
import Testimonials from './components/Home/Testimonials';
import TravelBlog from './components/Home/TravelBlog';
import TravelStats from './components/Home/TravelStats';
import SpecialOffers from './components/Home/SpecialOffers';
import WhyChooseUs from './components/Home/WhyChooseUs';
import ThemeTest from './components/Debug/ThemeTest';
import { useTheme } from 'next-themes';

const Home = () => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const [route, setRoute] = useState("");
  const { theme, setTheme } = useTheme();

  return (
    <>
      <SEO 
        title="Discover Amazing Travel Experiences"
        description="Discover travel tips, destination guides, and vacation inspiration for your next adventure. Explore the world's amazing places with expert advice, top itineraries, and travel deals tailored for every kind of explorer."
        keywords="Travel, Adventure, Destinations, Vacation, Itineraries, Hotels, Flights, Tourism, Sightseeing, Travel Tips, Holiday, Guided Tours, Budget Travel, Luxury Travel, Family Travel, Solo Travel, Travel Deals"
        url="https://www.flyobo.com"
      />
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <ThemeTest />
        <div className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 p-2 rounded shadow-lg">
          <div className="text-sm mb-1">Current: {theme}</div>
          <div className="flex gap-1">
            <button 
              onClick={() => setTheme("light")}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded"
            >
              Light
            </button>
            <button 
              onClick={() => setTheme("dark")}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded"
            >
              Dark
            </button>
          </div>
        </div>
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
        <TravelStats />
        <SpecialOffers />
        <FeaturedPackages />
        <WhyChooseUs />
        <TopDestinations />
        <BoldShowcase />
        <Testimonials />
        <TravelBlog />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <ReferralBanner />
        </div>
        <Newsletter />
        <Footer />
        <WhatsApp />
      </div>
    </>
  );
};

export default Home;
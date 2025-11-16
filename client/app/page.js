"use client";

import React, { useState } from 'react';
import Heading from './components/MetaData/Heading';
import Header from './components/Layout/Header';
import { HomeContentProvider } from './context/HomeContentContext';
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
// SpecialOffers removed as per redesign request
import HomeStats from './components/Home/HomeStats';

const Home = () => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const [route, setRoute] = useState("");

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
        <HomeContentProvider>
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

          {/* Key metrics */}
          <HomeStats />

          {/* Main content: Featured packages + Top destinations */}
          <main className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <section aria-labelledby="featured-packages">
                  <h2 id="featured-packages" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Featured Packages</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Handpicked travel experiences, curated for every traveler.</p>
                  <FeaturedPackages />
                </section>
              </div>

              <aside className="lg:col-span-1">
                <section aria-labelledby="top-destinations" className="sticky top-24">
                  <h3 id="top-destinations" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Destinations</h3>
                  <TopDestinations />
                </section>
              </aside>
            </div>
          </main>

          {/* Offers and showcases */}
          <BoldShowcase />

          <Testimonials />
          <TravelBlog />

          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
            <ReferralBanner />
          </div>

          <Newsletter />
          <Footer />
          <WhatsApp />
        </HomeContentProvider>
      </div>
    </>
  );
};

export default Home;
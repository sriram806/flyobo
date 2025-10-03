"use client";

import React, { useState } from 'react';
import Heading from './components/MetaData/Heading';
import Header from './components/Layout/Header';
import Hero from './components/Home/Hero';
import TopDestinations from './components/Home/TopDestinations';
import BoldShowcase from './components/Home/BoldShowcase';
import Newsletter from './components/Home/Newsletter';
import Footer from './components/Layout/Footer';

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
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Home;
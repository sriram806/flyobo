"use client";

import BoldShowcase from "@/Components/Home/BoldShowcase";
import FeaturedPackages from "@/Components/Home/FeaturedPackages";
import Hero from "@/Components/Home/Hero";
import Newsletter from "@/Components/Home/Newsletter";
import ReferralBanner from "@/Components/Home/ReferralBanner";
import Testimonials from "@/Components/Home/Testimonials";
import TopDestinations from "@/Components/Home/TopDestinations";
import Footer from "@/Components/Layout/Footer";
import Header from "@/Components/Layout/Header";
import Heading from "@/Components/MetaData/Heading";
import SEO from "@/Components/MetaData/SEO";
import { OrganizationStructuredData, WebsiteStructuredData } from "@/Components/MetaData/StructuredData";
import { useState } from "react";


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
          <FeaturedPackages />
          <TopDestinations />
          <BoldShowcase />

          <Testimonials />

          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
            <ReferralBanner />
          </div>

          <Newsletter />
          <Footer />
      </div>
    </>
  );
};

export default Home;
// Example package detail page showing SEO implementation
// This is just an example and would need to be integrated with your actual package data

"use client";

import React, { useState } from 'react';
import SEO from '../../components/MetaData/SEO';
import { PackageStructuredData } from '../../components/MetaData/StructuredData';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';

const PackageDetailExample = ({ packageData }) => {
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");

  // Example package data - in a real implementation, this would come from your API
  const examplePackage = {
    id: 'beach-paradise-resort',
    name: 'Beach Paradise Resort',
    description: 'Experience luxury and relaxation at our Beach Paradise Resort. This all-inclusive package includes 7 nights accommodation, daily meals, and access to all resort amenities.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    price: 1299,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 124,
    destination: 'Maldives',
    duration: 7,
    included: [
      '7 nights accommodation',
      'All meals included',
      'Airport transfers',
      'Snorkeling equipment',
      'Spa access'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival and Welcome',
        description: 'Arrive at Malé International Airport. Transfer to resort and check-in. Welcome dinner at the resort restaurant.'
      },
      {
        day: 2,
        title: 'Beach Day',
        description: 'Full day at leisure on the pristine white sand beach. Optional snorkeling or water sports.'
      }
    ]
  };

  return (
    <>
      <SEO 
        title={`${examplePackage.name} - Luxury Travel Package`}
        description={examplePackage.description}
        keywords={`travel package, ${examplePackage.destination}, luxury resort, beach vacation, all inclusive`}
        url={`https://www.flyobo.com/packages/${examplePackage.id}`}
        ogType="product"
      />
      <PackageStructuredData 
        name={examplePackage.name}
        description={examplePackage.description}
        image={examplePackage.image}
        price={examplePackage.price}
        currency={examplePackage.currency}
        rating={examplePackage.rating}
        reviewCount={examplePackage.reviewCount}
        destination={examplePackage.destination}
      />
      
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <img 
                src={examplePackage.image} 
                alt={examplePackage.name}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{examplePackage.name}</h1>
              <div className="mt-2 flex items-center">
                <div className="flex text-amber-400">
                  {'★'.repeat(5)}
                </div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {examplePackage.rating} ({examplePackage.reviewCount} reviews)
                </span>
              </div>
              
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                {examplePackage.description}
              </p>
              
              <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
                <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                  ${examplePackage.price}
                  <span className="text-lg font-normal text-gray-600 dark:text-gray-400"> / person</span>
                </div>
                <div className="mt-2 text-gray-600 dark:text-gray-400">
                  {examplePackage.duration} days • {examplePackage.destination}
                </div>
                
                <button className="mt-6 w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-xl transition">
                  Book Now
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What's Included</h2>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {examplePackage.included.map((item, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default PackageDetailExample;
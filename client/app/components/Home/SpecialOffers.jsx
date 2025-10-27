"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiClock, FiTag, FiAward, FiPercent } from "react-icons/fi";
import Link from "next/link";

const offers = [
  {
    id: 1,
    title: "Early Bird Special",
    description: "Book 60 days in advance and save up to 25% on selected packages",
    discount: "25% OFF",
    validity: "Valid until Dec 31, 2025",
    bgColor: "from-amber-500 to-orange-500"
  },
  {
    id: 2,
    title: "Group Travel Deal",
    description: "Travel with friends and family? Get special group rates for 4+ travelers",
    discount: "15% OFF",
    validity: "Valid for all group bookings",
    bgColor: "from-emerald-500 to-teal-500"
  },
  {
    id: 3,
    title: "Weekend Getaway",
    description: "Escape the weekend stress with our exclusive weekend package deals",
    discount: "20% OFF",
    validity: "Fri-Sun bookings only",
    bgColor: "from-purple-500 to-indigo-500"
  }
];

const SpecialOfferCard = ({ offer }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set expiry date to 30 days from now for demo purposes
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiryDate.getTime() - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <motion.div
      className={`bg-gradient-to-br ${offer.bgColor} rounded-2xl p-6 text-white shadow-lg`}
      whileHover={{ y: -5 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{offer.title}</h3>
          <p className="text-white/90 mt-1">{offer.description}</p>
        </div>
        <div className="bg-white/20 rounded-full p-2">
          <FiTag size={20} />
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="bg-white text-gray-900 font-bold text-lg px-3 py-1 rounded-full">
          {offer.discount}
        </div>
        <div className="text-sm text-white/80 flex items-center">
          <FiClock className="mr-1" />
          {offer.validity}
        </div>
      </div>
      
      {timeLeft.days > 0 && (
        <div className="bg-white/20 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>Days</span>
            <span>Hours</span>
            <span>Mins</span>
            <span>Secs</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>{timeLeft.days.toString().padStart(2, '0')}</span>
            <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
          </div>
        </div>
      )}
      
      <Link 
        href="/packages"
        className="block w-full text-center bg-white text-gray-900 font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        Claim Offer
      </Link>
    </motion.div>
  );
};

const SpecialOffers = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mb-4">
            <FiPercent size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Special Offers</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Limited time deals to make your travel dreams come true
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <SpecialOfferCard key={offer.id} offer={offer} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            href="/packages"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View All Packages
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
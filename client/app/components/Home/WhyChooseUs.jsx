"use client";

import { FiCheckCircle, FiShield, FiHeart, FiGlobe, FiHeadphones, FiAward } from "react-icons/fi";
import { motion } from "framer-motion";

const features = [
  {
    id: 1,
    icon: FiCheckCircle,
    title: "Verified & Trusted",
    description: "All our partners and packages are thoroughly vetted for quality and safety."
  },
  {
    id: 2,
    icon: FiShield,
    title: "Secure Booking",
    description: "Your payments and personal information are protected with industry-leading security."
  },
  {
    id: 3,
    icon: FiHeart,
    title: "Personalized Service",
    description: "Tailored recommendations based on your preferences and travel history."
  },
  {
    id: 4,
    icon: FiGlobe,
    title: "Global Coverage",
    description: "Access to 500+ destinations across 50+ countries worldwide."
  },
  {
    id: 5,
    icon: FiHeadphones,
    title: "24/7 Support",
    description: "Round-the-clock assistance from our travel experts wherever you are."
  },
  {
    id: 6,
    icon: FiAward,
    title: "Award Winning",
    description: "Recognized by industry experts for excellence in travel services."
  }
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose Flyobo?</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            We make travel planning effortless with our unique approach
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to start your journey?
              </h3>
              <p className="text-blue-100 mb-6">
                Join thousands of satisfied travelers who have discovered the world with Flyobo. 
                Our expert team is ready to help you plan the perfect trip.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/20 rounded-full px-4 py-2 text-sm">
                  ✓ No hidden fees
                </div>
                <div className="bg-white/20 rounded-full px-4 py-2 text-sm">
                  ✓ Price match guarantee
                </div>
                <div className="bg-white/20 rounded-full px-4 py-2 text-sm">
                  ✓ 24/7 customer support
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://ui-avatars.com/api/?name=User+${i}&background=0D8ABC&color=fff&size=40`}
                      alt={`User ${i}`}
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                  ))}
                </div>
                <div className="ml-3">
                  <div className="flex text-amber-400">
                    {'★'.repeat(5)}
                  </div>
                  <p className="text-sm text-white/80">4.9/5 from 2,500+ reviews</p>
                </div>
              </div>
              <blockquote className="text-white/90 italic">
                "Flyobo made planning our European tour so easy. The personalized recommendations 
                and 24/7 support gave us peace of mind throughout our journey."
              </blockquote>
              <p className="mt-3 text-sm text-white/70">— Sarah Johnson, Paris</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
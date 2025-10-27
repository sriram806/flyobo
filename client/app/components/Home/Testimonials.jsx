"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare } from "lucide-react";

// 🌄 Telugu / South India-inspired testimonials
const testimonials = [
  {
    id: 1,
    name: "Sai Teja Reddy",
    role: "Adventure Enthusiast",
    content:
      "My trip to Araku Valley was breathtaking! The scenic train route, tribal coffee experience, and nature trails made it truly memorable. Flyobo managed everything flawlessly.",
    avatar:
      "https://ui-avatars.com/api/?name=Sai+Teja+Reddy&background=2563EB&color=fff",
    rating: 5,
    location: "Araku Valley, Andhra Pradesh",
  },
  {
    id: 2,
    name: "Keerthana Duvvuri",
    role: "Family Traveler",
    content:
      "We had a wonderful time at Lambasingi — waking up to misty mornings felt magical! The local homestay, food, and hospitality were beyond expectations. Thank you, Flyobo!",
    avatar:
      "https://ui-avatars.com/api/?name=Keerthana+Duvvuri&background=F97316&color=fff",
    rating: 5,
    location: "Lambasingi, Visakhapatnam District",
  },
  {
    id: 3,
    name: "Harsha Vardhan G",
    role: "Solo Explorer",
    content:
      "Exploring Gandikota was a dream come true! The canyon views and camping experience were thrilling. Flyobo’s guides were friendly and ensured a safe journey.",
    avatar:
      "https://ui-avatars.com/api/?name=Harsha+Vardhan&background=DC2626&color=fff",
    rating: 5,
    location: "Gandikota, Kadapa District",
  },
];

const TestimonialCard = ({ testimonial, isActive }) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`rounded-2xl p-6 bg-white/90 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-md backdrop-blur-sm transition-all ${
        isActive ? "ring-2 ring-indigo-500/70" : ""
      }`}
    >
      <div className="flex items-center gap-4 mb-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-300 dark:border-gray-700"
        />
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            {testimonial.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {testimonial.role}
          </p>
        </div>
      </div>

      <div className="relative">
        <MessageSquare className="absolute left-0 top-0 text-indigo-300 dark:text-indigo-600 h-4 w-4" />
        <p className="pl-5 text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
          {testimonial.content}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
          📍 {testimonial.location}
        </span>
        <div className="flex gap-1 text-amber-500">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} size={14} fill="currentColor" stroke="none" />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3"
        >
          Traveler Stories from Andhra
        </motion.h2>

        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 text-sm md:text-base">
          Real journeys, heartfelt moments — shared by travelers who explored
          the beauty of Andhra Pradesh and South India with Flyobo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={t.id}
              testimonial={t}
              isActive={i === activeIndex}
            />
          ))}
        </div>

        <div className="mt-12">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setActiveIndex((prev) => (prev + 1) % testimonials.length)
            }
            className="px-6 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Show Another Story
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

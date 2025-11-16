"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiStar, FiMessageSquare } from "react-icons/fi";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Adventure Traveler",
    content: "Flyobo made our honeymoon to Bali absolutely perfect! The attention to detail and personalized service exceeded our expectations. We'll definitely be booking with them again.",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff",
    rating: 5,
    location: "Bali, Indonesia"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Business Traveler",
    content: "As a frequent business traveler, I appreciate Flyobo's seamless booking process and reliable service. Their 24/7 support team has always been there when I needed them.",
    avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=7879F1&color=fff",
    rating: 5,
    location: "Tokyo, Japan"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Family Vacationer",
    content: "Traveling with three kids can be challenging, but Flyobo made it so easy! Their family-friendly packages and thoughtful recommendations made our trip to Europe unforgettable.",
    avatar: "https://ui-avatars.com/api/?name=Emma+Rodriguez&background=F59E0B&color=fff",
    rating: 5,
    location: "Paris, France"
  },
  {
    id: 4,
    name: "David Wilson",
    role: "Solo Traveler",
    content: "As a solo traveler, safety and local experiences are my top priorities. Flyobo delivered both with their carefully curated solo traveler packages and local guide connections.",
    avatar: "https://ui-avatars.com/api/?name=David+Wilson&background=10B981&color=fff",
    rating: 5,
    location: "Cusco, Peru"
  },
  {
    id: 5,
    name: "Priya Sharma",
    role: "Luxury Traveler",
    content: "The luxury package to Maldives was beyond words. Every detail was perfect, from the private villa to the personalized dining experiences. Flyobo truly understands luxury travel.",
    avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=EF4444&color=fff",
    rating: 5,
    location: "Maldives"
  },
  {
    id: 6,
    name: "James Thompson",
    role: "Budget Traveler",
    content: "I was skeptical about budget travel until I tried Flyobo. They helped me plan an amazing two-week trip across Southeast Asia without breaking the bank. Incredible value!",
    avatar: "https://ui-avatars.com/api/?name=James+Thompson&background=8B5CF6&color=fff",
    rating: 5,
    location: "Bangkok, Thailand"
  }
];

const TestimonialCard = ({ testimonial, isActive }) => {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${
        isActive ? "ring-2 ring-blue-500" : ""
      }`}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center mb-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="ml-4">
          <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
        </div>
        <div className="ml-auto flex items-center text-amber-500">
          {[...Array(testimonial.rating)].map((_, i) => (
            <FiStar key={i} className="fill-current" />
          ))}
        </div>
      </div>
      
      <div className="relative">
        <FiMessageSquare className="absolute top-0 left-0 text-gray-300 dark:text-gray-600 text-2xl" />
        <p className="text-gray-700 dark:text-gray-300 pl-6 mt-2">
          {testimonial.content}
        </p>
      </div>
      
      <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
        <span>{testimonial.location}</span>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const scrollToIndex = (index) => {
    const container = containerRef.current;
    if (!container) return;
    const card = container.children[index];
    if (!card) return;
    container.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
    setActiveIndex(index);
  };

  const next = () => scrollToIndex((activeIndex + 1) % testimonials.length);
  const prev = () => scrollToIndex((activeIndex - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What Our Travelers Say</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Don't just take our word for it - hear from travelers who've experienced Flyobo
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={prev} aria-label="Previous testimonials" className="p-2 rounded-md bg-white dark:bg-gray-800 shadow">
              ◀
            </button>
            <button onClick={next} aria-label="Next testimonials" className="p-2 rounded-md bg-white dark:bg-gray-800 shadow">
              ▶
            </button>
          </div>
        </div>

        <div ref={containerRef} className="flex gap-6 overflow-x-auto pb-4" role="list" aria-label="Customer testimonials">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} style={{ minWidth: 320 }} role="listitem">
              <TestimonialCard 
                testimonial={testimonial} 
                isActive={index === activeIndex}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => next()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Read More Reviews
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
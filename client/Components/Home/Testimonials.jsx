"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiStar, FiMessageSquare, FiMapPin, FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * Testimonials data: Indian + global mix.
 * Some entries include light Telugu/Hinglish slang for authenticity.
 */
const TESTIMONIALS = [
  {
    id: 1,
    name: "Anusha Reddy",
    role: "Software Engineer",
    content:
      "Goa trip enti ante next level vibe! Flyobo arranged a beach resort and night cruise — super smooth and value for money. Bro, beach la sunsets marchipoledu.",
    avatar: "https://ui-avatars.com/api/?name=Anusha+Reddy&background=FDE8F0&color=7C3A5A",
    rating: 5,
    location: "Goa, India",
  },
  {
    id: 2,
    name: "Vikram Teja",
    role: "Startup Founder",
    content:
      "Manali snow experience was amazing. Cabin stay with mountain view — Flyobo support quick ga respond chesaru when flights changed. Highly recommended.",
    avatar: "https://ui-avatars.com/api/?name=Vikram+Teja&background=EEF2FF&color=3B1B6E",
    rating: 4.7,
    location: "Manali, Himachal Pradesh",
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Luxury Traveler",
    content:
      "Maldives package was pure luxury. Private villa, personalized dining — Flyobo understood every little detail. Best honeymoon ever.",
    avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=FFF1F0&color=9B2B2B",
    rating: 5,
    location: "Maldives",
  },
  {
    id: 4,
    name: "Arjun Reddy",
    role: "Travel Vlogger",
    content:
      "Kerala backwaters lo boat house stay antaga relax aindi — food and scenery top-notch. Camera ki perfect shots kuda vachayi. Next trip ready!",
    avatar: "https://ui-avatars.com/api/?name=Arjun+Reddy&background=EFF6FF&color=0B4A6F",
    rating: 4.9,
    location: "Alleppey, Kerala",
  },
  {
    id: 5,
    name: "Maria Gomez",
    role: "Digital Nomad",
    content:
      "Bali was a dream — yoga mornings, cafes, and surf. Flyobo curated experiences that felt local and genuine. Loved it!",
    avatar: "https://ui-avatars.com/api/?name=Maria+Gomez&background=FFF7ED&color=8C4A2F",
    rating: 4.6,
    location: "Bali, Indonesia",
  },
  {
    id: 6,
    name: "David Wilson",
    role: "Solo Traveler",
    content:
      "Cusco & Machu Picchu were expertly planned. Local guide recommendations and safety tips were on point. Smooth adventure overall.",
    avatar: "https://ui-avatars.com/api/?name=David+Wilson&background=EEF7F2&color=146A3C",
    rating: 4.8,
    location: "Cusco, Peru",
  },
];

/* ----------------------
   Small UI helper components
   ---------------------- */

const AnimatedStars = ({ rating = 5 }) => {
  // rating can be decimal (e.g., 4.7). We'll show full stars and a faint partial star
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  const stars = [...Array(full)];
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {stars.map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: [1, 1.06, 1], opacity: 1 }}
          transition={{ duration: 0.8, delay: i * 0.06 }}
          className="text-amber-500"
        >
          <FiStar />
        </motion.span>
      ))}
      {half && (
        <span className="text-amber-400 opacity-80">
          <FiStar />
        </span>
      )}
    </div>
  );
};

/* ----------------------
   Testimonial Card
   ---------------------- */

const TestimonialCard = ({ t, isActive }) => {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-2xl p-6 min-h-[220px] bg-white/90 dark:bg-[#0b0b10]/80 border border-gray-200/60 dark:border-gray-700/40 shadow-sm ${
        isActive ? "ring-2 ring-sky-200/60 dark:ring-sky-400/40" : ""
      }`}
      aria-label={`Review by ${t.name}`}
    >
      <div className="flex items-start gap-4">
        <img
          src={t.avatar}
          alt={t.name}
          className="w-12 h-12 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
        />

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <AnimatedStars rating={t.rating} />
            </div>
          </div>

          <div className="mt-3 flex items-start gap-3">
            <div className="text-gray-300 dark:text-gray-600 mt-1">
              <FiMessageSquare />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{t.content}</p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <FiMapPin className="text-sm" />
            <span>{t.location}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

/* ----------------------
   Main Testimonials Slider
   ---------------------- */

export default function Testimonials() {
  const containerRef = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const SLIDE_INTERVAL = 4000; // S1 = 6s

  // Auto-slide timer with pause-on-hover/focus:
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((s) => (s + 1) % TESTIMONIALS.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [paused]);

  // Scroll to active index
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const card = container.children[active];
    if (!card) return;
    // smooth center alignment: scroll so card's left sits with some offset
    const offset = card.offsetLeft - 16;
    container.scrollTo({ left: offset, behavior: "smooth" });
  }, [active]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") setActive((s) => (s + 1) % TESTIMONIALS.length);
      if (e.key === "ArrowLeft") setActive((s) => (s - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Pause on mouse enter / focus
  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);

  // Swipe support (basic)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startX = 0;
    let moved = false;

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
      moved = false;
      setPaused(true);
    };
    const onTouchMove = (e) => {
      const dx = e.touches[0].clientX - startX;
      if (Math.abs(dx) > 10) moved = true;
    };
    const onTouchEnd = (e) => {
      setPaused(false);
      if (!moved) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (dx < -30) setActive((s) => (s + 1) % TESTIMONIALS.length);
      if (dx > 30) setActive((s) => (s - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <section
      className="py-12 md:py-16"
      aria-labelledby="testimonials-heading"
    >
      {/* Pastel Premium background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#fffaf7] via-[#f7eff8] to-[#f3f7ff] dark:from-[#0b0b0f] dark:via-[#0f0b12] dark:to-[#08060a]" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 id="testimonials-heading" className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              What Our Travelers Say
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xl">
              Real stories from travelers — honest, local, and curated for Flyobo.
            </p>
          </div>
        </div>

        {/* Slider container */}
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleMouseEnter}
          onBlur={handleMouseLeave}
          className="relative flex gap-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory touch-pan-x"
          role="list"
          aria-label="Customer testimonials"
        >
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={t.id}
              role="listitem"
              style={{ minWidth: 340 }}
              className="snap-center"
            >
              <TestimonialCard t={t} isActive={idx === active} />
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="mt-6 flex items-center justify-center gap-3">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === active ? "bg-sky-400 dark:bg-sky-300 scale-110" : "bg-gray-300 dark:bg-gray-600"
              }`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

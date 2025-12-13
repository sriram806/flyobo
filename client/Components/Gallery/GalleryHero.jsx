"use client";
import { motion } from "framer-motion";

const GalleryHero = () => {
  return (
    <div className="relative">
      <div className="relative z-10 text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-4"
        >
          <span className="bg-linear-to-r from-gray-900 via-sky-600 to-indigo-800 dark:from-white dark:via-sky-200 dark:to-indigo-200 bg-clip-text text-transparent">
            Travel Gallery
          </span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-4"
        >
          Discover beautiful travel moments and share your own journeys with the community.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <a
            href="/contact"
            className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-sm shadow-lg transition-all"
          >
            Share your photo
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default GalleryHero;

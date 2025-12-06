"use client";
import { motion } from "framer-motion";

const GalleryHero = ({ stats }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1 left-0 w-80 h-52 bg-sky-400 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0.5 right-1 w-70 h-60 bg-sky-500  blur-3xl rounded-full animate-pulse" />
      </div>
      <div className="relative z-10 p-10 sm:p-14 text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-4"
        >
          <span className="bg-gradient-to-r from-gray-900 via-sky-600 to-indigo-800 dark:from-white dark:via-sky-200 dark:to-indigo-200 bg-clip-text text-transparent">
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

          <a
            href="/gallery"
            className="px-5 py-2.5 rounded-full bg-white text-gray-800 dark:text-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            Browse all
          </a>
        </motion.div>

        {/* Stats */}
        <div className="flex items-center justify-center flex-wrap gap-4">
          
          {/* Photos Count */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="px-6 py-4 rounded-2xl bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-lg flex items-center gap-4"
          >
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Photos: {stats.photos} </p>
            </div>
          </motion.div>

          {/* Destinations Count */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="px-6 py-4 rounded-2xl bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-lg flex items-center gap-4"
          >
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Destinations: 50+</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GalleryHero;

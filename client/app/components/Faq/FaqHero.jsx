"use client";
import { motion } from "framer-motion";

const FaqHero = () => {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1 left-0 w-45 h-30 bg-sky-400 blur-3xl rounded-full animate-pulse" />
                <div className="absolute bottom-0.5 right-1 w-45 h-30 bg-sky-500  blur-3xl rounded-full animate-pulse" />
            </div>
            <div className="relative z-10 p-10 sm:p-14 text-center">
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-4"
                >
                    <span className="bg-gradient-to-r from-gray-900 via-sky-600 to-indigo-800 dark:from-white dark:via-sky-200 dark:to-indigo-200 bg-clip-text text-transparent">
                        Frequently Asked Questions
                    </span>
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-4"
                >
                    Get instant answers to bookings, customization, payments, and support queries.
                </motion.p>
            </div>
        </div>
    );
};

export default FaqHero;

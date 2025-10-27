"use client";

import { FiSearch, FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Hero = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const user = useSelector((state) => state?.auth?.user);
    const stats = [
        { number: '15K+', label: 'Happy Travelers' },
        { number: '120+', label: 'Destinations' },
        { number: '50+', label: 'Countries' },
        { number: '24/7', label: 'Support' },
    ];

    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;
        router.push(`/packages?q=${encodeURIComponent(q)}`);
    };
    return (
        <div>
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 dark:from-black/80 via-transparent to-transparent"></div>
                    <Image
                        src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        alt="Snowy mountains with a winding road at sunset"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                    />
                </div>

                {/* Hero Content */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto"
                    >
                        {user && (
                            <div className="mb-3 text-lg md:text-xl text-gray-100">
                                Welcome, <span className="font-semibold">{user?.name || user?.email}</span> 👋
                            </div>
                        )}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Discover Your Next <span className="text-rose-500">Adventure</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-200">
                            Explore the most beautiful places on Earth. Find and book amazing experiences at the best prices.
                        </p>

                        {/* Search Bar */}
                        <motion.div
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2 max-w-3xl mx-auto mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Where do you want to go?"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border-0 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiCalendar className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="When?"
                                        onFocus={(e) => (e.target.type = 'date')}
                                        onBlur={(e) => (e.target.type = 'text')}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border-0 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiUsers className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select className="w-full pl-10 pr-4 py-3 rounded-lg border-0 text-gray-900 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-rose-500 focus:outline-none appearance-none bg-white">
                                        <option value="">Travelers</option>
                                        <option value="1">1 Traveler</option>
                                        <option value="2">2 Travelers</option>
                                        <option value="3">3 Travelers</option>
                                        <option value="4">4+ Travelers</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-medium transition duration-300 flex items-center justify-center gap-2"
                                >
                                    <FiSearch className="h-5 w-5" />
                                    <span>Search</span>
                                </button>
                            </form>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold mb-1">{stat.number}</div>
                                    <div className="text-sm md:text-base text-gray-300">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="animate-bounce flex flex-col items-center">
                        <span className="text-white text-sm mb-2">Scroll Down</span>
                        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
                            <div className="w-1 h-2 bg-white rounded-full animate-bounce"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Hero
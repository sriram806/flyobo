import React from 'react'

const Banner = ({title,}) => {
    return (
        <section className="relative overflow-hidden py-4">
        <div className="relative mx-auto max-w-7xl">
          <div className="rounded-3xl bg-gradient-to-r from-sky-100/70 to-blue-100/70 dark:from-sky-900/30 dark:to-blue-900/30 p-10 sm:p-16 text-center shadow-lg backdrop-blur-sm border border-white/40 dark:border-gray-800">
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent dark:from-sky-400 dark:to-blue-300">
              Discover Your Perfect Journey
            </h1>

            <p className="mt-4 text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
              Explore our handpicked selection of travel packages across India.
              <br className="hidden sm:block" />
              From <span className="font-semibold text-sky-700 dark:text-sky-300">serene beaches</span> to{" "}
              <span className="font-semibold text-blue-700 dark:text-blue-300">majestic mountains</span>,
              find your dream destination today.
            </p>

            <div className="mt-8 flex justify-center">
              <a
                href="#packages"
                className="inline-flex items-center px-6 py-3 rounded-full bg-sky-600 text-white font-medium text-sm sm:text-base shadow-md hover:bg-sky-700 transition-all duration-200"
              >
                ✈️ Explore Packages
              </a>
            </div>
          </div>
        </div>
      </section>

    )
}

export default Banner
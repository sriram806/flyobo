"use client";
import Link from "next/link";
import React from "react";

export const navItemsData = [
  { name: "Home", url: "/" },
  { name: "Packages", url: "/packages" },
  { name: "About", url: "/about" },
  { name: "Gallery", url: "/gallery" },
  { name: "FAQ", url: "/faq" },
];

const Navitems = ({ activeItem, isMobile }) => {
  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {navItemsData.map((item, index) => (
          <Link href={item.url} key={index}>
            <span
              className={`${
                activeItem === index
                  ? "text-sky-600 dark:text-sky-300"
                  : "text-gray-800 dark:text-gray-200"
              } text-lg font-medium tracking-wide transition-all duration-300 hover:text-sky-500 dark:hover:text-sky-400`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="md:hidden mt-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
          <div className="w-full text-center py-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/">
              <span className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-sky-700 dark:from-sky-300 dark:to-sky-500 text-transparent bg-clip-text">
                Flyobo
              </span>
            </Link>
          </div>
          {navItemsData.map((item, index) => (
            <Link href={item.url} key={index}>
              <span
                className={`block py-4 px-6 text-lg font-medium transition-all duration-300 ${
                  activeItem === index
                    ? "text-sky-600 dark:text-sky-300"
                    : "text-gray-800 dark:text-gray-200 hover:text-sky-500 dark:hover:text-sky-400"
                }`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default Navitems;

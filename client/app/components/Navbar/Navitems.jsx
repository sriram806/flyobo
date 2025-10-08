"use client";
import Link from "next/link";
import React from "react";

export const navItemsData = [
  { name: "Home", url: "/" },
  { name: "Packages", url: "/packages" },
  { name: "About", url: "/about" },
  { name: "Gallery", url: "/gallery" },
  { name: "Wishlist", url: "/wishlist" },
  { name: "My Bookings", url: "/bookings" },
  { name: "FAQ", url: "/faq" },
];

const Navitems = ({ activeItem, isMobile }) => {
  return (
    <>
      <div className="hidden md:flex items-center space-x-6">
        {navItemsData.map((item, index) => (
          <Link href={item.url} key={index}>
            <span
              className={`${
                activeItem === index
                  ? "text-rose-600 dark:text-sky-300"
                  : "text-gray-900 dark:text-white"
              } text-lg font-medium transition-colors duration-300 hover:text-rose-600 dark:hover:text-sky-500`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </div>

      {isMobile && (
        <div className="md:hidden mt-5">
          <div className="w-full text-center py-4">
            <Link href="/">
              <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                Flyobo
              </span>
            </Link>
          </div>
          {navItemsData.map((item, index) => (
            <Link href={item.url} key={index}>
              <span
                className={`${
                  activeItem === index
                    ? "text-rose-600 dark:text-sky-300"
                    : "text-gray-900 dark:text-white"
                } block py-3 px-6 text-lg font-medium transition-colors duration-300 hover:text-rose-600 dark:hover:text-sky-500`}
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

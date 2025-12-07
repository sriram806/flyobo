"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiMapPin,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#050816] text-gray-300 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* TOP BRAND SECTION */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/icon.png"
                alt="Flyobo"
                width={50}
                height={50}
                className="opacity-90"
              />
              <Image
                src="/images/banner.png"
                alt="Flyobo"
                width={150}
                height={50}
                className="h-auto w-auto opacity-95"
              />
            </div>

            <p className="text-sm text-gray-400 max-w-md">
              Making your travel dreams come true since 2024.<br />
              Unbeatable prices, unforgettable experiences.
            </p>

            <div className="flex items-center gap-4">
              {[FiFacebook, FiInstagram, FiTwitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:-translate-y-0.5 hover:border-[#33bfff] hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-4 md:mt-0 text-xs text-gray-400 md:text-right">
            <p className="uppercase tracking-[0.25em] text-[#33bfff]">
              Swagatam World LLP
            </p>
            <p>Curated trips. Hassle-free journeys.</p>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="mt-8 border-t border-gray-700/70" />

        {/* MAIN GRID (2 columns for small/medium, 4 for large) */}
        <div className="
          mt-8
          grid grid-cols-1 
          sm:grid-cols-2 md:grid-cols-2 
          lg:grid-cols-4 
          gap-10
        ">
          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase text-gray-100 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/packages", label: "Packages" },
                { href: "/gallery", label: "Gallery" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/faq", label: "FAQ" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-white text-gray-400 transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h4 className="text-sm font-semibold uppercase text-gray-100 mb-4">
              Popular Destinations
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                "Goa",
                "Kerala",
                "Rajasthan",
                "Himachal Pradesh",
                "Andaman",
              ].map((place) => (
                <li key={place}>
                  <Link
                    href={`/packages?q=${encodeURIComponent(place)}`}
                    className="hover:text-white text-gray-400 transition"
                  >
                    {place}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase text-gray-100 mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <FiMapPin className="text-[#33bfff] mt-1" />
                Visakhapatnam,<br /> Andhra Pradesh, India – 530044
              </li>
              <li className="flex gap-3">
                <FiPhone className="text-[#33bfff]" />
                <a href="tel:+919291237399" className="hover:text-white">
                  +91 92912 37399
                </a>
              </li>
              <li className="flex gap-3">
                <FiMail className="text-[#33bfff]" />
                <a href="mailto:team.flyobo@gmail.com" className="hover:text-white">
                  team.flyobo@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Map */}
          <div>
            <h4 className="text-sm font-semibold uppercase text-gray-100 mb-4">
              Our Location
            </h4>

            <div className="rounded-xl overflow-hidden border border-gray-700/70 shadow-lg">
              <iframe
                title="Flyobo Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.664350391623!2d83.303!3d17.738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sVisakhapatnam!5e0!3m2!1sen!2sin!4v0000000000000"
                className="w-full h-40 border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-8 border-t border-gray-800/80 pt-4 text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between">
          <p>© {year} Flyobo (Swagatam World LLP). All rights reserved.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <Link href="/terms" className="hover:text-gray-200">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-200">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

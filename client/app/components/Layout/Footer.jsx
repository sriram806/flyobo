"use client";

import Link from "next/link";
import Image from "next/image";
import { FiFacebook, FiInstagram, FiTwitter, FiMapPin, FiPhone, FiMail } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-[#0b1220] text-gray-300 pt-10 pb-8 mt-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Image src="/images/icon.png" alt="Flyobo" width={50} height={50} />
              <div>
                <Image src={'/images/banner.png'} alt="Flyobo" width={140} height={140} />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Making your travel dreams come true since 2024. Unbeatable prices, unforgettable experiences.
            </p>
            <div className="flex items-center gap-4 mt-4 text-gray-300">
              <a href="#" aria-label="Facebook" className="hover:text-white"><FiFacebook size={18} /></a>
              <a href="#" aria-label="Instagram" className="hover:text-white"><FiInstagram size={18} /></a>
              <a href="#" aria-label="Twitter" className="hover:text-white"><FiTwitter size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/packages" className="hover:text-white">Packages</Link></li>
              <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h4 className="text-white font-semibold mb-4">Popular Destinations</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/packages?q=Goa" className="hover:text-white">Goa</Link></li>
              <li><Link href="/packages?q=Kerala" className="hover:text-white">Kerala</Link></li>
              <li><Link href="/packages?q=Rajasthan" className="hover:text-white">Rajasthan</Link></li>
              <li><Link href="/packages?q=Himachal%20Pradesh" className="hover:text-white">Himachal Pradesh</Link></li>
              <li><Link href="/packages?q=Andaman" className="hover:text-white">Andaman</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><FiMapPin className="mt-0.5" /> Visakhapatnam<br />Andhra Pradesh, India - 530044</li>
              <li className="flex items-center gap-2"><FiPhone /> +91 92912 37399</li>
              <li className="flex items-center gap-2"><FiMail /> wecare@flyobo.com</li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-700 mt-8" />

        <div className="text-center text-xs text-gray-400 mt-4">
          © {new Date().getFullYear()} Flyobo (Swagatam World LLP). All rights reserved.
        </div>
      </div>
    </footer>
  );
}

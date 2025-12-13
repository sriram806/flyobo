"use client";

import React from "react";
import { HiOutlineShieldCheck } from "react-icons/hi";

export default function Privacy({ setRoute, setOpen }) {
  return (
    <div className="w-full max-w-2xl scroll-smooth mx-auto px-6 py-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg max-h-[85vh] overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-slate-900 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-600/20">
            <HiOutlineShieldCheck className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">FlyOBO Travelling</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          Your Privacy Matters
        </p>

        <p>
          FlyOBO Travelling takes your privacy seriously. This policy explains how we collect, use, and protect your personal data when you use our services.
        </p>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Information We Collect</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Personal information: name, email address, phone number, and payment details.</li>
              <li>Booking information: travel preferences, destinations, and booking history.</li>
              <li>Technical data: IP address, browser type, device information, and usage data.</li>
              <li>Cookies and tracking technologies to improve user experience.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. How We Use Your Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Process bookings and provide customer support.</li>
              <li>Send booking confirmations, updates, and travel-related notifications.</li>
              <li>Improve our services through analytics and user feedback.</li>
              <li>Personalize your experience with relevant offers and recommendations.</li>
              <li>Comply with legal obligations and prevent fraud.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Information Sharing</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>We do not sell your personal data to third parties.</li>
              <li>We may share data with service providers (airlines, hotels, etc.) to fulfill bookings.</li>
              <li>We may share data with payment processors to complete transactions.</li>
              <li>We may disclose information when required by law or to protect our rights.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4. Cookies & Tracking</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>We use cookies to improve the user experience and analyze site traffic.</li>
              <li>You can manage cookie preferences through your browser settings.</li>
              <li>Some features may not function properly if cookies are disabled.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">5. Data Security</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>We implement industry-standard security measures to protect your data.</li>
              <li>All payment information is encrypted using secure protocols.</li>
              <li>We regularly review and update our security practices.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">6. Your Rights</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access: Request a copy of your personal data.</li>
              <li>Correction: Request correction of inaccurate information.</li>
              <li>Deletion: Request deletion of your personal data (subject to legal requirements).</li>
              <li>Opt-out: Unsubscribe from marketing communications at any time.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">7. Data Retention</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>We retain your data for as long as necessary to provide services.</li>
              <li>After account deletion, some data may be retained for legal or operational purposes.</li>
            </ul>
          </div>
        </div>

        <p className="pt-4 border-t border-gray-200 dark:border-gray-700">
          For more details or to exercise your rights, contact us at{" "}
          <a href="mailto:support@flyobo.com" className="text-sky-600 hover:underline">
            team.flyobo@gmail.com
          </a>
          {" "}or review our{" "}
          <button
            type="button"
            onClick={() => setRoute && setRoute("Terms")}
            className="text-sky-600 hover:underline"
          >
            Terms of Service
          </button>
          .
        </p>
      </div>
    </div>
  );
}

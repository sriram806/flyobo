"use client";

import React from "react";
import { HiOutlineDocumentText } from "react-icons/hi";

export default function Terms({ setRoute, setOpen }) {
  return (
    <div className="w-full max-w-2xl scroll-smooth mx-auto px-6 py-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg max-h-[85vh] overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-slate-900 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-r from-sky-500 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-600/20">
            <HiOutlineDocumentText className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Terms of Service</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">FlyOBO Travelling</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          Welcome to FlyOBO Travelling
        </p>

        <p>
          These Terms of Service govern your use of FlyOBO Travelling services. By creating an account and using our services, you agree to the following terms:
        </p>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Use of Services</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the service in compliance with applicable laws and regulations.</li>
              <li>Provide accurate information during account creation and booking.</li>
              <li>Maintain the confidentiality of your account credentials.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Booking & Payments</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>All bookings are subject to availability and confirmation.</li>
              <li>Prices are displayed in your selected currency and include applicable taxes unless stated otherwise.</li>
              <li>Payment must be made at the time of booking through approved payment methods.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Cancellation & Refunds</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Follow cancellation and refund policies as disclosed during booking.</li>
              <li>Cancellation fees may apply depending on the service provider's terms.</li>
              <li>Refunds will be processed according to the applicable policy.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4. Intellectual Property</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Respect intellectual property and content usage rules.</li>
              <li>All content on FlyOBO is protected by copyright and trademark laws.</li>
              <li>You may not reproduce, distribute, or create derivative works without permission.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">5. Limitation of Liability</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>FlyOBO acts as an intermediary between customers and service providers.</li>
              <li>We are not liable for the acts, errors, omissions, or representations of service providers.</li>
              <li>Use of the service is at your own risk.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">6. Referral Program</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Referral rewards are subject to terms and conditions of the referral program.</li>
              <li>Fraudulent referrals will result in account suspension and forfeiture of rewards.</li>
              <li>Rewards are non-transferable and cannot be exchanged for cash.</li>
            </ul>
          </div>
        </div>

        <p className="pt-4 border-t border-gray-200 dark:border-gray-700">
          For full details or questions, contact us at{" "}
          <a href="mailto:support@flyobo.com" className="text-sky-600 hover:underline">
            team.flyobo@gmail.com
          </a>
          {" "}or see the{" "}
          <button
            type="button"
            onClick={() => setRoute && setRoute("Privacy")}
            className="text-sky-600 hover:underline"
          >
            Privacy Policy
          </button>
          {" "}for data handling practices.
        </p>
      </div>
    </div>
  );
}

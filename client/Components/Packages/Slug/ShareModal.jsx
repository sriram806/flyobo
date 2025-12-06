"use client";

import React from "react";
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin, FaCopy } from "react-icons/fa";

export default function ShareModal({ onClose, onShare }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg w-80">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share this package</h3>
        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => onShare("whatsapp")} className="flex flex-col items-center">
            <FaWhatsapp className="text-green-500 text-2xl" />
            <span className="text-xs">WhatsApp</span>
          </button>
          <button onClick={() => onShare("facebook")} className="flex flex-col items-center">
            <FaFacebook className="text-blue-600 text-2xl" />
            <span className="text-xs">Facebook</span>
          </button>
          <button onClick={() => onShare("twitter")} className="flex flex-col items-center">
            <FaTwitter className="text-sky-500 text-2xl" />
            <span className="text-xs">Twitter</span>
          </button>
          <button onClick={() => onShare("linkedin")} className="flex flex-col items-center">
            <FaLinkedin className="text-blue-700 text-2xl" />
            <span className="text-xs">LinkedIn</span>
          </button>
          <button onClick={() => onShare("copy")} className="flex flex-col items-center">
            <FaCopy className="text-gray-600 text-2xl" />
            <span className="text-xs">Copy</span>
          </button>
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm">Close</button>
      </div>
    </div>
  );
}

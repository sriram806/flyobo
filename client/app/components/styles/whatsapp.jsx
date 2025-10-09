"use client";
import { useMemo } from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsApp = ({ phone = "+916300146756", message = "Hello!" }) => {
  const href = useMemo(() => {
    const base = `https://wa.me/${phone}`;
    const params = message ? `?text=${encodeURIComponent(message)}` : "";
    return `${base}${params}`;
  }, [phone, message]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 left-5 z-50"
    >
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-green-500 hover:bg-green-600 transition-all duration-300 border border-green-600 hover:scale-110">
        <FaWhatsapp className="w-8 h-8 text-white" />
      </span>
    </a>
  );
};

export default WhatsApp;

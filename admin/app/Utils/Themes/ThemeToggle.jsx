"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle Theme"
      className="
        relative w-20 h-10 
        flex items-center
        rounded-full 
        backdrop-blur-xl
        bg-white/40 dark:bg-black/40
        border border-white/20 dark:border-black/20
        shadow-inner dark:shadow-[inset_0_0_10px_rgba(0,0,0,0.7)]
        transition-colors duration-500
      "
    >
      {/* Sliding Knob */}
      <div
        className={`
          absolute w-9 h-9 rounded-full
          bg-white dark:bg-gray-900 
          shadow-lg
          transform transition-all duration-500 
          ease-[cubic-bezier(.22,1,.36,1)]
          flex items-center justify-center
          ${isDark ? "translate-x-10" : "translate-x-1"}
        `}
        style={{
          boxShadow: isDark
            ? "0 0 20px rgba(0,150,255,0.7), 0 0 40px rgba(0,150,255,0.3)"
            : "0 0 15px rgba(255,200,0,0.8), 0 0 35px rgba(255,200,0,0.3)",
        }}
      >
        {/* Rotating icon inside knob */}
        <span
          className={`
            text-xl transition-all duration-500 
            ${isDark 
              ? "rotate-0 scale-100 opacity-100" 
              : "-rotate-180 scale-0 opacity-0 absolute"}
          `}
        >
          🌙
        </span>

        <span
          className={`
            text-xl transition-all duration-500 
            ${!isDark 
              ? "rotate-0 scale-100 opacity-100" 
              : "rotate-180 scale-0 opacity-0 absolute"}
          `}
        >
          ☀️
        </span>
      </div>
    </button>
  );
}

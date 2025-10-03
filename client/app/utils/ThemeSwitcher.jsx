"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { BiMoon, BiSun } from "react-icons/bi";

const ThemeSwitcher = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isLight = mounted ? resolvedTheme === 'light' : undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => setTheme(isLight ? "dark" : "light");

  return (
    <button
      suppressHydrationWarning
      type="button"
      aria-label={mounted ? `Switch to ${isLight ? "dark" : "light"} mode` : "Toggle theme"}
      aria-pressed={mounted ? !isLight : undefined}
      className="mx-4 inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-teal-300 transition-all duration-200"
      title={mounted ? (isLight ? "Switch to dark mode" : "Switch to light mode") : "Toggle theme"}
      onClick={toggleTheme}
    >
      {!mounted ? (
        <div className="h-5 w-5" />
      ) : isLight ? (
        <BiMoon className="h-5 w-5" />
      ) : (
        <BiSun className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeSwitcher;
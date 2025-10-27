"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { BiMoon, BiSun } from "react-icons/bi";

const ThemeSwitcher = () => {
  console.log('ThemeSwitcher component rendering');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Log theme information for debugging
    console.log('Theme:', theme);
  }, [theme]);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="mx-4 inline-flex items-center justify-center rounded-full p-2 w-[40px] h-[40px]">
        <div className="h-5 w-5" />
      </div>
    );
  }

  const isLight = theme === 'light';

  const toggleTheme = () => {
    const newTheme = isLight ? "dark" : "light";
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
  };

  return (
    <button
      type="button"
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      className="mx-4 inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-teal-300 transition-all duration-200"
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      onClick={toggleTheme}
    >
      {isLight ? (
        <BiMoon className="h-5 w-5 text-gray-800 dark:text-gray-200" />
      ) : (
        <BiSun className="h-5 w-5 text-gray-800 dark:text-gray-200" />
      )}
    </button>
  );
};

export default ThemeSwitcher;
"use client";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function ThemeTestPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    console.log("Theme Test Page - Current theme:", theme);
    console.log("Theme Test Page - Resolved theme:", resolvedTheme);
  }, [theme, resolvedTheme]);

  return (
    <div className="min-h-screen bg-background-primary text-foreground-primary p-8">
      <h1 className="text-3xl font-bold mb-4">Theme Test Page</h1>
      <div className="mb-4">
        <p>Current theme: {theme}</p>
        <p>Resolved theme: {resolvedTheme}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={() => setTheme("light")}
          className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded shadow"
        >
          Set Light Theme
        </button>
        <button 
          onClick={() => setTheme("dark")}
          className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded shadow"
        >
          Set Dark Theme
        </button>
        <button 
          onClick={() => setTheme("system")}
          className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded shadow"
        >
          Set System Theme
        </button>
      </div>
      <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Test Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
            <p className="text-gray-900 dark:text-white">This should change with theme</p>
          </div>
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded">
            <p className="text-blue-900 dark:text-blue-100">This should also change</p>
          </div>
        </div>
      </div>
    </div>
  );
}
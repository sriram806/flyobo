"use client";
import { useTheme } from "next-themes";
import { useEffect } from "react";

const ThemeTest = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    console.log("Theme Test - Current theme:", theme);
    console.log("Theme Test - Resolved theme:", resolvedTheme);
    
    // Check localStorage
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('flyobo-theme');
      console.log("Theme Test - Stored theme:", storedTheme);
      
      // Log all localStorage items
      console.log("Theme Test - All localStorage items:");
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`  ${key}: ${value}`);
      }
    }
  }, [theme, resolvedTheme]);

  return (
    <div className="p-4 bg-background-primary text-foreground-primary rounded-lg m-4 border border-border-primary">
      <h3 className="text-lg font-bold">Theme Debug Info</h3>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <div className="flex gap-2 mt-2 flex-wrap">
        <button 
          onClick={() => setTheme("light")}
          className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
        >
          Set Light
        </button>
        <button 
          onClick={() => setTheme("dark")}
          className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
        >
          Set Dark
        </button>
        <button 
          onClick={() => setTheme("system")}
          className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
        >
          Set System
        </button>
      </div>
      <button 
        onClick={() => {
          if (typeof window !== 'undefined') {
            console.log("Clearing localStorage");
            localStorage.removeItem('flyobo-theme');
            // Force a refresh to see if it picks up the system theme
            window.location.reload();
          }
        }}
        className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
      >
        Clear Theme Storage
      </button>
    </div>
  );
};

export default ThemeTest;
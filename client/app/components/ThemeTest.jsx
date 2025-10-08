"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeTest = () => {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 left-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
      <h3 className="font-bold text-gray-900 dark:text-white mb-2">Theme Debug</h3>
      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <p>Current theme: {theme}</p>
        <p>Resolved theme: {resolvedTheme}</p>
        <p>System theme: {systemTheme}</p>
        <p>Document classes: {typeof document !== 'undefined' ? document.documentElement.className : 'N/A'}</p>
      </div>
      <div className="mt-2 space-x-2">
        <button
          onClick={() => setTheme('light')}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
        >
          Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
        >
          Dark
        </button>
        <button
          onClick={() => setTheme('system')}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
        >
          System
        </button>
      </div>
    </div>
  );
};

export default ThemeTest;
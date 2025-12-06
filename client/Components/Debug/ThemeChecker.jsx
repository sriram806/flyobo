"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const ThemeChecker = () => {
  const { theme, resolvedTheme } = useTheme();
  const [domInfo, setDomInfo] = useState({});

  useEffect(() => {
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      
      const newDomInfo = {
        htmlClass: htmlElement.className,
        htmlClasses: Array.from(htmlElement.classList),
        bodyClass: bodyElement.className,
        bodyClasses: Array.from(bodyElement.classList),
        isDark: htmlElement.classList.contains('dark'),
        computedBg: window.getComputedStyle(bodyElement).backgroundColor,
        computedText: window.getComputedStyle(bodyElement).color,
        theme: theme,
        resolvedTheme: resolvedTheme
      };
      
      console.log("=== Theme Checker ===");
      console.log("HTML class:", newDomInfo.htmlClass);
      console.log("HTML classes:", newDomInfo.htmlClasses);
      console.log("Body class:", newDomInfo.bodyClass);
      console.log("Body classes:", newDomInfo.bodyClasses);
      console.log("Is dark theme:", newDomInfo.isDark);
      console.log("Background color:", newDomInfo.computedBg);
      console.log("Text color:", newDomInfo.computedText);
      console.log("Theme:", theme);
      console.log("Resolved theme:", resolvedTheme);
      
      setDomInfo(newDomInfo);
    };
    
    // Check immediately
    checkTheme();
    
    // Check after a short delay to allow for theme application
    const timeoutId = setTimeout(checkTheme, 100);
    
    // Also check when the page is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkTheme);
    }
    
    // Set up an interval to check periodically
    const intervalId = setInterval(checkTheme, 1000);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('DOMContentLoaded', checkTheme);
      clearInterval(intervalId);
    };
  }, [theme, resolvedTheme]);

  return (
    <div className="fixed bottom-0 right-0 bg-black/80 text-white p-2 text-xs z-[9999]">
      <div>Theme: {theme}</div>
      <div>Resolved: {resolvedTheme}</div>
      <div>Dark: {domInfo.isDark ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default ThemeChecker;
"use client";
import { useEffect } from "react";

const CssTest = () => {
  useEffect(() => {
    // Test CSS variables
    const testElement = document.createElement('div');
    testElement.className = 'test-theme-bg test-theme-text';
    testElement.style.display = 'none';
    document.body.appendChild(testElement);
    
    const computedStyles = window.getComputedStyle(testElement);
    console.log("CSS Test - Background color:", computedStyles.backgroundColor);
    console.log("CSS Test - Text color:", computedStyles.color);
    
    document.body.removeChild(testElement);
  }, []);

  return null;
};

export default CssTest;
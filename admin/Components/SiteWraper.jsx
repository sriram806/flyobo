"use client";

import React, { useState, useEffect } from "react";

export default function PageWrapper({ children }) {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    function check() {
      setIsSmall(window.innerWidth < 750); 
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isSmall) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white text-center p-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">Device Not Supported</h1>
          <p className="text-lg">
            This website is best viewed on a laptop, desktop, or large tablet.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

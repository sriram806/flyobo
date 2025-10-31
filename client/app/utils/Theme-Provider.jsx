"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const ThemeProvider = ({ children, ...props }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    console.log('ThemeProvider not mounted yet, returning placeholder');
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    );
  }

  console.log('ThemeProvider rendering with NextThemesProvider');
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
      storageKey="flyobo-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
};

export default ThemeProvider;
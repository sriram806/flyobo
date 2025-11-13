"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import defaultContent from "@/app/config/homeContent";

const HomeContentContext = createContext(null);

export function HomeContentProvider({ children }) {
  const [content, setContent] = useState(defaultContent);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("homeContent");
      if (raw) {
        const parsed = JSON.parse(raw);
        setContent((c) => ({ ...c, ...parsed }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const save = (newContent) => {
    const merged = { ...content, ...newContent };
    setContent(merged);
    try {
      localStorage.setItem("homeContent", JSON.stringify(merged));
    } catch (e) {
      console.error("Failed to save home content:", e);
    }
  };

  const value = useMemo(() => ({ content, save }), [content]);
  return <HomeContentContext.Provider value={value}>{children}</HomeContentContext.Provider>;
}

export function useHomeContent() {
  const ctx = useContext(HomeContentContext);
  if (!ctx) throw new Error("useHomeContent must be used within HomeContentProvider");
  return ctx;
}

export default HomeContentContext;

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Portal({ children }) {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setContainer(document.body);
    }
  }, []);
  if (!container) return null;

  return createPortal(children, container);
}

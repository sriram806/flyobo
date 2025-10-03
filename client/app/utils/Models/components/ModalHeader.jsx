"use client";

import React from "react";
import { styles } from "../../../components/styles/style";

/**
 * Reusable modal header for consistent, branded UI across auth/user modals.
 *
 * Props:
 * - icon: ReactNode (e.g., <HiOutlineKey size={28} />)
 * - title: string
 * - description: string
 * - gradientClass: tailwind classes for gradient (default: from-blue-600 to-cyan-500)
 * - shadowClass: tailwind classes for shadow color (default: shadow-blue-600/20)
 */
export default function ModalHeader({
  icon,
  title,
  description,
  gradientClass = "from-blue-600 to-cyan-500",
  shadowClass = "shadow-blue-600/20",
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className={`${styles.title} !text-center`}>{title}</h2>
      {description ? (
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm">{description}</p>
      ) : null}
    </div>
  );
}

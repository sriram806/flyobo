"use client";

import React from "react";
import { styles } from "../../../components/styles/style";

export default function ModalHeader({
  title,
  description
}) {
  return (
    <div className="flex flex-col items-center text-center mb-2">
      <h2 className={`${styles.title} !text-center mb-2`}>{title}</h2>
      {description ? (
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}

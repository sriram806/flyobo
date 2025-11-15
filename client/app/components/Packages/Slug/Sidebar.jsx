"use client";

import React from "react";
import CTAButton from "./ui/CTAButton";
import Price from "./ui/Price";

export default function Sidebar({ price, mrp, hasDiscount, discountPct, title, slug, url }) {
  return (
    <aside className="w-full lg:w-auto">
      <div className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm space-y-4">
        <Price price={price} mrp={mrp} hasDiscount={hasDiscount} discountPct={discountPct} />

        <div className="mt-2 space-y-2">
          <a href={`https://wa.me/919291237999?text=${encodeURIComponent('I want to book ' + title + ' package. Link: ' + url)}`} target="_blank" rel="noreferrer">
            <CTAButton variant="primary" className="w-full">📞 Book on WhatsApp</CTAButton>
          </a>
          <CTAButton href={`/packages/checkout?slug=${encodeURIComponent(slug || '')}`} variant="secondary" className="w-full mt-2 bg-gray-200 ">Proceed to Checkout</CTAButton>
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-800 dark:text-gray-100">
          <div className="rounded-lg bg-gray-200 dark:bg-gray-800 p-2">✓ Best Price Guarantee</div>
          <div className="rounded-lg bg-gray-200 dark:bg-gray-800 p-2">✓ Instant Confirmation</div>
          <div className="rounded-lg bg-gray-200 dark:bg-gray-800 p-2">✓ 24/7 Customer Support</div>
        </div>
      </div>
    </aside>
  );
}

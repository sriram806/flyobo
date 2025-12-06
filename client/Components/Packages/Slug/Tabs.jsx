"use client";

import React from "react";
import Badge from "./ui/Badge";

export default function Tabs({ activeTab, setActiveTab, pkg, title, url }) {
  return (
    <div className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md">
      <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200 dark:border-gray-800">
        {["Overview", "Gallery", "Inclusions", "Itinerary", "Policies"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeTab === tab
                ? "bg-sky-500 text-white shadow-lg"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4 sm:p-5">
        {activeTab === "Overview" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
              <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">About This Package</div>
              {(() => {
                const text = (pkg?.description || "").replace(/\s+/g, " ").trim();
                return (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{text || "Details coming soon."}</p>
                );
              })()}
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-base font-semibold text-gray-900 dark:text-white">Ready to Experience This Journey?</div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Contact our travel experts to customize this package and get the best deals.</p>
              </div>
              <a
                href={`https://wa.me/919291237999?text=${encodeURIComponent(
                  'Hi, I am interested in ' + title + ' package. Link: ' + (url || '')
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm"
              >
                Contact Expert
              </a>
            </div>

            {pkg?.tags && (
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Tags</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {pkg.tags
                    .toString()
                    .split(",")
                    .map((t, i) => (
                      <Badge key={i}>{t.trim()}</Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Gallery" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(() => {
              const imgs = [];
              const add = (src) => src && imgs.push(src);
              add(pkg?.image);
              add(pkg?.images?.url);
              if (Array.isArray(pkg?.images)) pkg.images.forEach((it) => add(it?.url || it));
              if (Array.isArray(pkg?.gallery)) pkg.gallery.forEach((it) => add(it?.url || it));
              const list = imgs.filter(Boolean);
              return list.length ? list.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt={`${title} ${i+1}`} className="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-800" />
              )) : <div className="text-sm text-gray-600 dark:text-gray-300">No images available.</div>;
            })()}
          </div>
        )}

        {activeTab === "Inclusions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Included</div>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {(pkg?.included || []).map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Excluded</div>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {(pkg?.excluded || []).map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "Itinerary" && (
          <div className="space-y-3">
            {(pkg?.itinerary || [])
              .slice()
              .sort((a, b) => (a.day || 0) - (b.day || 0))
              .map((it, i) => (
                <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <div className="font-medium">Day {it.day}: {it.description}</div>
                  {Array.isArray(it.activities) && it.activities.length > 0 && (
                    <div className="mt-1 text-sm">Activities: {it.activities.join(", ")}</div>
                  )}
                </div>
              ))}
          </div>
        )}

        {activeTab === "Policies" && (
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Policies & Terms</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Full payment is required to confirm the booking unless otherwise stated.</li>
              <li>Prices are subject to change based on availability and seasonal variations.</li>
              <li>Government taxes, fees, and surcharges may apply as per regulations.</li>
              <li>Cancellations within 7 days of departure may be non-refundable.</li>
              <li>Date changes are subject to partner approval and fare differences.</li>
              <li>Guests must carry valid ID proofs for all travelers at check-in.</li>
              <li>Activities are weather-dependent; alternatives may be provided.</li>
              <li>We are not liable for delays due to traffic, weather, or force majeure.</li>
              <li>Personal expenses and items not listed under “Included” are excluded.</li>
              <li>By booking, you agree to our standard Terms & Conditions.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

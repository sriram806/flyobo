"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "../config/env";
import Loading from "../Loading/Loading";

import DestinationPieChart from "./DestinationPieChart";
import DestinationLineChart from "./DestinationLineChart";

export default function AllDestinationAnalytics() {
  const base = NEXT_PUBLIC_BACKEND_URL;

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${base}/reports/destinations`, {
          withCredentials: true,
        });
        setAnalytics(data?.data || null);
      } catch (err) {
        console.error(err);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [base]);

  if (loading || !analytics) return <Loading />;

  const {
    domesticCount,
    internationalCount,
    totalDestinations,
    popularCount,
    monthlyDestinations,
    topStates,
    topCountries,
  } = analytics;

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4">

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Destinations", value: totalDestinations },
          { label: "Domestic", value: domesticCount },
          { label: "International", value: internationalCount },
          { label: "Popular Destinations", value: popularCount },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border dark:border-gray-700"
          >
            <div className="text-gray-500 text-sm">{item.label}</div>
            <div className="text-3xl font-semibold mt-1 text-gray-800 dark:text-gray-100">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* ===== PIE + TOP LISTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
          <DestinationPieChart
            domestic={domesticCount}
            international={internationalCount}
          />
        </div>

        {/* ===== TOP STATES ===== */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Top States
          </h3>

          <ul className="divide-y dark:divide-gray-700">
            {(!topStates || topStates.length === 0) && (
              <div className="text-gray-400 text-sm">No data available</div>
            )}

            {topStates?.slice(0, 6).map((st, idx) => (
              <li
                key={`${st.state}-${idx}`}
                className="p-3 flex justify-between items-center"
              >
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {st.state}
                </span>

                <span className="px-2 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700">
                  {st.count} Destinations
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== TOP COUNTRIES ===== */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Top Countries
          </h3>

          <ul className="divide-y dark:divide-gray-700">
            {(!topCountries || topCountries.length === 0) && (
              <div className="text-gray-400 text-sm">No data available</div>
            )}

            {topCountries?.slice(0, 6).map((ct, idx) => (
              <li
                key={`${ct.country}-${idx}`}
                className="p-3 flex justify-between items-center"
              >
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {ct.country}
                </span>

                <span className="px-2 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700">
                  {ct.count} Destinations
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ===== LINE CHART ===== */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Monthly Destination Growth
        </h3>

        <DestinationLineChart data={monthlyDestinations} />
      </div>
    </section>
  );
}

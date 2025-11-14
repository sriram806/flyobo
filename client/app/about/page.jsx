"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Heading from "../components/MetaData/Heading";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import SEO from "../components/MetaData/SEO";
import {
  WebsiteStructuredData,
  OrganizationStructuredData,
} from "../components/MetaData/StructuredData";

/**
 * AboutPage — Modern Blue theme + Framer Motion animations
 *
 * - split hero (text + image)
 * - animated stats
 * - animated mission cards
 * - animated timeline
 * - animated CTA
 *
 * Tailwind + light/dark mode friendly
 */

const stats = [
  { label: "Happy Travelers", value: "15k+" },
  { label: "Destinations", value: "120+" },
  { label: "Curated Packages", value: "350+" },
  { label: "Avg. Rating", value: "4.9/5" },
];

const values = [
  {
    title: "Traveler-first",
    desc: "We design experiences around people, not just places.",
  },
  {
    title: "Trust & Safety",
    desc: "Verified partners, secure payments, and clear policies.",
  },
  {
    title: "Sustainable Travel",
    desc: "We promote eco-friendly stays and responsible travel.",
  },
  {
    title: "Local Impact",
    desc: "We collaborate with local guides and businesses.",
  },
];

const timeline = [
  {
    year: "2024",
    text: "Flyobo was founded with a mission to simplify travel discovery.",
  },
  {
    year: "2025",
    text: "Launched curated packages and smart recommendations.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: { opacity: 1 },
  show: { transition: { staggerChildren: 0.12 } },
};

export default function AboutPage() {
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");

  return (
    <>
      <SEO
        title="About Flyobo - Our Mission and Story"
        description="Learn about Flyobo's mission to make travel planning joyful, our values, and the story of how we became a trusted travel companion since our founding in 2024."
        keywords="About Flyobo, Travel Company, Travel Mission, Travel Story, Sustainable Travel, Local Impact"
        url="https://www.flyobo.com/about"
      />
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      <Heading
        title="About Flyobo"
        description="We've been building delightful travel experiences through curation, technology, and a traveler-first approach since 2024."
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />

        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left - Text */}
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={stagger}
                className="space-y-6"
              >
                <motion.h1
                  variants={fadeUp}
                  className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight"
                >
                  Travel made{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
                    personal
                  </span>{" "}
                  & delightful
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="text-lg text-gray-700 dark:text-gray-300 max-w-xl"
                >
                  Discover curated trips with Flyobo — from scenic hills to
                  vibrant cities. Since our launch in 2024, we've obsessed over
                  the small details so you can fully enjoy the moments that
                  matter.
                </motion.p>

                <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                  <a
                    href="/packages"
                    className="inline-flex items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 text-sm font-semibold shadow"
                  >
                    Explore Packages
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center rounded-xl border border-sky-200 dark:border-sky-700 px-5 py-3 text-sm font-semibold text-sky-600 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-800 transition"
                  >
                    Talk to us
                  </a>
                </motion.div>
              </motion.div>

              {/* Right - Image with subtle parallax */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full flex justify-center lg:justify-end"
              >
                <div className="w-full max-w-md lg:max-w-lg rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/5 transition-transform">
                  <div className="relative h-72 sm:h-96 lg:h-[420px]">
                    <img
                      src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop"
                      alt="Travel - Flyobo"
                      className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6"
          >
            {stats.map((s, idx) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 p-6 text-center shadow-sm"
              >
                <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
                  {s.value}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300 mt-1">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* MISSION / VALUES */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 p-8 sm:p-12 shadow">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              Our Mission
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08, duration: 0.6 }}
              className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl"
            >
              Since 2024, we’ve aimed to make travel planning as joyful as the
              journey. We blend curated recommendations, trust, and modern
              technology to guide every traveler.
            </motion.p>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  variants={fadeUp}
                  className="rounded-xl p-5 bg-gradient-to-br from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-800/40 border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <div className="text-sky-600 dark:text-sky-400 font-semibold">
                    {v.title}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {v.desc}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 p-8 sm:p-12 shadow">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              Our Story
            </motion.h2>

            <motion.ol
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="mt-8 relative border-l-2 border-sky-200 dark:border-sky-700"
            >
              {timeline.map((t, i) => (
                <motion.li
                  key={i}
                  variants={fadeUp}
                  className="mb-10 ml-6 relative"
                >
                  <span className="absolute -left-4 top-0 h-4 w-4 rounded-full bg-sky-600 border-2 border-white dark:border-gray-900" />
                  <time className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                    {t.year}
                  </time>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">{t.text}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            id="contact"
            className="rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-600 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl"
          >
            <div>
              <h3 className="text-2xl font-bold text-white">
                Have a question? We’re here to help.
              </h3>
              <p className="mt-2 text-sky-100 max-w-xl">
                Reach out and our travel specialists will get back to you shortly.
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href="mailto:support@flyobo.com"
                className="inline-flex items-center justify-center rounded-xl bg-white text-sky-700 px-6 py-3 text-sm font-semibold hover:bg-slate-50 transition shadow"
              >
                Contact Support
              </a>

              <a
                href="/packages"
                className="inline-flex items-center justify-center rounded-xl bg-white/10 text-white px-6 py-3 text-sm font-semibold hover:bg-white/20 transition"
              >
                Explore Packages
              </a>
            </div>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  );
}

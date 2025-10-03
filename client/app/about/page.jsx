"use client";

import { useState } from "react";
import Heading from "../components/MetaData/Heading";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

export default function AboutPage() {
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");

  const stats = [
    { label: "Happy Travelers", value: "120k+" },
    { label: "Destinations", value: "450+" },
    { label: "Curated Packages", value: "2,000+" },
    { label: "Avg. Rating", value: "4.8/5" },
  ];

  const values = [
    { title: "Traveler-first", desc: "We design experiences around people, not just places." },
    { title: "Trust & Safety", desc: "Verified partners, secure payments, and clear policies." },
    { title: "Sustainable", desc: "We promote eco-friendly stays and responsible travel." },
    { title: "Local Impact", desc: "We collaborate with local guides and businesses." },
  ];

  const timeline = [
    { year: "2022", text: "Flyobo was founded with a mission to simplify travel discovery." },
    { year: "2023", text: "Launched curated packages and smart recommendations." },
    { year: "2024", text: "Scaled to 100k+ travelers and expanded to international routes." },
    { year: "2025", text: "Introducing AI trip planners and dynamic pricing tools." },
  ];

  return (
    <>
      <Heading
        title="About Flyobo"
        description="We build delightful travel experiences through curation, technology, and a traveler-first approach."
        keywords="About, Flyobo, Travel, Mission, Story"
      />
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900 dark:to-sky-800">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Travel made <span className="text-sky-400">personal</span> & delightful
              </h1>
              <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
                Discover curated trips with Flyobo — from scenic hills to vibrant cities. We obsess over details so you can just enjoy the journey.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href="/packages"
                  className="inline-flex items-center justify-center rounded-xl bg-sky-400 text-white px-6 py-3 text-sm font-semibold hover:bg-sky-500 transition shadow-md"
                >
                  Explore Packages
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-xl border border-sky-400 px-6 py-3 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900 transition"
                >
                  Talk to us
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="h-72 sm:h-96 lg:h-full rounded-3xl overflow-hidden border border-sky-200 dark:border-sky-700 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600&auto=format&fit=crop"
                  alt="About Flyobo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-sky-200 dark:border-sky-700 p-6 text-center shadow-md hover:shadow-lg transition"
            >
              <div className="text-3xl font-extrabold text-sky-400">{s.value}</div>
              <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="rounded-3xl border border-sky-200 dark:border-sky-700 bg-white dark:bg-gray-900 p-10 sm:p-14 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
          <p className="mt-4 text-gray-700 dark:text-gray-300 text-lg">
            To make planning a trip as joyful as the journey itself. We combine curated recommendations with transparency and tech.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-sky-200 dark:border-sky-700 p-6 bg-sky-50 dark:bg-sky-900/40 shadow-sm hover:shadow-md transition"
              >
                <div className="text-lg font-semibold text-sky-600 dark:text-sky-400">{v.title}</div>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Timeline */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="rounded-3xl border border-sky-200 dark:border-sky-700 bg-white dark:bg-gray-900 p-10 sm:p-14 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Story</h2>
          <ol className="mt-8 relative border-l-2 border-sky-300 dark:border-sky-700">
            {timeline.map((t, i) => (
              <li key={i} className="mb-10 ml-6 relative">
                <span className="absolute -left-4 top-0 h-4 w-4 rounded-full bg-sky-400 border-2 border-white dark:border-gray-900" />
                <time className="text-xs font-semibold text-sky-500 dark:text-sky-400">{t.year}</time>
                <p className="mt-2 text-gray-700 dark:text-gray-300">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-sky-400 to-sky-500 p-10 sm:p-14 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-2xl font-bold text-white">Have a question? We’re here to help.</h3>
            <p className="mt-2 text-sky-100">Reach out and our travel specialists will get back to you.</p>
          </div>
          <a
            href="mailto:support@flyobo.com"
            className="inline-flex items-center justify-center rounded-xl bg-white text-sky-600 px-6 py-3 text-sm font-semibold hover:bg-sky-100 transition shadow-md"
          >
            Contact Support
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}

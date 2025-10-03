"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Heading from "../../components/MetaData/Heading";
import Link from "next/link";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import Header from "@/app/components/Layout/Header";

export default function CheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();
  const slug = params.get("slug") || "";

  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pkg, setPkg] = useState(null);

  const [travelers, setTravelers] = useState(2);
  const [startDate, setStartDate] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!API_URL) {
          setError("API not configured");
          setLoading(false);
          return;
        }
        if (!slug) {
          setError("Missing package reference");
          setLoading(false);
          return;
        }
        const base = API_URL.replace(/\/$/, "");
        const url = `${base}/package/${slug}`;
        const { data } = await axios.get(url, { withCredentials: true });
        if (cancelled) return;
        const p = data?.foundPackage || data?.package || data?.data?.package || data?.data || data || null;
        setPkg(p);
      } catch (e) {
        if (!cancelled) setError("Unable to load package");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [slug]);

  const price = Number(pkg?.price || 0);
  const total = useMemo(() => Math.max(1, Number(travelers || 1)) * price, [travelers, price]);

  const onSubmit = (e) => {
    e.preventDefault();
    const msg = `Checkout request for ${pkg?.title || "Package"}%0A` +
      `Travelers: ${travelers}%0A` +
      `Start Date: ${startDate || "TBD"}%0A` +
      `Total: ₹${total.toLocaleString('en-IN')}%0A` +
      `Name: ${name}%0AEmail: ${email}%0APhone: ${phone}%0A` +
      (notes ? `Notes: ${encodeURIComponent(notes)}` : "");
    const url = `https://wa.me/919291237399?text=${msg}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <Heading
        title={`Checkout - ${pkg?.title || "Flyobo"}`}
        description={pkg?.destination || "Checkout your travel package"}
        keywords="Checkout, Booking, Travel"
      />
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-40 w-full bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-rose-600 dark:text-rose-400">{error}</div>
        ) : !pkg ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">Package not found</div>
            <Link href="/packages" className="mt-2 inline-block rounded-lg bg-sky-600 text-white px-4 py-2 text-sm hover:bg-sky-700">Browse Packages</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <section className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Traveler Details</h1>
              <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Start Date</label>
                  <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500/60" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Travelers</label>
                  <input type="number" min={1} value={travelers} onChange={(e)=>setTravelers(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500/60" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Full Name</label>
                  <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500/60" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500/60" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Phone</label>
                  <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500/60" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Notes</label>
                  <textarea rows={4} value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Share preferences or questions" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500/60" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <button type="submit" className="inline-flex items-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm">Confirm via WhatsApp</button>
                  <button type="button" onClick={()=>router.push(`/packages/${encodeURIComponent(slug)}`)} className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Back to Package</button>
                </div>
              </form>
            </section>

            {/* Order summary */}
            <aside className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 h-max">
              <div className="text-sm text-gray-600 dark:text-gray-400">Order Summary</div>
              <div className="mt-2 font-semibold text-gray-900 dark:text-white">{pkg?.title}</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{pkg?.destination || pkg?.location}</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">Price per person</div>
                <div className="text-base font-semibold">₹{price.toLocaleString('en-IN')}</div>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">Travelers</div>
                <div className="text-base font-semibold">{Math.max(1, Number(travelers || 1))}</div>
              </div>
              <hr className="my-3 border-gray-200 dark:border-gray-800" />
              <div className="flex items-center justify-between text-lg">
                <div className="text-gray-900 dark:text-white">Total</div>
                <div className="font-bold text-rose-600 dark:text-rose-400">₹{total.toLocaleString('en-IN')}</div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

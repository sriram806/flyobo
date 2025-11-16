"use client";

import React, { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Heading from "../../components/MetaData/Heading";
import Link from "next/link";
import Header from "@/app/components/Layout/Header";
import { useSelector } from "react-redux";
import PackageDetailsPanel from "@/app/components/Packages/Layout/PackageDetailsPanel";


export default function CheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();
  const slug = params?.get("slug") || "";

  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pkg, setPkg] = useState(null);

  // Form state
  const [travelers, setTravelers] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [travelerDetails, setTravelerDetails] = useState([{ name: "", age: "", gender: "" }]);
  const [coupon, setCoupon] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const [formErrors, setFormErrors] = useState({});

  const user = useSelector((s) => s?.auth?.user || null);

  const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
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
        const url = `${API_URL}/package/${encodeURIComponent(slug)}`;
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch package");
        const data = await res.json();
        if (cancelled) return;
        const p = data?.foundPackage || data?.package || data?.data?.package || data?.data || data || null;
        setPkg(p);
      } catch (err) {
        if (!cancelled) setError("Unable to load package");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [slug, API_URL]);

  // auto-fill user (B)
  useEffect(() => {
    if (user) {
      if (!name) setName(user.name || "");
      if (!email) setEmail(user.email || "");
      if (!phone) setPhone(user.phone || "");
    }
  }, [user]);

  // sync travelerDetails length to travelers (H)
  useEffect(() => {
    const n = Math.max(1, Number(travelers || 1));
    setTravelerDetails((prev) => {
      const out = [...prev];
      while (out.length < n) out.push({ name: "", age: "", gender: "" });
      if (out.length > n) out.splice(n);
      return out;
    });
  }, [travelers]);

  const price = useMemo(() => Number(pkg?.price || 0), [pkg?.price]);
  const fee = 100; // fixed fee (I)
  const taxRate = 0.05;
  const subtotal = useMemo(() => Math.max(1, Number(travelers || 1)) * price, [travelers, price]);
  const tax = useMemo(() => Math.round(subtotal * taxRate), [subtotal]);
  const discountAmount = Math.round(appliedDiscount);
  const total = useMemo(() => Math.max(0, subtotal + tax + fee - discountAmount), [subtotal, tax, fee, discountAmount]);

  // date helpers (F)
  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const validate = () => {
    const errs = {};
    if (!startDate) errs.startDate = "Start date is required";
    else if (startDate < todayStr) errs.startDate = "Start date cannot be in the past";
    if (!name || name.trim().length < 2) errs.name = "Please enter your name";
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (!phone || phone.trim().length < 7) errs.phone = "Enter a valid phone";
    travelerDetails.forEach((t, i) => {
      if (!t.name || t.name.trim().length < 1) errs[`traveler_${i}_name`] = "Enter traveler name";
      if (t.age && !/^\d+$/.test(String(t.age))) errs[`traveler_${i}_age`] = "Age must be a number";
    });
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // coupon example
  const applyCoupon = () => {
    if (!coupon) return;
    const code = coupon.trim().toUpperCase();
    if (code === "FLY10") {
      setAppliedDiscount(Math.round(subtotal * 0.1));
      setFormErrors((f) => ({ ...f, coupon: null }));
    } else {
      setAppliedDiscount(0);
      setFormErrors((f) => ({ ...f, coupon: "Invalid coupon" }));
    }
  };

  const setTravelerField = (index, field, value) => {
    setTravelerDetails((prev) => {
      const out = [...prev];
      out[index] = { ...out[index], [field]: value };
      return out;
    });
  };

  const Err = ({ field }) => formErrors[field] ? <div className="text-rose-600 text-xs mt-1">{formErrors[field]}</div> : null;

  // Razorpay helpers
  const loadRazorpayScript = () => new Promise((res, rej) => {
    if (typeof window === "undefined") return rej("no-window");
    if (window.Razorpay) return res(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(true);
    s.onerror = () => rej(new Error("Razorpay SDK failed to load"));
    document.body.appendChild(s);
  });

  // main function: Razorpay -> verify/save -> WhatsApp
  const confirmViaWhatsApp = async (e) => {
    e?.preventDefault?.();

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Build traveler summary text (for later WhatsApp message)
    const travelerText = travelerDetails
      .map((t, i) => `Traveler ${i + 1}: ${t.name || " — "}${t.age ? `, Age: ${t.age}` : ""}${t.gender ? `, ${t.gender}` : ""}`)
      .join("\n");

    // If Razorpay disabled, fallback to just saving & opening WhatsApp
    const enableRazorpay = String(process.env.NEXT_PUBLIC_ENABLE_RAZORPAY || "true").toLowerCase() === "true";

    // If Razorpay enabled: create order -> open checkout -> on success verify -> then save & open WA
    if (enableRazorpay) {
      try {
        if (!API_URL) throw new Error("API not configured");
        await loadRazorpayScript();

        // create order on backend
        const createRes = await fetch(`${API_URL}/payment/razorpay/order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
            body: JSON.stringify({
            amount: total, // your backend may require multiply by 100; adapt accordingly
            currency: "INR",
            packageId: pkg?.slug || pkg?._id || pkg?.id || slug,
            meta: { travelers: Number(travelers), startDate }
          })
        });
        if (!createRes.ok) throw new Error("Failed to create payment order");
        const orderData = await createRes.json(); // { id, amount, currency, key }

        const options = {
          key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount || total * 100,
          currency: orderData.currency || orderData.currency || "INR",
          name: pkg?.title || "Flyobo",
          description: `Booking: ${pkg?.title || slug}`,
          order_id: orderData.id,
          prefill: { name, email, contact: phone },
          handler: async function (response) {
            // response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
            try {
              // verify with backend
              const verifyRes = await fetch(`${API_URL}/payment/razorpay/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  ...response,
                  packageId: pkg?.slug || pkg?._id || pkg?.id || slug,
                  meta: { travelerDetails, startDate, notes, subtotal, tax, fee, discountAmount, total }
                })
              });
              if (!verifyRes.ok) throw new Error("Payment verification failed");
              const verifyData = await verifyRes.json();

              // Optionally save checkout in DB (server may already do it during verify)
              try {
                await fetch(`${API_URL}/checkout/create`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({
                    packageId: pkg?.slug || pkg?._id || pkg?.id || slug,
                    name, email, phone,
                    travelers: Number(travelers),
                    travelerDetails,
                    startDate,
                    subtotal, tax, fee, discountAmount, total,
                    notes,
                    payment: { verified: true, provider: "razorpay", meta: verifyData }
                  })
                });
              } catch (saveErr) {
                console.warn("Could not save checkout after payment:", saveErr);
              }

              // Build WhatsApp message now that payment succeeded
              const encodeLine = (t) => encodeURIComponent(t + "\n");
              let msg =
                encodeLine(`Booking Confirmation (Payment received)`) +
                encodeLine(`Package: ${pkg?.title || "Package"}`) +
                encodeLine(`Travelers: ${travelers}`) +
                encodeLine(travelerText) +
                encodeLine(`Start Date: ${startDate || "TBD"}`) +
                encodeLine(`Subtotal: ₹${subtotal.toLocaleString("en-IN")}`) +
                encodeLine(`Tax: ₹${tax.toLocaleString("en-IN")}`) +
                encodeLine(`Fees: ₹${fee.toLocaleString("en-IN")}`) +
                (discountAmount ? encodeLine(`Discount: -₹${discountAmount.toLocaleString("en-IN")}`) : "") +
                encodeLine(`Total Paid: ₹${total.toLocaleString("en-IN")}`) +
                encodeLine(`Payment ID: ${response.razorpay_payment_id}`) +
                encodeLine(`Name: ${name}`) +
                encodeLine(`Email: ${email}`) +
                encodeLine(`Phone: ${phone}`) +
                (notes ? encodeLine(`Notes: ${notes}`) : "");

              const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919291237999";
              window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");

              // Navigate to success screen (optional)
              router.push(`/booking/success?order=${encodeURIComponent(orderData.id)}`);
            } catch (err) {
              console.error("Verification / post-payment error:", err);
              alert("Payment succeeded but verification failed. Please contact support.");
            }
          },
          modal: {
            ondismiss: function () {
              // User closed the modal; suggest WhatsApp fallback
              const goToWa = confirm("Payment was not completed. Do you want to send a booking request via WhatsApp instead?");
              if (goToWa) {
                // open WA with unpaid booking summary
                const encodeLine = (t) => encodeURIComponent(t + "\n");
                let msg =
                  encodeLine(`Booking Request (Payment not completed)`) +
                  encodeLine(`Package: ${pkg?.title || "Package"}`) +
                  encodeLine(`Travelers: ${travelers}`) +
                  encodeLine(travelerText) +
                  encodeLine(`Start Date: ${startDate || "TBD"}`) +
                  encodeLine(`Total: ₹${total.toLocaleString("en-IN")}`) +
                  encodeLine(`Name: ${name}`) +
                  encodeLine(`Email: ${email}`) +
                  encodeLine(`Phone: ${phone}`) +
                  (notes ? encodeLine(`Notes: ${notes}`) : "");
                const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919291237999";
                window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
              }
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (resp) {
          console.error("Razorpay payment failed", resp.error);
          alert("Payment failed. You can try again or use WhatsApp booking.");
        });
        rzp.open();

      } catch (err) {
        console.error("Razorpay flow error:", err);
        alert("Unable to start payment. You can proceed with WhatsApp booking instead.");
      }

      return;
    }

    // If Razorpay disabled: save (optional) and open WhatsApp
    try {
      if (API_URL) {
        await fetch(`${API_URL}/checkout/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
            body: JSON.stringify({
            packageId: pkg?.slug || pkg?._id || pkg?.id || slug,
            name, email, phone,
            travelers: Number(travelers),
            travelerDetails,
            startDate,
            subtotal, tax, fee, discountAmount, total,
            notes,
            payment: { verified: false, provider: "none" }
          })
        });
      }
    } catch (err) {
      console.warn("Save checkout (no-razorpay) failed:", err);
    }

    const encodeLine = (t) => encodeURIComponent(t + "\n");
    let msg =
      encodeLine(`Booking Request`) +
      encodeLine(`Package: ${pkg?.title || "Package"}`) +
      encodeLine(`Travelers: ${travelers}`) +
      encodeLine(travelerText) +
      encodeLine(`Start Date: ${startDate || "TBD"}`) +
      encodeLine(`Total: ₹${total.toLocaleString("en-IN")}`) +
      encodeLine(`Name: ${name}`) +
      encodeLine(`Email: ${email}`) +
      encodeLine(`Phone: ${phone}`) +
      (notes ? encodeLine(`Notes: ${notes}`) : "");

    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919291237999";
    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
  };

  return (
    <>
      <Heading
        title={`Checkout - ${pkg?.title || "Flyobo"}`}
        description={pkg?.destination || "Checkout your travel package"}
        keywords="Checkout, Booking, Travel"
      />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
          {loading ? (
            <div className="space-y-4 animate-pulse">
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
              <section className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Traveler Details</h1>

                <form className="mt-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Start Date</label>
                    <input type="date" min={todayStr} value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none" />
                    <Err field="startDate" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Travelers</label>
                      <input type="number" min={1} value={travelers} onChange={(e) => setTravelers(Math.max(1, Number(e.target.value || 1)))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none" />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Phone</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none" />
                      <Err field="phone" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Full Name</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none" />
                      <Err field="name" />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none" />
                      <Err field="email" />
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Traveler Information</div>
                    <div className="space-y-3">
                      {travelerDetails.map((t, i) => (
                        <div key={i} className="grid grid-cols-3 gap-3 items-start">
                          <input value={t.name} onChange={(e) => setTravelerField(i, "name", e.target.value)} placeholder={`Traveler ${i + 1} name`} className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none" />
                          <input value={t.age} onChange={(e) => setTravelerField(i, "age", e.target.value)} placeholder="Age" className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none" />
                          <input value={t.gender} onChange={(e) => setTravelerField(i, "gender", e.target.value)} placeholder="Gender" className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none" />
                          <div className="col-span-3 text-xs text-rose-600">
                            <Err field={`traveler_${i}_name`} />
                            <Err field={`traveler_${i}_age`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Notes</label>
                    <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Share preferences or questions" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none" />
                  </div>

                  <div className="flex gap-2 items-start">
                    <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 outline-none" />
                    <button type="button" onClick={applyCoupon} className="rounded-lg bg-sky-600 text-white px-3 py-2 text-sm hover:bg-sky-700">Apply</button>
                    <div className="text-sm text-rose-600"><Err field="coupon" /></div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={confirmViaWhatsApp} className="inline-flex items-center rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white px-4 py-2 text-sm">Pay & Confirm (Razorpay → WhatsApp)</button>
                    <button onClick={() => {
                      // fallback: open WhatsApp without payment
                      const proceed = confirm("Open WhatsApp without payment?");
                      if (proceed) {
                        // reuse confirmViaWhatsApp path for non-razorpay
                        (async () => {
                          // temporarily disable Razorpay by setting env var is not possible at runtime;
                          // instead call the inner no-razorpay flow by toggling env - simpler: call endpoint directly here:
                          // For simplicity, open WA message using the non-razorpay branch by calling confirmViaWhatsApp with override:
                          await (async () => {
                            // replicate non-razorpay branch of confirmViaWhatsApp
                            if (!validate()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
                            try {
                              if (API_URL) {
                                await fetch(`${API_URL}/checkout/create`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  credentials: "include",
                                    body: JSON.stringify({
                                    packageId: pkg?.slug || pkg?._id || pkg?.id || slug,
                                    name, email, phone,
                                    travelers: Number(travelers),
                                    travelerDetails,
                                    startDate,
                                    subtotal, tax, fee, discountAmount, total,
                                    notes,
                                    payment: { verified: false, provider: "manual" }
                                  })
                                });
                              }
                            } catch (err) { console.warn(err); }
                            const encodeLine = (t) => encodeURIComponent(t + "\n");
                            let msg =
                              encodeLine(`Booking Request`) +
                              encodeLine(`Package: ${pkg?.title || "Package"}`) +
                              encodeLine(`Travelers: ${travelers}`) +
                              encodeLine(travelerText) +
                              encodeLine(`Start Date: ${startDate || "TBD"}`) +
                              encodeLine(`Total: ₹${total.toLocaleString("en-IN")}`) +
                              encodeLine(`Name: ${name}`) +
                              encodeLine(`Email: ${email}`) +
                              encodeLine(`Phone: ${phone}`) +
                              (notes ? encodeLine(`Notes: ${notes}`) : "");
                            const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919291237999";
                            window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
                          })();
                        })();
                      }
                    }} className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Send Request via WhatsApp (no payment)</button>

                    <button type="button" onClick={() => router.push(`/packages/${encodeURIComponent(slug)}`)} className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Back to Package</button>
                  </div>
                </form>

                <div className="mt-6">
                  <Suspense fallback={<div className="text-sm text-gray-500">Loading package details...</div>}>
                    <PackageDetailsPanel pkg={pkg} />
                  </Suspense>
                </div>
              </section>

              <aside className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 h-max">
                <div className="text-sm text-gray-600 dark:text-gray-400">Order Summary</div>
                <div className="mt-2 font-semibold text-gray-900 dark:text-white">{pkg?.title}</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{pkg?.destination || pkg?.location}</div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between"><div>Price per person</div><div>₹{price.toLocaleString("en-IN")}</div></div>
                  <div className="flex items-center justify-between"><div>Travelers</div><div>{Math.max(1, Number(travelers || 1))}</div></div>
                  <div className="flex items-center justify-between"><div>Subtotal</div><div>₹{subtotal.toLocaleString("en-IN")}</div></div>
                  <div className="flex items-center justify-between text-sm"><div>Tax (5%)</div><div>₹{tax.toLocaleString("en-IN")}</div></div>
                  <div className="flex items-center justify-between text-sm"><div>Fees</div><div>₹{fee.toLocaleString("en-IN")}</div></div>
                  {discountAmount > 0 && <div className="flex items-center justify-between text-sm text-emerald-700"><div>Discount</div><div>-₹{discountAmount.toLocaleString("en-IN")}</div></div>}
                </div>

                <hr className="my-3 border-gray-200 dark:border-gray-800" />

                <div className="flex items-center justify-between text-lg">
                  <div className="text-gray-900 dark:text-white">Total</div>
                  <div className="font-bold text-rose-600 dark:text-rose-400">₹{total.toLocaleString("en-IN")}</div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

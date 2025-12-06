"use client";

import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Mail, Phone, Send } from "lucide-react";
import Header from "@/Components/Layout/Header";
import Footer from "@/Components/Layout/Footer";
import { NEXT_PUBLIC_BACKEND_URL } from "@/Components/config/env";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState("");
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill name, email and message.");
      return false;
    }
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(form.email)) {
      toast.error("Please provide a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!API_URL) return toast.error("API URL is not configured.");
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/contact`, form, { withCredentials: true, timeout: 15000 });
      if (data?.success) {
        toast.success(data.message || "Message sent successfully.");
        setForm({ name: "", email: "", subject: "", message: "", phone: "" });
      } else {
        toast.error(data?.message || "Failed to send message.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />

      <main className="min-h-[100vh] bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-900 transition-colors duration-300 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Contact support</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">We typically reply within 24 hours. For urgent requests mention it in the message.</p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-600">
                      <Mail size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">support@flyobo.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-600">
                      <Phone size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Phone</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">+91 600 123 4567</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Business hours: Mon–Sat, 9:00 AM – 7:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                      placeholder="you@example.com"
                      required
                      type="email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone (optional)</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject (optional)</label>
                    <input
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                      placeholder="Subject"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Secure & private</span> — we never share your info.
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-white transition ${loading ? "bg-sky-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700"
                      }`}
                    aria-busy={loading}
                  >
                    <Send size={16} />
                    <span>{loading ? "Sending..." : "Send Message"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

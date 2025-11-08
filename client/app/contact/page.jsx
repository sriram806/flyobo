"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import Heading from "../components/MetaData/Heading";
import Header from "../components/Layout/Header";

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

  const API_URL =
    NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

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
      const base = API_URL.replace(/\/$/, "");
      const endpoint = `${base}/contact`;
      const { data } = await axios.post(endpoint, form, {
        withCredentials: true,
      });
      if (data?.success) {
        toast.success(data.message || "Message sent successfully.");
        setForm({
          name: "",
          email: "",
          subject: "",
          message: "",
          phone: "",
        });
      } else {
        toast.error(data?.message || "Failed to send message.");
      }
    } catch (err) {
      console.error("Contact submit error:", err);
      toast.error(
        err?.response?.data?.message ||
        "Failed to send message. Try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Heading
        title="Contact | Flyobo"
        description="Find quick answers to common travel booking questions. Learn about packages, customization, cancellations, and customer support."
        url="https://www.flyobo.com/contact"
      />
      <Header open={open} setOpen={setOpen} route={route} setRoute={setRoute} />
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <h1 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Contact Us
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Have a question or need help? Send us a message and we'll get back to
          you shortly.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">
                Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">
              Phone (optional)
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">
              Subject (optional)
            </label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
              placeholder="Subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">
              Message
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={6}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
              placeholder="Write your message here..."
            ></textarea>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-medium px-5 py-2 rounded-lg shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

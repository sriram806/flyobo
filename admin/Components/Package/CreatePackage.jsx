"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";
import PackageImageUploader from "./PackageImageUploader";
import { useSelector } from "react-redux";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  estimatedPrice: "",
  duration: "",
  destination: "",
  status: "active",
};

export default function CreatePackage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const token = useSelector((t) => t?.auth?.token);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDestId, setSelectedDestId] = useState(null);
  const destDebounceRef = useRef(null);

  const onChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onDestinationInput = (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, destination: value }));
    setSelectedDestId(null);
    setShowSuggestions(value.length >= 2);

    if (destDebounceRef.current) clearTimeout(destDebounceRef.current);
    if (!value || value.length < 2) return setSuggestions([]);

    destDebounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API_URL.replace(/\/$/, "")}/destinations/?q=${encodeURIComponent(
            value
          )}`,
          { withCredentials: true, headers: token }
        );
        const list = res?.data?.data?.items || [];
        setSuggestions(list.slice(0, 10));
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  const pickSuggestion = (dest) => {
    setForm((f) => ({
      ...f,
      destination: `${dest.place}, ${dest.state}, ${dest.country}`,
    }));
    setSelectedDestId(dest._id);
    setShowSuggestions(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!API_URL) return toast.error("API base URL missing");
    if (!form.title.trim() || !String(form.price).trim())
      return toast.error("Title & price are required");

    try {
      setSaving(true);
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === "destination" && selectedDestId) return;
        fd.append(key, val);
      });
      if (selectedDestId) fd.append("destination", selectedDestId);
      if (image?.file) fd.append("image", image.file);
      else if (image?.isUrl) fd.append("imageUrl", image.url);

      const res = await fetch(`${API_URL}/package/`, {
        method: "POST",
        body: fd,
        credentials: "include",
        headers: token
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Package created successfully");
      router.push("/packages?tab=packages");
    } catch (err) {
      setError(err?.message || "Failed to create package");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="lg:col-span-3 space-y-6">

      {/* Header */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Package
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Fill in the details below to add a new travel package.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={submit} className="grid grid-cols-1 gap-6">

        {/* Basic Info */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Package Title"
                value={form.title}
                onChange={onChange("title")}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
            </div>
            <div className="sm:col-span-2">
              <textarea
                placeholder="Package Description"
                value={form.description}
                onChange={onChange("description")}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 min-h-[120px] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
            </div>
            <div className="sm:col-span-2">
              <PackageImageUploader
                label="Package Cover Image"
                image={image}
                disabled={saving}
                onImageChange={setImage}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Duration */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing & Duration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={onChange("price")}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
            <input
              type="number"
              placeholder="Estimated Price"
              value={form.estimatedPrice}
              onChange={onChange("estimatedPrice")}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
            <input
              type="number"
              placeholder="Duration (Days)"
              value={form.duration}
              onChange={onChange("duration")}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Destination & Status */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Destination & Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Destination */}
            <div className="relative sm:col-span-2">
              <input
                type="text"
                placeholder="Search Destination"
                value={form.destination}
                onChange={onDestinationInput}
                onFocus={() => setShowSuggestions(form.destination.length >= 2)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />

              {showSuggestions && (
                <ul className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                  {suggestions.length > 0 ? (
                    suggestions.map((s) => (
                      <li
                        key={s._id}
                        onMouseDown={() => pickSuggestion(s)}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <p className="text-sm text-gray-900 dark:text-white">{s.place}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.state}, {s.country}</p>
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-gray-500 dark:text-gray-400 cursor-default">
                      No destinations found
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* Status */}
            <select
              value={form.status}
              onChange={onChange("status")}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin?tab=package")}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? "Saving..." : "Create Package"}
          </button>
        </div>

      </form>
    </section>
  );
}

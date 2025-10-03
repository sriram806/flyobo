"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  estimatedPrice: "",
  duration: "", 
  destination: "",
  status: "active",
};

export default function Page() {
  const router = useRouter();
  const API_URL =
    NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const onChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!API_URL) return toast.error("API base URL is missing");
    if (!form.title?.trim() || !String(form.price).trim())
      return toast.error("Title and price are required");

    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        estimatedPrice: Number(form.estimatedPrice) || undefined,
        duration: Number(form.duration) || 0,
        destination: form.destination.trim(),
        status: form.status,
      };

      await axios.post(`${API_URL}/package/`, payload, {
        withCredentials: true,
      });

      toast.success("Package created");
      router.push("/admin/packages");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create package";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="lg:col-span-3">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Package
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Fill the details below to add a new package.
          </p>

          <form
            onSubmit={submit}
            className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                value={form.title}
                onChange={onChange("title")}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Enter package title"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={onChange("description")}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Enter package description"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price
              </label>
              <input
                type="number"
                value={form.price}
                onChange={onChange("price")}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="e.g. 4999"
              />
            </div>

            {/* Estimated Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Estimated Price
              </label>
              <input
                type="number"
                value={form.estimatedPrice}
                onChange={onChange("estimatedPrice")}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="e.g. 5999"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Duration (Days)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={onChange("duration")}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="e.g. 5"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Destination
              </label>
              <input
                value={form.destination}
                onChange={onChange("destination")}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="City / Region"
              />
            </div>

            {/* Status */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={form.status}
                onChange={onChange("status")}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/admin/packages")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 text-white px-4 py-2 text-sm hover:bg-rose-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

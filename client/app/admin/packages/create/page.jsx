"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import PackageImageUploader from "@/app/components/Packages/PackageImageUploader";
import authRequest from "@/app/utils/authRequest";

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
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  const onChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!API_URL) return toast.error("API base URL is missing");
    if (!form.title?.trim() || !String(form.price).trim())
      return toast.error("Title and price are required");

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('price', Number(form.price));
      formData.append('estimatedPrice', Number(form.estimatedPrice) || 0);
      formData.append('duration', Number(form.duration) || 0);
      formData.append('destination', form.destination.trim());
      formData.append('status', form.status);
      
      // Add image file or URL
      if (image && image.file) {
        formData.append('image', image.file);
      } else if (image && image.url && image.isUrl) {
        formData.append('imageUrl', image.url);
      }

      await authRequest.postForm(`${API_URL}/package/`, formData);
      toast.success("Package created successfully");
      router.push("/admin/packages");
    } catch (err) {
      // Error handling is done in authRequest utility
      const msg = err?.response?.data?.message || err?.message || "Failed to create package";
      setError(msg);
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

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:bg-red-950/40 dark:border-red-900">
              {error}
            </div>
          )}

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

            {/* Package Cover Image */}
            <div className="sm:col-span-2">
              <PackageImageUploader
                image={image}
                onImageChange={setImage}
                disabled={saving}
                label="Package Cover Image"
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

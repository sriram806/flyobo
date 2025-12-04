"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

const emptyForm = {
  place: "",
  slug: "",
  state: "",
  country: "",
  shortDescription: "",
  tags: "",
  popular: false,
  isIndia: true,
};

const indianStates = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra",
  "Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry"
];

export default function CreateDestination() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  const onChange = (key) => (e) => {
    const value = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [key]: value }));
  };

  const onFileChange = (e) => {
    const file = e?.target?.files?.[0] || null;
    setCoverImageFile(file);
    if (file) {
      setCoverImageUrl("");
      setPreview(URL.createObjectURL(file));
    }
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!API_URL) return toast.error("API base URL is missing");
    if (!form.place) return toast.error("Place is required");

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();
      formData.append("place", form.place);
      if (form.slug) formData.append("slug", form.slug);
      formData.append("state", form.state);
      formData.append("country", form.isIndia ? "India" : form.country);
      formData.append("shortDescription", form.shortDescription);
      const tagsArray = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      if (tagsArray.length) formData.append("tags", JSON.stringify(tagsArray));
      formData.append("popular", form.popular ? "true" : "false");

      if (coverImageFile) formData.append("coverImage", coverImageFile);
      else if (coverImageUrl) formData.append("coverImageUrl", coverImageUrl);

      const { data } = await axios.post(`${API_URL}/destinations/`, formData, {
        withCredentials: true,
      });

      toast.success("Destination created successfully");
      router.push("/destinations?tab=create");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to create destination");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Create Destination
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left Panel — Form Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Place</label>
            <input
              value={form.place}
              onChange={onChange("place")}
              placeholder="City or place"
              className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug (optional)</label>
            <input
              value={form.slug}
              onChange={onChange("slug")}
              placeholder="custom-slug"
              className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isIndia}
              onChange={e => setForm({ ...form, isIndia: e.target.checked, state: "" })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Is this in India?</span>
          </div>

          {form.isIndia ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
              <select
                value={form.state}
                onChange={onChange("state")}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select state</option>
                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State/Region</label>
                <input
                  value={form.state}
                  onChange={onChange("state")}
                  placeholder="State or Region"
                  className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                <input
                  value={form.country}
                  onChange={onChange("country")}
                  placeholder="Enter country name"
                  className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</label>
            <textarea
              value={form.shortDescription}
              onChange={onChange("shortDescription")}
              placeholder="Brief description"
              className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.popular}
              onChange={onChange("popular")}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Mark as popular</span>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/destinations?tab=create")}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </div>

        {/* Right Panel — Image Preview & Tags */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image</label>
            <input
              value={coverImageUrl}
              onChange={e => { setCoverImageUrl(e.target.value); if(e.target.value) { setCoverImageFile(null); setPreview(e.target.value); } }}
              placeholder="Image URL"
              className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input type="file" accept="image/*" onChange={onFileChange} className="mt-2 text-sm text-gray-700 dark:text-gray-300" />
            {preview && <img src={preview} alt="Preview" className="mt-3 w-full h-80 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={onChange("tags")}
              placeholder="beach, mountain, heritage"
              className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

      </form>
    </section>
  );
}

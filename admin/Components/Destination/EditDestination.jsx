"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const emptyForm = {
  place: "",
  slug: "",
  state: "",
  country: "",
  shortDescription: "",
  description: "",
  tags: "",
  popular: false,
};

export default function EditDestination({ destinationId: propDestinationId } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  // Extract ID from URL params if not passed as prop
  const idFromParams =
    searchParams?.get("id") ||
    searchParams?.get("_id") ||
    searchParams?.get("slug");

  const destinationId = propDestinationId || idFromParams;

  // ---------------------------------------------
  // LOAD DESTINATION
  // ---------------------------------------------
  useEffect(() => {
    if (!destinationId) {
      setError("Destination ID missing");
      setLoading(false);
      return;
    }

    const loadDestination = async () => {
      try {
        const res = await fetch(`${API_URL}/destinations/${destinationId}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch destination");

        const result = await res.json();

        // IMPORTANT FIX: API returns { success, data }
        const d = result?.data;

        if (!d) throw new Error("Invalid destination response");

        setForm({
          place: d.place || "",
          slug: d.slug || "",
          state: d.state || "",
          country: d.country || "",
          shortDescription: d.shortDescription || "",
          description: d.description || "",
          tags: d.tags?.join(", ") || "",
          popular: !!d.popular,
        });

        if (d.coverImage?.url) setCoverImageUrl(d.coverImage.url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDestination();
  }, [destinationId, API_URL]);

  // ---------------------------------------------
  // SIMPLE HANDLERS
  // ---------------------------------------------
  const onChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    setCoverImageFile(file);
    if (file) setCoverImageUrl("");
  };

  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  // ---------------------------------------------
  // SUBMIT
  // ---------------------------------------------
  const submit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "tags") {
          const tagsArr = value
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          formData.append("tags", JSON.stringify(tagsArr));
        } else {
          formData.append(key, value || "");
        }
      });

      if (coverImageFile) {
        formData.append("coverImage", coverImageFile);
      } else if (coverImageUrl) {
        formData.append("coverImageUrl", coverImageUrl);
      }

      const resp = await axios.put(
        `${API_URL}/destinations/${destinationId}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            if (event.total) {
              setUploadProgress(Math.round((event.loaded * 100) / event.total));
            }
          },
        }
      );

      if (!resp.data.success) throw new Error(resp.data.message);

      toast.success("Destination updated!");
      router.push("/destinations?tab=alldestinations");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <section className="lg:col-span-3 space-y-6">

      {/* --- HEADER --- */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Destination
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Modify destination details
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-900/30 p-3 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* --- FORM START --- */}
      <form onSubmit={submit} className="space-y-6">

        {/* --------------------------------- */}
        {/* BASIC DETAILS */}
        {/* --------------------------------- */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* PLACE */}
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">Place*</label>
              <input
                value={form.place}
                onChange={onChange("place")}
                placeholder="Place name"
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>

            {/* SLUG */}
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">Slug</label>
              <input
                value={form.slug}
                onChange={onChange("slug")}
                placeholder="auto-generated"
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>

            {/* STATE */}
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">State</label>
              <input
                value={form.state}
                onChange={onChange("state")}
                placeholder="State"
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>

            {/* COUNTRY */}
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">Country</label>
              <input
                value={form.country}
                onChange={onChange("country")}
                placeholder="Country"
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              />
            </div>

          </div>
        </div>

        {/* --------------------------------- */}
        {/* DESCRIPTIONS */}
        {/* --------------------------------- */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Description
          </h2>

          <label className="text-sm text-gray-700 dark:text-gray-300">
            Short Description
          </label>
          <textarea
            value={form.shortDescription}
            onChange={onChange("shortDescription")}
            className="mt-1 mb-4 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm h-20"
          />

          <label className="text-sm text-gray-700 dark:text-gray-300">
            Full Description
          </label>
          <textarea
            value={form.description}
            onChange={onChange("description")}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm h-36"
          />
        </div>

        {/* --------------------------------- */}
        {/* IMAGE UPLOAD */}
        {/* --------------------------------- */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cover Image
          </h2>

          {/* URL */}
          <input
            value={coverImageUrl}
            onChange={(e) => {
              setCoverImageUrl(e.target.value);
              if (e.target.value) setCoverImageFile(null);
            }}
            placeholder="Image URL"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm mb-3"
          />

          {/* FILE */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="mb-3"
          />

          {/* PREVIEW */}
          {(coverImageUrl || coverImageFile) && (
            <div className="mt-3">
              <img
                src={
                  coverImageFile
                    ? URL.createObjectURL(coverImageFile)
                    : coverImageUrl
                }
                className="rounded-lg mt-2 w-full max-h-60 object-cover"
              />

              <button
                type="button"
                onClick={removeCoverImage}
                className="mt-3 text-sm text-red-500"
              >
                Remove Image
              </button>
            </div>
          )}

          {/* PROGRESS */}
          {uploadProgress > 0 && (
            <div className="mt-4 w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-2 bg-sky-600"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* --------------------------------- */}
        {/* TAGS + POPULAR */}
        {/* --------------------------------- */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Additional Settings
          </h2>

          <label className="text-sm text-gray-700 dark:text-gray-300">
            Tags (comma separated)
          </label>
          <input
            value={form.tags}
            onChange={onChange("tags")}
            placeholder="beach, adventure, heritage"
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm mb-4"
          />

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.popular}
              onChange={onChange("popular")}
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Mark as Popular
            </span>
          </label>
        </div>

        {/* --------------------------------- */}
        {/* ACTION BUTTONS */}
        {/* --------------------------------- */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/destinations?tab=packages")}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>
    </section>
  );
}

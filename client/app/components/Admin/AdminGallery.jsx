"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";

const CATEGORIES = [
  "nature",
  "group",
  "city",
  "adventure",
  "wildlife",
  "culture",
  "beach",
  "heritage",
  "other",
];

export default function AdminGallery() {
  const API_BASE = useMemo(() => {
    const base = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";
    return base.replace(/\/$/, "");
  }, []);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [editId, setEditId] = useState(null);



  const authHeader = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setImageFile(null);
    setImagePreview("");
    setImageUrl("");
    setCategory("");
    setTags("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const onEdit = (item) => {
    setEditId(item._id);
    setTitle(item.title);
    setImageFile(null);
    setImageUrl("");
    setImagePreview(item.image); // Show existing image as preview
    setCategory(item.category);
    setTags(Array.isArray(item.tags) ? item.tags.join(", ") : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onCancelEdit = () => resetForm();

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`${API_BASE}/gallery`, {
        withCredentials: true,
        headers: authHeader(),
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to fetch gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [API_BASE]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !category) {
      setError("Please fill all required fields");
      return;
    }

    if (!editId && !imageFile && !imageUrl.trim()) {
      setError("Please provide an image file or a valid image URL");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', String(category).toLowerCase().trim());
      formData.append('tags', tags.split(",").map((t) => t.trim()).filter(Boolean).join(','));
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl.trim()) {
        formData.append('imageUrl', imageUrl.trim());
      }

      if (editId) {
        const { data } = await axios.put(`${API_BASE}/gallery/${editId}`, formData, {
          withCredentials: true,
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data',
          },
        });
        setItems((prev) => prev.map((x) => (x._id === editId ? data : x)));
        toast.success("Gallery item updated!");
      } else {
        const { data } = await axios.post(`${API_BASE}/gallery`, formData, {
          withCredentials: true,
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data',
          },
        });
        setItems((prev) => [data, ...prev]);
        toast.success("Gallery item added!");
      }

      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          (editId ? "Failed to update item" : "Failed to add item")
      );
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this gallery item?")) return;

    try {
      setLoading(true);
      setError("");
      await axios.delete(`${API_BASE}/gallery/${id}`, {
        withCredentials: true,
        headers: authHeader(),
      });
      setItems((prev) => prev.filter((x) => x._id !== id));
      toast.success("Gallery item deleted!");
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Form Section */}
      <div className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin • Gallery</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create, edit, and delete gallery items.
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:bg-red-950/40 dark:border-red-900">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-12">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            disabled={loading}
            className="md:col-span-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-gray-900 dark:text-white disabled:opacity-60"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            className="md:col-span-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-gray-900 dark:text-white disabled:opacity-60"
          />

          <input
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              if (e.target.value) {
                setImagePreview(e.target.value);
                setImageFile(null);
              }
            }}
            placeholder="Or paste image URL"
            disabled={loading}
            className="md:col-span-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-gray-900 dark:text-white disabled:opacity-60"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
            className="md:col-span-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-gray-900 dark:text-white disabled:opacity-60"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            disabled={loading}
            className="md:col-span-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-gray-900 dark:text-white disabled:opacity-60"
          />

          <div className="md:col-span-1 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2 text-white ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (editId ? "Updating..." : "Saving...") : editId ? "Update" : "Add"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="md:col-span-12 mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="h-40 w-full object-cover rounded-lg border dark:border-gray-700"
              />
            </div>
          )}
        </form>
      </div>

      {/* Gallery List Section */}
      <div className="rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead> 
              <tr className="text-xs tracking-wider text-gray-600 bg-gray-300/90 dark:bg-gray-700/30 dark:text-gray-300">
                <th className="px-3 py-2 text-left">Thumbnail</th>
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Tags</th>
                <th className="px-3 py-2 text-left">Uploaded</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>
                    No items found
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr
                    key={it._id}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={it.image}
                            alt={it.title}
                            onError={(e) => {
                              e.currentTarget.src = '/images/placeholder.png';
                            }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{it.title || "Untitled"}</td>
                    <td className="px-3 py-2 capitalize text-gray-700 dark:text-gray-300">
                      {it.category || "-"}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      {Array.isArray(it.tags) ? it.tags.join(", ") : (it.tags || "-")}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      {it.uploadedBy?.name || it.uploadedBy?.email || "-"}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      {it.createdAt ? new Date(it.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(it)}
                          title="Edit"
                          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 px-2 py-1 text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                          </svg>
                          <span className="hidden sm:inline">Edit</span>
                        </button>

                        <button
                          onClick={() => onDelete(it._id)}
                          title="Delete"
                          className="inline-flex items-center gap-2 rounded-md bg-red-600 hover:bg-red-700 px-2 py-1 text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                          </svg>
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

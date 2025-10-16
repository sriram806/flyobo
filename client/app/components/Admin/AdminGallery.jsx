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

    if (!editId && !imageFile) {
      setError("Please select an image to upload");
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
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
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
            className="md:col-span-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-gray-900 dark:text-white disabled:opacity-60"
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
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <th className="border px-3 py-2 text-left">Image</th>
                <th className="border px-3 py-2 text-left">Title</th>
                <th className="border px-3 py-2 text-left">Category</th>
                <th className="border px-3 py-2 text-left">Tags</th>
                <th className="border px-3 py-2 text-left">Created</th>
                <th className="border px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-6 text-center" colSpan={6}>
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center text-gray-500" colSpan={6}>
                    No items found
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it._id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="border px-3 py-2">
                      <img
                        src={it.image}
                        alt={it.title}
                        className="h-16 w-24 object-cover rounded"
                      />
                    </td>
                    <td className="border px-3 py-2 text-gray-900 dark:text-white">{it.title}</td>
                    <td className="border px-3 py-2 capitalize text-gray-700 dark:text-gray-300">
                      {it.category}
                    </td>
                    <td className="border px-3 py-2 text-gray-700 dark:text-gray-300">
                      {Array.isArray(it.tags) ? it.tags.join(", ") : "-"}
                    </td>
                    <td className="border px-3 py-2 text-gray-700 dark:text-gray-300">
                      {new Date(it.createdAt).toLocaleString()}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(it)}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(it._id)}
                          className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-2 text-white"
                        >
                          Delete
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

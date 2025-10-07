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
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [editId, setEditId] = useState(null);

  // Ensure pasting into the Image URL field works reliably across browsers
  const handleImagePaste = (e) => {
    try {
      const text = e.clipboardData?.getData("text") || window.clipboardData?.getData("Text") || "";
      if (text) {
        e.preventDefault();
        setImage(text.trim());
      }
    } catch (err) {
      // Fallback: let default paste behavior occur
    }
  };

  const authHeader = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setImage("");
    setCategory("");
    setTags("");
  };

  const onEdit = (it) => {
    setEditId(it._id);
    setTitle(it.title || "");
    setImage(it.image || "");
    setCategory(it.category || "");
    setTags(Array.isArray(it.tags) ? it.tags.join(", ") : "");
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
    if (!title || !image || !category) {
      setError("Please provide title, image URL and category");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const payload = {
        title: title.trim(),
        image: image.trim(),
        category: String(category).toLowerCase().trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      if (editId) {
        const { data } = await axios.put(`${API_BASE}/gallery/${editId}`, payload, {
          withCredentials: true,
          headers: authHeader(),
        });
        setItems((prev) => prev.map((x) => (x._id === editId ? data : x)));
        toast.success("Gallery item updated!");
      } else {
        const { data } = await axios.post(`${API_BASE}/gallery`, payload, {
          withCredentials: true,
          headers: authHeader(),
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
            type="url"
            inputMode="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            onPaste={handleImagePaste}
            placeholder="Image URL"
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
          {image && (
            <div className="md:col-span-12 mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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

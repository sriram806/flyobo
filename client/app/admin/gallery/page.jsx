"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import AdminProtected from "@/app/hooks/adminProtected";

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

const AdminGalleryPage = () => {
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

  const authHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

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
    if (!API_BASE) {
      setError("NEXT_PUBLIC_BACKEND_URL is not configured");
      return;
    }
    fetchItems();
  }, [API_BASE]);

  const onCreate = async (e) => {
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
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const { data } = await axios.post(`${API_BASE}/gallery`, payload, {
        withCredentials: true,
        headers: authHeader(),
      });
      setItems((prev) => [data, ...prev]);
      setTitle("");
      setImage("");
      setCategory("");
      setTags("");
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!id) return;
    const confirm = window.confirm("Delete this gallery item?");
    if (!confirm) return;
    try {
      setLoading(true);
      setError("");
      await axios.delete(`${API_BASE}/gallery/${id}`, {
        withCredentials: true,
        headers: authHeader(),
      });
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminProtected>
    <div className="min-h-screen px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-bold">Admin • Gallery</h1>
      <p className="text-sm text-gray-600">Create, list and delete gallery items.</p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onCreate} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-12">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="md:col-span-3 rounded-lg border px-3 py-2"
        />
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL"
          className="md:col-span-4 rounded-lg border px-3 py-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="md:col-span-2 rounded-lg border px-3 py-2"
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
          className="md:col-span-2 rounded-lg border px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="md:col-span-1 rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Add"}
        </button>
      </form>

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">Image</th>
              <th className="border px-3 py-2 text-left">Title</th>
              <th className="border px-3 py-2 text-left">Category</th>
              <th className="border px-3 py-2 text-left">Tags</th>
              <th className="border px-3 py-2 text-left">Created</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id}>
                <td className="border px-3 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image} alt={it.title} className="h-16 w-24 object-cover rounded" />
                </td>
                <td className="border px-3 py-2">{it.title}</td>
                <td className="border px-3 py-2 capitalize">{it.category}</td>
                <td className="border px-3 py-2">{Array.isArray(it.tags) ? it.tags.join(", ") : "-"}</td>
                <td className="border px-3 py-2">{new Date(it.createdAt).toLocaleString()}</td>
                <td className="border px-3 py-2 text-center">
                  <button
                    onClick={() => onDelete(it._id)}
                    disabled={loading}
                    className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-60"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="border px-3 py-6 text-center text-gray-500">
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </AdminProtected>
  );
};

export default AdminGalleryPage;
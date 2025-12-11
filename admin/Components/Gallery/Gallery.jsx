"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Loading from "../Loading/Loading";
import { useSelector } from "react-redux";

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

const input = `w-full rounded-xl border border-gray-300 dark:border-gray-700  bg-white dark:bg-gray-900  px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 \
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out`;

export default function AdminGallery() {
    const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = useSelector((t) => t?.auth?.token)

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

    const categoryCounts = useMemo(() => {
        const map = {};
        CATEGORIES.forEach((c) => (map[c] = 0));
        items.forEach((it) => {
            const cat = String(it.category || "other").toLowerCase();
            map[cat] = (map[cat] || 0) + 1;
        });
        return map;
    }, [items]);

    const totalImages = items.length;



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

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("File must be under 5MB");
            return;
        }

        setImageFile(file);

        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const onEdit = (item) => {
        setEditId(item._id);
        setTitle(item.title);
        setImagePreview(item.image);
        setCategory(item.category);
        setTags(Array.isArray(item.tags) ? item.tags.join(", ") : "");
        setImageFile(null);
        setImageUrl("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError("");
            const { data } = await axios.get(`${API_URL}/gallery`)
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error("Failed to fetch images");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [API_URL]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !category) return setError("Fill required fields");

        if (!editId && !imageFile && !imageUrl.trim()) {
            return toast.loading("Upload image or paste image URL");
        }

        try {
            setLoading(true);
            const fd = new FormData();
            fd.append("title", title.trim());
            fd.append("category", category.trim());
            fd.append(
                "tags",
                tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .join(",")
            );

            if (imageFile) fd.append("image", imageFile);
            else if (imageUrl) fd.append("imageUrl", imageUrl.trim());

            if (editId) {
                const { data } = await axios.put(
                    `${API_BASE}/gallery/${editId}`,
                    fd,
                    { headers: token }
                );
                setItems((p) => p.map((x) => (x._id === editId ? data : x)));
                toast.success("Updated successfully!");
            } else {
                const { data } = await axios.post(`${API_BASE}/gallery`, fd, {
                    headers: authHeader(),
                });
                setItems((p) => [data, ...p]);
                toast.success("Added successfully!");
            }

            resetForm();
        } catch (e) {
            setError("Failed to save");
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async (id) => {
        if (!confirm("Delete this image?")) return;

        try {
            setLoading(true);
            await axios.delete(`${API_BASE}/gallery/${id}`, {
                headers: token,
            });
            setItems((p) => p.filter((x) => x._id !== id));
            toast.success("Deleted!");
        } catch (e) {
            setError("Failed to delete");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />
    }

    return (
        <div className="space-y-8">
            <Toaster position="top-right" />

            {/* HEADER */}
            <div>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage gallery images, categories, and tags with ease.
                </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-4 bg-gray-200 text-gray-900 dark:text-gray-200 border-gray-300 dark:bg-gray-900 shadow rounded-xl border dark:border-gray-700">
                    <p className="text-xs text-gray-500">Total Images</p>
                    <p className="text-2xl font-bold">{totalImages}</p>
                </div>

                {Object.entries(categoryCounts).map(([c, count]) => (
                    <div
                        key={c}
                        className="p-4 bg-gray-200 text-gray-900 dark:text-gray-200 border-gray-300 dark:bg-gray-900 shadow rounded-xl border dark:border-gray-700"
                    >
                        <p className="text-xs text-gray-500 capitalize">{c}</p>
                        <p className="text-xl font-semibold">{count}</p>
                    </div>
                ))}
            </div>

            {/* FORM */}
            <div className="p-6 bg-gray-200 border-gray-300 dark:bg-gray-900 shadow-lg rounded-xl border dark:border-gray-700">
                <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {editId ? "Edit Image" : "Add Image"}
                </h2>

                {error && (
                    <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-900/40">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={onSubmit}
                    className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-6"
                >
                    {/* TITLE */}
                    <input
                        className={`md:col-span-6 ${input}`}
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    {/* FILE */}
                    <input
                        type="file"
                        className={`md:col-span-1 ${input}`}
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {/* URL */}
                    <input
                        className={`md:col-span-3 ${input}`}
                        placeholder="Image URL"
                        value={imageUrl}
                        onChange={(e) => {
                            setImageUrl(e.target.value);
                            setImagePreview(e.target.value);
                            setImageFile(null);
                        }}
                    />

                    {/* CATEGORY */}
                    <select
                        className={`md:col-span-1 ${input}`}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Select Category</option>
                        {CATEGORIES.map((x) => (
                            <option key={x} value={x}>
                                {x}
                            </option>
                        ))}
                    </select>

                    {/* TAGS */}
                    <input
                        className={`md:col-span-1 ${input}`}
                        placeholder="Tags (comma separated)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />

                    {/* BUTTONS */}
                    <div className="md:col-span-6 flex gap-3 mt-2">
                        <button
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {editId ? "Update" : "Save"}
                        </button>

                        {editId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    {/* PREVIEW */}
                    {imagePreview && (
                        <div className="md:col-span-6">
                            <img
                                src={imagePreview}
                                className="rounded-lg w-full h-48 object-cover border dark:border-gray-700"
                            />
                        </div>
                    )}
                </form>
            </div>

            {/* TABLE */}
            <div className="p-6 bg-gray-200 border-gray-300 dark:bg-gray-900 shadow-lg rounded-xl border dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-400 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                                <th className="px-3 py-2 text-left">Image</th>
                                <th className="px-3 py-2 text-left">Title</th>
                                <th className="px-3 py-2">Category</th>
                                <th className="px-3 py-2">Tags</th>
                                <th className="px-3 py-2">Created</th>
                                <th className="px-3 py-2 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((it) => (
                                <tr
                                    key={it._id}
                                    className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                >
                                    <td className="px-3 py-2">
                                        <img
                                            src={it.image}
                                            className="h-16 w-24 rounded object-cover border dark:border-gray-700"
                                        />
                                    </td>

                                    <td className="px-3 py-2 text-gray-900 dark:text-gray-200">{it.title}</td>

                                    <td className="px-3 py-2">
                                        <span className="px-2 py-1 text-gray-900 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded text-xs capitalize">
                                            {it.category}
                                        </span>
                                    </td>

                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                                        {Array.isArray(it.tags)
                                            ? it.tags.join(", ")
                                            : "-"} -
                                    </td>

                                    <td className="px-3 py-2 text-gray-900 dark:text-gray-200">
                                        {new Date(it.createdAt).toLocaleDateString()}
                                    </td>

                                    <td className="px-3 py-2 text-center flex gap-2 justify-center">
                                        <button
                                            onClick={() => onEdit(it)}
                                            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => onDelete(it._id)}
                                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {items.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="text-center py-6 text-gray-500"
                                    >
                                        No images found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

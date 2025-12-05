"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AllDestinations() {
  const router = useRouter();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const apiBase = API_URL.replace(/\/$/, "");

  // Fetch destinations (API is consistent now)
  const fetchDestinations = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${apiBase}/destinations/`, {
        withCredentials: true,
      });

      // API SHAPE HANDLING
      const items =
        res?.data?.data?.items ||
        res?.data?.items ||
        res?.data?.data ||
        [];

      setDestinations(items);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load destinations"
      );
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // Filter logic
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return destinations;

    return destinations.filter((d) => {
      const inPlace = (d.place || "").toLowerCase().includes(q);
      const inCountry = (d.country || "").toLowerCase().includes(q);
      const inTags = (d.tags || []).join(",").toLowerCase().includes(q);
      return inPlace || inCountry || inTags;
    });
  }, [search, destinations]);

  // Delete destination
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await axios.delete(`${apiBase}/destination/${deleteId}`, {
        withCredentials: true,
      });

      toast.success("Destination deleted successfully");
      setDestinations((prev) => prev.filter((d) => d._id !== deleteId));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleteId(null);
    }
  };

  // EDIT BUTTON → new route format (use relative admin route)
  const handleEdit = (id) => {
    if (!id) return toast.error("Invalid ID");

    router.push(`destinations?tab=edit&id=${id}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Destinations
        </h1>

        <button
          onClick={() => router.push("destinations?tab=create")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Destination
        </button>
      </div>

      {/* Search */}
      <div className="mb-5 flex flex-col md:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Search by place, country, tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg dark:border-gray-700 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="p-3 rounded-tl-lg">Cover</th>
              <th className="p-3">Place</th>
              <th className="p-3">Country</th>
              <th className="p-3">Tags</th>
              <th className="p-3 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center text-gray-500 dark:text-gray-300"
                >
                  Loading...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No destinations found.
                </td>
              </tr>
            )}

            {filtered.map((d, i) => (
              <tr
                key={d._id || `dest-${i}`}
                className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="p-3">
                  <img
                    src={d.coverImage?.url}
                    alt={d.place}
                    className="w-24 h-16 rounded object-cover"
                  />
                </td>

                <td className="p-3 font-medium text-gray-900 dark:text-gray-100">
                  {d.place}
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300">
                  {d.country}
                </td>

                <td className="p-3 text-gray-700 dark:text-gray-300">
                  {(d.tags || []).slice(0, 3).join(", ")}
                </td>

                <td className="p-3 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(d._id)}
                      className="px-3 py-1 border rounded-lg dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setDeleteId(d._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Confirm Delete
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              This destination will be permanently deleted. Continue?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-md bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

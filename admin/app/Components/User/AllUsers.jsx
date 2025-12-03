"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import Loading from "../Loading/Loading";

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const base = process.env.NEXT_PUBLIC_BACKEND_URL;

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${base}/user/get-all-users`, {
        credentials: "include",
      });
      const json = await res.json();
      setUsers(json?.users || []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!q) return users;
    const s = q.toLowerCase();
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s)
    );
  }, [users, q]);

  async function handleDelete(id) {
    if (!confirm("Delete this user?")) return;

    try {
      const res = await fetch(`${base}/user/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } else {
        alert(json?.message || "Delete failed");
      }
    } catch (err) {
      alert(String(err));
    }
  }

  return (
    <section className="m-6 min-h-screen bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-extrabold text-gray-800 dark:text-gray-100">
          All Users
        </h1>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search users..."
          className="px-3 py-2 w-72 rounded-lg border bg-gray-200 border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded shadow border border-gray-300 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-300">
            <Loading />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                <tr>
                  {["Name", "Email", "Role", "Created", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="p-3 text-left bg-gray-400 dark:bg-gray-900 font-medium text-gray-700 dark:text-gray-200"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u._id}
                    className="border-t bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                  >
                    <td className="p-3 text-gray-800 dark:text-gray-200">
                      {u.name}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">
                      {u.email}
                    </td>
                    <td className="p-3 capitalize text-gray-700 dark:text-gray-200">
                      {u.role}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">
                      {new Date(u.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiTrash2, FiUserPlus, FiRefreshCw, FiKey, FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Loading from "../Loading/Loading";
import toast from "react-hot-toast";

export default function ManageAdmin() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [error, setError] = useState("");
    const [changePwdOpen, setChangePwdOpen] = useState(false);
    const [changeTarget, setChangeTarget] = useState(null);

    const base = process.env.NEXT_PUBLIC_BACKEND_URL;

    async function load() {
        setLoading(true);
        try {
            const res = await fetch(`${base}/user/get-all-users`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
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
        const admins = users.filter((u) => String(u.role).toLowerCase() === "admin");
        if (!q) return admins;

        const s = q.toLowerCase();
        return admins.filter(
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
            if (res.ok && json?.success)
                setUsers((prev) => prev.filter((u) => u._id !== id));
            else alert(json?.message || "Delete failed");
        } catch (err) {
            alert(String(err));
        }
    }

    async function changeRole(id, role) {
        if (!confirm(`Change role to ${role}?`)) return;
        try {
            const res = await fetch(`${base}/admin/edit-user-role/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ role }),
            });
            const json = await res.json();

            if (res.ok && json?.success) {
                const updated = json.data;
                setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
            } else {
                alert(json?.message || "Role update failed");
            }
        } catch (err) {
            alert(String(err));
        }
    }

    async function submitChangePassword(userId, newPassword, onDone) {
            try {
                const res = await fetch(`${base}/admin/change-password/${userId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ newPassword }),
                });
            const json = await res.json();

            if (res.ok && json?.success) {
                onDone(true);
                toast.success("Password changed successfully");
                setChangePwdOpen(false);
            } else {
                onDone(false);
                toast.error(json?.message || "Password change failed");
            }
        } catch (err) {
            onDone(false);
            alert(String(err));
        }
    }

    return (
        <section className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">

            {/* TOP BAR */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Manage Admins
                </h2>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search admin..."
                            className="pl-10 px-3 py-2 rounded border w-72 
                                bg-gray-200 border-gray-300 text-gray-700 placeholder-gray-500
                                dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700"
                        />
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={() => load()}
                        aria-label="Refresh"
                        className="px-3 py-2 rounded bg-gray-200 border border-gray-300 text-gray-700
                        dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200
                        hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700"
                    >
                        <FiRefreshCw />
                    </button>

                    {/* Add Admin */}
                    <button
                        onClick={() => router.push(`/users?tab=create`)}
                        className="flex items-center gap-2 px-4 py-2 rounded bg-sky-600 hover:bg-sky-700 text-white
                        focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700"
                    >
                        <FiUserPlus /> Add Admin
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-300 dark:border-gray-700">
                {loading ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-300"><Loading /></div>
                ) : error ? (
                    <div className="p-6 text-center text-red-500 dark:text-red-400">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-gray-700 dark:text-gray-200">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">Name</th>
                                    <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">Email</th>
                                    <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">Role</th>
                                    <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">Created</th>
                                    <th className="p-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map((u, i) => (
                                    <tr
                                        key={u._id}
                                        className={`border-t dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                            i % 2 === 0
                                                ? "bg-white dark:bg-gray-800"
                                                : "bg-gray-50 dark:bg-gray-900"
                                        }`}
                                    >
                                        <td className="p-3 text-gray-700 dark:text-gray-200">{u.name}</td>
                                        <td className="p-3 text-gray-700 dark:text-gray-200">{u.email}</td>
                                        <td className="p-3 capitalize text-gray-700 dark:text-gray-200">{u.role}</td>
                                        <td className="p-3 text-gray-700 dark:text-gray-200">{new Date(u.createdAt).toLocaleString()}</td>

                                        <td className="p-3 flex flex-wrap gap-2">
                                            <button
                                                onClick={() => {
                                                    setChangeTarget(u);
                                                    setChangePwdOpen(true);
                                                }}
                                                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                            >
                                                <FiKey /> Change
                                            </button>

                                            {u.role !== "admin" ? (
                                                <button
                                                    onClick={() => changeRole(u._id, "admin")}
                                                    className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-green-300"
                                                >
                                                    Promote
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => changeRole(u._id, "user")}
                                                    className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                                >
                                                    Demote
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDelete(u._id)}
                                                className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-red-300"
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
                                No admins found.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {changePwdOpen && changeTarget && (
                <ChangePasswordModal
                    user={changeTarget}
                    onClose={() => setChangePwdOpen(false)}
                    onSubmit={submitChangePassword}
                />
            )}
        </section>
    );
}

const ChangePasswordModal = ({ user, onClose, onSubmit }) => {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-300 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    Change Password — {user.name}
                </h3>

                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        await onSubmit(user._id, password, () => setLoading(false));
                    }}
                    className="space-y-3"
                >
                    <input
                        className="w-full p-2 border rounded 
                            bg-gray-100 border-gray-300 
                            dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        placeholder="New Password"
                        minLength={6}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 
                                dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {loading ? "Updating…" : "Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

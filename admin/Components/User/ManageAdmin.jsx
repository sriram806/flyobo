"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiTrash2, FiUserPlus, FiRefreshCw, FiKey, FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "../Loading/Loading";

export default function ManageAdmin() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [error, setError] = useState("");
    const [changePwdOpen, setChangePwdOpen] = useState(false);
    const [changeTarget, setChangeTarget] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    const base = process.env.NEXT_PUBLIC_BACKEND_URL;

    // Load users
    const loadUsers = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${base}/user/get-all-users`, { withCredentials: true });
            setUsers(data?.users || []);
            setError("");
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Filtered admins
    const filtered = useMemo(() => {
        const admins = users.filter((u) => String(u.role).toLowerCase() === "manager");
        if (!q) return admins;
        const s = q.toLowerCase();
        return admins.filter(
            (u) => (u.name || "").toLowerCase().includes(s) || (u.email || "").toLowerCase().includes(s)
        );
    }, [users, q]);

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / usersPerPage);
    const paginatedUsers = filtered.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

    // Delete user
    const handleDelete = async (id) => {
        if (!confirm("Delete this user?")) return;
        try {
            const { data } = await axios.delete(`${base}/user/${id}`, { withCredentials: true });
            if (data?.success) {
                setUsers((prev) => prev.filter((u) => u._id !== id));
                toast.success("User deleted successfully");
            } else {
                toast.error(data?.message || "Delete failed");
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message);
        }
    };

    // Change role
    const changeRole = async (id, role) => {
        if (!confirm(`Change role to ${role}?`)) return;
        try {
            const { data } = await axios.put(
                `${base}/admin/edit-user-role/${id}`,
                { role },
                { withCredentials: true }
            );
            if (data?.success) {
                setUsers((prev) => prev.map((u) => (u._id === id ? data.data : u)));
                toast.success("Role updated successfully");
            } else toast.error(data?.message || "Role update failed");
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message);
        }
    };

    // Change password
    const submitChangePassword = async (userId, newPassword, onDone) => {
        try {
            const { data } = await axios.post(
                `${base}/admin/change-password/${userId}`,
                { newPassword },
                { withCredentials: true }
            );
            if (data?.success) {
                onDone(true);
                toast.success("Password changed successfully");
                setChangePwdOpen(false);
            } else {
                onDone(false);
                toast.error(data?.message || "Password change failed");
            }
        } catch (err) {
            onDone(false);
            toast.error(err?.response?.data?.message || err.message);
        }
    };

    return (
        <section className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Manage Managers</h2>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" />
                        <input
                            value={q}
                            onChange={(e) => { setQ(e.target.value); setCurrentPage(1); }}
                            placeholder="Search manager..."
                            className="pl-10 px-3 py-2 rounded border w-72 bg-gray-200 border-gray-300 text-gray-700 placeholder-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700"
                        />
                    </div>
                    <button onClick={loadUsers} className="px-3 py-2 rounded bg-gray-200 border border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700">
                        <FiRefreshCw />
                    </button>
                    <button onClick={() => router.push(`/users?tab=create`)} className="flex items-center gap-2 px-4 py-2 rounded bg-sky-600 hover:bg-sky-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700">
                        <FiUserPlus /> Add Manager
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded shadow border border-gray-300 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-300">
                        <Loading />
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-red-500 dark:text-red-400">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-gray-700 dark:text-gray-200">
                            <thead className="bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                                <tr>
                                    {["Name", "Email", "Role", "Created", "Actions"].map((h) => (
                                        <th
                                            key={h}
                                            className="p-3 text-left bg-gray-100 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-200"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedUsers.map((u, i) => (
                                    <tr
                                        key={u._id}
                                        className={`border-t bg-gray-400 dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition`}
                                    >
                                        <td className="p-3 text-gray-800 dark:text-gray-200">{u.name}</td>
                                        <td className="p-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                                        <td className="p-3 capitalize text-gray-700 dark:text-gray-200">{u.role}</td>
                                        <td className="p-3 text-gray-600 dark:text-gray-300">{new Date(u.createdAt).toLocaleString()}</td>

                                        <td className="p-3 flex flex-wrap gap-2">
                                            <button
                                                onClick={() => { setChangeTarget(u); setChangePwdOpen(true); }}
                                                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"
                                            >
                                                <FiKey /> Change
                                            </button>

                                            {u.role !== "manager" ? (
                                                <button
                                                    onClick={() => changeRole(u._id, "manager")}
                                                    className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    Promote
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => changeRole(u._id, "user")}
                                                    className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
                                                >
                                                    Demote
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDelete(u._id)}
                                                className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {paginatedUsers.length === 0 && (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                                No Managers found.
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-4 space-x-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`px-3 py-1 rounded border ${currentPage === p ? "bg-sky-600 text-white border-sky-600" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"}`}
                                    >
                                        {p}
                                    </button>
                                ))}
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

// Change Password Modal
const ChangePasswordModal = ({ user, onClose, onSubmit }) => {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-300 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Change Password — {user.name}</h3>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        await onSubmit(user._id, password, () => setLoading(false));
                    }}
                    className="space-y-3"
                >
                    <input
                        className="w-full p-2 border rounded bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        placeholder="New Password"
                        minLength={6}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white">
                            {loading ? "Updating…" : "Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

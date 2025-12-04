"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function AllPackages() {
	const router = useRouter();
	const [packages, setPackages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [filterDestination, setFilterDestination] = useState("");
	const [deleteId, setDeleteId] = useState(null);

	const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
	const apiBase = API_URL.replace(/\/$/, "");

	const fetchPackages = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await fetch(`${apiBase}/package/get-packages`);
			const data = await res.json();

			if (!res.ok) setError(data.message || "Failed to load packages");
			else setPackages(data.packages || []);
		} catch (err) {
			setError(err.message || "Failed to fetch");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPackages();
	}, []);

	// Filter + Search Logic
	const filteredPackages = useMemo(() => {
		return packages.filter((pkg) => {
			const matchSearch =
				pkg.title.toLowerCase().includes(search.toLowerCase()) ||
				pkg.destination.toLowerCase().includes(search.toLowerCase());

			const matchDestination = filterDestination
				? pkg.destination.toLowerCase() === filterDestination.toLowerCase()
				: true;

			return matchSearch && matchDestination;
		});
	}, [search, filterDestination, packages]);

	const handleDelete = async () => {
		if (!deleteId) return;

		try {
			const res = await fetch(`${apiBase}/package/${deleteId}`, {
				method: "DELETE",
				credentials: "include",
			});
			const data = await res.json();

			if (!res.ok) alert(data.message || "Delete failed");
			else setPackages((prev) => prev.filter((p) => p._id !== deleteId));
		} catch (err) {
			alert(err.message);
		} finally {
			setDeleteId(null);
		}
	};

	return (
		<div className="p-6">

			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Packages</h1>

				<div className="flex gap-2">
					<button
						onClick={() => router.push("/admin/packages/create")}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700"
					>
						Add Package
					</button>

					<button
						onClick={fetchPackages}
						className="px-4 py-2 border rounded-lg dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700"
					>
						Refresh
					</button>
				</div>
			</div>

			{/* Search + Filter Bar */}
			<div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
				<input
					type="text"
					placeholder="Search packages..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full md:w-1/3 px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700"
				/>

				<select
					value={filterDestination}
					onChange={(e) => setFilterDestination(e.target.value)}
					className="w-full md:w-1/4 px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700"
				>
					<option value="">Filter by Destination</option>
					{[...new Set(packages.map((p) => p.destination))].map((dest) => (
						<option key={dest} value={dest}>
							{dest}
						</option>
					))}
				</select>
			</div>

			{/* Table */}
			<div className="overflow-x-auto border rounded-lg dark:border-gray-700">
				<table className="w-full text-left">
					<thead className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
						<tr>
							<th className="p-3">Image</th>
							<th className="p-3">Title</th>
							<th className="p-3">Destination</th>
							<th className="p-3">Price</th>
							<th className="p-3">Duration</th>
							<th className="p-3 text-center">Actions</th>
						</tr>
					</thead>

					<tbody>
						{loading && (
							<tr>
								<td colSpan="6" className="p-4 text-center text-gray-500 dark:text-gray-300">
									Loading...
								</td>
							</tr>
						)}

						{!loading && filteredPackages.length === 0 && (
							<tr>
								<td colSpan="6" className="p-4 text-center text-gray-500 dark:text-gray-400">
									No packages found.
								</td>
							</tr>
						)}

						{filteredPackages.map((pkg) => (
							<tr
								key={pkg._id}
								className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
							>
								<td className="p-3">
									<img
										src={pkg.images || "/no-image.png"}
										alt={pkg.title}
										className="w-20 h-16 rounded object-cover"
									/>
								</td>

								<td className="p-3 font-medium text-gray-900 dark:text-gray-100">
									{pkg.title}
								</td>

								<td className="p-3 text-gray-700 dark:text-gray-300">
									{pkg.destination}
								</td>

								<td className="p-3 text-gray-900 dark:text-gray-200">
									₹{pkg.price}
								</td>

								<td className="p-3 text-gray-700 dark:text-gray-300">
									{pkg.duration} days
								</td>

								<td className="p-3 text-center">
									<div className="flex justify-center gap-3">
										<button
											onClick={() =>
												router.push(`/packages?tab=edit&id=${pkg._id}`)
											}
											className="px-3 py-1 border rounded-lg dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-700"
										>
											Edit
										</button>

										<button
											onClick={() => setDeleteId(pkg._id)}
											className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
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

			{/* DELETE CONFIRM MODAL */}
			{deleteId && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
						<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
							Confirm Delete
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
							This package will be permanently deleted.  
							Are you sure you want to continue?
						</p>

						<div className="mt-6 flex justify-end gap-3">
							<button
								onClick={() => setDeleteId(null)}
								className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
							>
								Cancel
							</button>

							<button
								onClick={handleDelete}
								className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
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
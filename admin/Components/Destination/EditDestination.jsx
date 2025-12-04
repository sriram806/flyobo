"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

const emptyForm = {
	place: "",
	slug: "",
	state: "",
	country: "",
	shortDescription: "",
	tags: "",
	popular: false,
};

export default function EditDestination({ destinationId: propDestinationId } = {}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

	const [form, setForm] = useState(emptyForm);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [coverImageFile, setCoverImageFile] = useState(null);
	const [coverImageUrl, setCoverImageUrl] = useState("");
	const [error, setError] = useState("");

	const idFromParams = searchParams?.get("id") || searchParams?.get("_id") || searchParams?.get("slug");
	const destinationId = propDestinationId || idFromParams;

	useEffect(() => {
		if (!destinationId) {
			setError("No destination id provided");
			setLoading(false);
			return;
		}

		const load = async () => {
			try {
				setLoading(true);
				const res = await fetch(`${API_URL}/destinations/${destinationId}`, { credentials: "include" });
				if (!res.ok) throw new Error("Failed to load destination");
				const data = await res.json();
				const d = data?.destination || data;
				setForm({
					place: d?.place || "",
					slug: d?.slug || "",
					state: d?.state || "",
					country: d?.country || "",
					shortDescription: d?.shortDescription || "",
					tags: (d?.tags || []).join(", "),
					popular: !!d?.popular,
				});
				if (d?.coverImage?.url) setCoverImageUrl(d.coverImage.url);
			} catch (err) {
				setError(err?.message || "Failed to load destination");
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [destinationId, API_URL]);

	const onChange = (key) => (e) => {
		const value = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
		setForm((f) => ({ ...f, [key]: value }));
	};

	const onFileChange = (e) => {
		const file = e?.target?.files?.[0] || null;
		setCoverImageFile(file);
		if (file) setCoverImageUrl("");
	};

	const submit = async (e) => {
		e?.preventDefault?.();
		if (!API_URL) return toast.error("API base URL is missing");
		if (!destinationId) return toast.error("No destination id provided");
		if (!form.place?.trim()) return toast.error("Place is required");

		try {
			setSaving(true);
			setError("");

			const formData = new FormData();
			formData.append("place", form.place.trim());
			if (form.slug?.trim()) formData.append("slug", form.slug.trim());
			if (form.state?.trim()) formData.append("state", form.state.trim());
			if (form.country?.trim()) formData.append("country", form.country.trim());
			if (form.shortDescription?.trim()) formData.append("shortDescription", form.shortDescription.trim());
			const tagsArray = form.tags
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean);
			if (tagsArray.length) formData.append("tags", JSON.stringify(tagsArray));
			formData.append("popular", form.popular ? "true" : "false");

			if (coverImageFile) {
				formData.append("coverImage", coverImageFile);
			} else if (coverImageUrl?.trim()) {
				formData.append("coverImageUrl", coverImageUrl.trim());
			}

			const res = await fetch(`${API_URL}/destination/${destinationId}`, {
				method: "PUT",
				body: formData,
				credentials: "include",
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Failed to update destination");

			toast.success("Destination updated successfully");
			router.push("/destinations?tab=packages");
		} catch (err) {
			const msg = err?.message || "Failed to update destination";
			setError(msg);
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <div className="p-4">Loading...</div>;

	return (
		<section className="lg:col-span-3">
			<div className="relative overflow-hidden rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
				<div className="p-6 sm:p-8">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Destination</h1>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Edit destination details.</p>

					{error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

					<form onSubmit={submit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="sm:col-span-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Place</label>
							<input value={form.place} onChange={onChange("place")} placeholder="Enter city or place" className="mt-1 w-full text-gray-800 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500" />
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug (optional)</label>
							<input value={form.slug} onChange={onChange("slug")} placeholder="custom-slug (optional)" className="mt-1 w-full text-gray-800 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500" />
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
							<input value={form.state} onChange={onChange("state")} placeholder="State / Region" className="mt-1 w-full text-gray-800 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500" />
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
							<input value={form.country} onChange={onChange("country")} placeholder="Country" className="mt-1 w-full text-gray-800 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500" />
						</div>

						<div className="sm:col-span-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</label>
							<textarea value={form.shortDescription} onChange={onChange("shortDescription")} placeholder="Brief short description (optional)" className="mt-1 w-full text-gray-800 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500" maxLength={250} />
						</div>

						<div className="sm:col-span-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image (URL or file)</label>
							<input value={coverImageUrl} onChange={(e)=>{setCoverImageUrl(e.target.value); if(e.target.value) setCoverImageFile(null);}} placeholder="https://..." className="mt-1 w-full text-gray-800 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500" />
							<div className="mt-2">
								<input type="file" accept="image/*" onChange={onFileChange} />
							</div>
						</div>

						<div className="sm:col-span-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
							<input value={form.tags} onChange={onChange("tags")} placeholder="beach, mountain, heritage" className="mt-1 w-full text-gray-800 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500" />
						</div>

						<div className="sm:col-span-2 flex items-center gap-3">
							<label className="inline-flex items-center gap-2">
								<input type="checkbox" checked={form.popular} onChange={onChange("popular")} />
								<span className="text-sm text-gray-700 dark:text-gray-300">Mark as popular</span>
							</label>
						</div>

						<div className="sm:col-span-2 flex items-center gap-3 pt-2">
							<button type="button" onClick={() => router.push("/destinations?tab=packages")} className="inline-flex text-gray-800 dark:text-gray-100 items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>

							<button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 text-white px-4 py-2 text-sm hover:bg-sky-700 disabled:opacity-60">{saving ? "Saving..." : "Save Changes"}</button>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
}


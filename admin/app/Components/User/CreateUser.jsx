"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaCopy, FaEye, FaEyeSlash, FaMagic } from "react-icons/fa";
import toast from "react-hot-toast";

export default function CreateUser() {
	const router = useRouter();
	const base = process.env.NEXT_PUBLIC_BACKEND_URL;

	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		role: "",
		password: "",
	});

	const [touched, setTouched] = useState({});
	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState("");
	const [success, setSuccess] = useState("");
	const [fieldErrors, setFieldErrors] = useState({});
	const [showPassword, setShowPassword] = useState(false);
	const [confirmAdminOpen, setConfirmAdminOpen] = useState(false);

	function onChange(e) {
		const { name, value } = e.target;
		setForm((s) => ({ ...s, [name]: value }));
	}

	function onBlur(e) {
		const { name } = e.target;
		setTouched((t) => ({ ...t, [name]: true }));
	}

	function validate(values) {
		const errs = {};

		if (!values.name?.trim())
			errs.name = "Please enter the full name.";

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
			errs.email = "Enter a valid email.";

		if (values.phone && !/^[0-9+()\s-]{6,20}$/.test(values.phone))
			errs.phone = "Enter a valid phone number.";

		if (!values.role?.trim())
			errs.role = "Please select a role.";  // <-- IMPORTANT

		if (values.password && values.password.length < 8)
			errs.password = "Password must be at least 8 characters.";

		return errs;
	}

	const errors = useMemo(() => validate(form), [form]);
	const isValid = Object.keys(errors).length === 0;

	function generatePassword(length = 12) {
		const chars =
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
		let out = "";
		for (let i = 0; i < length; i++)
			out += chars[Math.floor(Math.random() * chars.length)];
		setForm((s) => ({ ...s, password: out }));
	}

	async function copyPassword() {
		if (!form.password) return;
		await navigator.clipboard.writeText(form.password);
		setSuccess("Password copied to clipboard.");
		setTimeout(() => setSuccess(""), 1400);
	}

	function passwordStrength(pw = "") {
		if (!pw) return 0;
		let score = 0;
		if (pw.length >= 8) score++;
		if (/[A-Z]/.test(pw)) score++;
		if (/[0-9]/.test(pw)) score++;
		if (/[^A-Za-z0-9]/.test(pw)) score++;
		return score;
	}

	async function onSubmit(e) {
		e.preventDefault();

		setTouched({
			name: true,
			email: true,
			phone: true,
			role: true,
			password: true,
		});

		if (form.role === "admin") {
			setConfirmAdminOpen(true);
			return;
		}

		if (!isValid) return;
		await performSubmit();
	}

	async function performSubmit() {
		setLoading(true);
		setFieldErrors({});
		setServerError("");
		setSuccess("");

		try {
			const payload = { ...form };
			if (!payload.password) delete payload.password;

			const res = await fetch(`${base}/admin/create-user`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(payload),
			});

			const body = await res.json().catch(() => ({}));
			if (!res.ok) {
				if (Array.isArray(body?.errors)) {
					const map = {};
					body.errors.forEach((err) => (map[err.param] = err.msg));
					setFieldErrors(map);
				}
				throw new Error(body?.message || "Something went wrong.");
			}

			toast.success("User created successfully.");
			setForm({ name: "", email: "", phone: "", role: "", password: "" });
			setTouched({});
		} catch (err) {
			toast.error(err.message || "Error occurred.");
		} finally {
			setLoading(false);
			setConfirmAdminOpen(false);
		}
	}

	return (
		<div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 p-8 animate-fadeIn">

			{/* LEFT — FORM */}
			<div className="w-full bg-gray-200 border-gray-300 dark:bg-gray-800/70 shadow-2xl p-8 rounded-2xl border dark:border-gray-700 backdrop-blur-xl">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
					Create New User
				</h2>

				{serverError && (
					<div className="text-sm text-red-600 bg-red-100/60 dark:bg-red-900 p-2 rounded mb-3">
						{serverError}
					</div>
				)}

				<form onSubmit={onSubmit} className="space-y-5">

					{/* Name */}
					<div>
						<label className="text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">Full Name</label>
						<input
							name="name"
							value={form.name}
							onChange={onChange}
							onBlur={onBlur}
							className={`mt-1 w-full rounded-md border px-3 py-2 bg-gray-200 border-gray-300 dark:bg-gray-900 dark:text-gray-100 
							${touched.name && errors.name ? "border-red-400" : "border-gray-300"}`}
							placeholder="Jane Doe"
						/>
						{touched.name && errors.name && (
							<p className="text-xs text-red-600 mt-1">{errors.name}</p>
						)}
					</div>

					{/* Email */}
					<div>
						<label className="text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">Email</label>
						<input
							name="email"
							type="email"
							value={form.email}
							onChange={onChange}
							onBlur={onBlur}
							className={`mt-1 w-full rounded-md border px-3 py-2 bg-gray-200 border-gray-300 dark:bg-gray-900 dark:text-gray-100 
							${touched.email && errors.email ? "border-red-400" : "border-gray-300"}`}
							placeholder="example@email.com"
						/>
						{touched.email && errors.email && (
							<p className="text-xs text-red-600 mt-1">{errors.email}</p>
						)}
					</div>

					{/* Phone */}
					<div>
						<label className="text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">Phone</label>
						<input
							name="phone"
							value={form.phone}
							onChange={onChange}
							onBlur={onBlur}
							className={`mt-1 w-full rounded-md border px-3 py-2 bg-gray-200 border-gray-300 dark:bg-gray-900 dark:text-gray-100 
							${touched.phone && errors.phone ? "border-red-400" : "border-gray-300"}`}
							placeholder="+91 98765 43210"
						/>
						{touched.phone && errors.phone && (
							<p className="text-xs text-red-600 mt-1">{errors.phone}</p>
						)}
					</div>

					{/* Role */}
					<div>
						<label className="text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">Role</label>
						<select
							name="role"
							value={form.role}
							onChange={onChange}
							onBlur={onBlur}
							className="mt-1 w-full rounded-md border px-3 py-2 bg-gray-200 border-gray-300 dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select role</option>
							<option value="user">User</option>
							<option value="admin">Admin</option>
						</select>

						{/* 🚨 Show role error */}
						{touched.role && errors.role && (
							<p className="text-xs text-red-600 mt-1">{errors.role}</p>
						)}
					</div>

					{/* Password */}
					<div>
						<div className="flex items-center justify-between">
							<label className="text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">Password</label>
							<div className="flex items-center gap-3 text-sm">
								<button type="button" onClick={() => generatePassword(12)} className="text-blue-600 flex items-center gap-1 hover:underline">
									<FaMagic /> Generate
								</button>
								<button onClick={copyPassword} type="button" className="text-gray-600">
									<FaCopy />
								</button>
								<button onClick={() => setShowPassword((v) => !v)} type="button" className="text-gray-600">
									{showPassword ? <FaEyeSlash /> : <FaEye />}
								</button>
							</div>
						</div>

						<input
							name="password"
							type={showPassword ? "text" : "password"}
							value={form.password}
							onChange={onChange}
							onBlur={onBlur}
							className={`mt-1 w-full rounded-md border px-3 py-2 bg-gray-200 border-gray-300 dark:bg-gray-900 dark:text-gray-100 
							${touched.password && errors.password ? "border-red-400" : "border-gray-300"}`}
						/>

						{/* Strength Bar */}
						<div className="mt-2">
							<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
								<div
									className={`h-2 rounded-full transition-all ${
										passwordStrength(form.password) === 0
											? "bg-red-400"
											: passwordStrength(form.password) === 1
											? "bg-orange-400"
											: passwordStrength(form.password) === 2
											? "bg-yellow-400"
											: "bg-green-500"
									}`}
									style={{
										width: `${(passwordStrength(form.password) / 4) * 100}%`,
									}}
								/>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								Strength: {passwordStrength(form.password)}/4
							</p>
						</div>

						{touched.password && errors.password && (
							<p className="text-xs text-red-600 mt-1">{errors.password}</p>
						)}
					</div>

					{/* Buttons */}
					<div className="flex items-center justify-between pt-3">
						<button
							type="submit"
							disabled={loading}
							className={`px-6 py-2 rounded-lg text-white font-medium shadow-md transition-all 
							${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]"}`}
						>
							{loading ? "Creating..." : "Create User"}
						</button>

						<button
							type="button"
							onClick={() => router.back()}
							className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>

			{/* RIGHT SIDE INFO */}
			<div className="w-full bg-linear-to-br from-blue-600/10 to-blue-300/10 dark:from-gray-900 dark:to-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
				<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
					User Creation Tips
				</h3>
				<p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
					Verify user details carefully before submitting. For security, assign admin access only when needed.
				</p>

				<div className="mt-6 space-y-3 text-sm">
					<p className="text-gray-700 dark:text-gray-200">✓ Email must be valid & active.</p>
					<p className="text-gray-700 dark:text-gray-200">✓ Leave password empty to auto-generate.</p>
					<p className="text-gray-700 dark:text-gray-200">✓ Admins have full system access.</p>
				</div>

				<div className="bg-gray-200 border-gray-300 dark:bg-gray-900/50 p-5 mt-6 rounded-xl border dark:border-gray-700">
					<h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
						Current Details
					</h4>
					<p className="text-gray-900 dark:text-gray-100"><b>Name:</b> {form.name || "—"}</p>
					<p className="text-gray-900 dark:text-gray-100"><b>Email:</b> {form.email || "—"}</p>
					<p className="text-gray-900 dark:text-gray-100"><b>Phone:</b> {form.phone || "—"}</p>
					<p className="text-gray-900 dark:text-gray-100"><b>Role:</b> {form.role || "—"}</p>
				</div>
			</div>

			{/* Confirm Admin Modal */}
			{confirmAdminOpen && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md">
						<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
							Confirm Admin Creation
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
							You are about to assign the <b>Admin</b> role. Admins have full access to all system data and settings.  
							Are you absolutely sure?
						</p>

						<div className="mt-5 flex justify-end gap-3">
							<button
								onClick={() => setConfirmAdminOpen(false)}
								className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-300"
							>
								Cancel
							</button>
							<button
								onClick={performSubmit}
								className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
							>
								Confirm & Create
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

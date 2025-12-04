"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaCopy, FaEye, FaEyeSlash, FaMagic } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

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
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [confirmAdminOpen, setConfirmAdminOpen] = useState(false);

  // ---------- Handlers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, form[name]);
  };

  const validateField = (field, value) => {
    let err = {};
    switch (field) {
      case "name":
        if (!value.trim()) err.name = "Full name is required.";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          err.email = "Enter a valid email.";
        break;
      case "phone":
        if (value && !/^[0-9+()\s-]{6,20}$/.test(value))
          err.phone = "Enter a valid phone number.";
        break;
      case "role":
        if (!value) err.role = "Please select a role.";
        break;
      case "password":
        if (value && value.length < 8)
          err.password = "Password must be at least 8 characters.";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, ...err }));
  };

  const isValid = () => Object.keys(errors).length === 0;

  // ---------- Password Utilities ----------
  const generatePassword = (length = 12) => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
    let pw = "";
    for (let i = 0; i < length; i++)
      pw += chars[Math.floor(Math.random() * chars.length)];
    setForm((prev) => ({ ...prev, password: pw }));
  };

  const copyPassword = async () => {
    if (!form.password) return;
    await navigator.clipboard.writeText(form.password);
    toast.success("Password copied to clipboard!");
  };

  const passwordStrength = (pw = "") => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      role: true,
      password: true,
    });

    if (!isValid()) return;

    if (form.role === "manager") {
      setConfirmAdminOpen(true);
      return;
    }

    await submitUser();
  };

  const submitUser = async () => {
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;

      const { data } = await axios.post(
        `${base}/admin/create-user`,
        payload,
        { withCredentials: true }
      );

      toast.success("User created successfully!");
      setForm({ name: "", email: "", phone: "", role: "", password: "" });
      setTouched({});
      setErrors({});
      setConfirmAdminOpen(false);
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Try again.";
      if (err.response?.data?.errors) {
        const fieldMap = {};
        err.response.data.errors.forEach((e) => (fieldMap[e.param] = e.msg));
        setErrors(fieldMap);
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="w-full grid md:grid-cols-2 gap-8 p-8">
      {/* Form */}
      <div className="bg-gray-200 dark:bg-gray-800/70 p-8 rounded-2xl shadow-2xl border dark:border-gray-700 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Create New User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/** Name */}
          <div>
            <label className="text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">
              Full Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Jane Doe"
              className={`mt-1 w-full rounded-md px-3 py-2 border ${
                touched.name && errors.name
                  ? "border-red-400"
                  : "border-gray-300"
              } bg-gray-200 dark:bg-gray-900 dark:text-gray-100`}
            />
            {touched.name && errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/** Email */}
          <div>
            <label className="text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="example@email.com"
              className={`mt-1 w-full rounded-md px-3 py-2 border ${
                touched.email && errors.email
                  ? "border-red-400"
                  : "border-gray-300"
              } bg-gray-200 dark:bg-gray-900 dark:text-gray-100`}
            />
            {touched.email && errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/** Phone */}
          <div>
            <label className="text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">
              Phone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="+91 98765 43210"
              className={`mt-1 w-full rounded-md px-3 py-2 border ${
                touched.phone && errors.phone
                  ? "border-red-400"
                  : "border-gray-300"
              } bg-gray-200 dark:bg-gray-900 dark:text-gray-100`}
            />
            {touched.phone && errors.phone && (
              <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
            )}
          </div>

          {/** Role */}
          <div>
            <label className="text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 w-full rounded-md px-3 py-2 border bg-gray-200 dark:bg-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select role</option>
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </select>
            {touched.role && errors.role && (
              <p className="text-xs text-red-600 mt-1">{errors.role}</p>
            )}
          </div>

          {/** Password */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">
                Password
              </label>
              <div className="flex items-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => generatePassword()}
                  className="text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <FaMagic /> Generate
                </button>
                <button
                  type="button"
                  onClick={copyPassword}
                  className="text-gray-600"
                >
                  <FaCopy />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 w-full rounded-md px-3 py-2 border ${
                touched.password && errors.password
                  ? "border-red-400"
                  : "border-gray-300"
              } bg-gray-200 dark:bg-gray-900 dark:text-gray-100`}
            />

            {/* Strength Bar */}
            {form.password && (
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
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-3">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white font-medium shadow-md transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]"
              }`}
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

      {/* Info Panel */}
      <div className="bg-linear-to-br from-blue-100 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          User Creation Tips
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          Verify user details carefully before submitting. Assign admin access only if necessary.
        </p>

        <div className="mt-6 space-y-3 text-sm">
          <p className="text-gray-700 dark:text-gray-200">
            ✓ Email must be valid & active.
          </p>
          <p className="text-gray-700 dark:text-gray-200">
            ✓ Leave password empty to auto-generate.
          </p>
          <p className="text-gray-700 dark:text-gray-200">
            ✓ Admins have full system access.
          </p>
        </div>

        <div className="bg-gray-200 mt-72 dark:bg-gray-900/50 p-5 rounded-xl border dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Current Details
          </h4>
          <p className="text-gray-900 dark:text-gray-100">
            <b>Name:</b> {form.name || "—"}
          </p>
          <p className="text-gray-900 dark:text-gray-100">
            <b>Email:</b> {form.email || "—"}
          </p>
          <p className="text-gray-900 dark:text-gray-100">
            <b>Phone:</b> {form.phone || "—"}
          </p>
          <p className="text-gray-900 dark:text-gray-100">
            <b>Role:</b> {form.role || "—"}
          </p>
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
              You are about to assign the <b>Admin</b> role. Admins have full access to all system data. Are you sure?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmAdminOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitUser}
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

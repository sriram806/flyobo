"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export default function AgentBookingUI() {
    const router = useRouter();
    const API = process.env.NEXT_PUBLIC_BACKEND_URL

    // Auth agent from Redux
    const authUser = useSelector((s) => s.auth?.user);
    const agent = authUser ? { id: authUser._id, name: authUser.name, role: authUser.role } : null;

    // Data from server
    const [users, setUsers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [form, setForm] = useState({
        userId: "",
        packageId: "",
        startDate: "",
        discount: 0,
        notes: "",
    });

    const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "" });
    const [travelers, setTravelers] = useState([]);
    const [payment, setPayment] = useState({ amount: 0, currency: "INR", provider: "cash", method: "other", status: "pending", paidAt: new Date() });

    const [amount, setAmount] = useState({ base: 0, discount: 0, total: 0 });
    const [totalPrice, setTotalPrice] = useState(0);
    const [createdBooking, setCreatedBooking] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Autocomplete
    const [emailQuery, setEmailQuery] = useState("");
    const [emailMatches, setEmailMatches] = useState([]);
    const [packageQuery, setPackageQuery] = useState("");
    const [packageMatches, setPackageMatches] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [uRes, pRes] = await Promise.all([
                    axios.get(`${API}/user/get-all-users`, { withCredentials: true }),
                    axios.get(`${API}/package/get-packages`)
                ]);
                setUsers(uRes?.data?.users || []);
                setPackages(pRes?.data?.packages || []);
            } catch (err) {
                toast.error("Failed to load users or packages");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [API]);

    useEffect(() => {
        if (authUser?._id) {
            setForm((s) => ({ ...s, userId: authUser._id }));
            setCustomerInfo({ name: authUser.name, email: authUser.email, phone: authUser.phone });
        }
    }, [authUser]);

    // Autocomplete suggestions
    useEffect(() => {
        if ((emailQuery || "").length < 5) return setEmailMatches([]);
        const q = emailQuery.toLowerCase();
        setEmailMatches(users.filter((u) => (u.email || "").toLowerCase().includes(q)).slice(0, 10));
    }, [emailQuery, users]);

    useEffect(() => {
        if ((packageQuery || "").length < 5) return setPackageMatches([]);
        const q = packageQuery.toLowerCase();
        setPackageMatches(packages.filter((p) => ((p.title || p.name) || "").toLowerCase().includes(q)).slice(0, 10));
    }, [packageQuery, packages]);

    // Calculate amounts based on package and travelers
    useEffect(() => {
        const pkg = packages.find((p) => p._id === form.packageId);
        if (!pkg) return;
        const basePrice = Number(pkg.price || 0);
        const travelerCount = travelers.length || 1;
        const base = basePrice * travelerCount;
        const discount = Number(form.discount || 0);
        const total = Math.max(0, base - discount);
        setAmount({ base, discount, total });
        setTotalPrice(total);
        setPayment((p) => ({ ...p, amount: total })); // Auto-fill payment amount
    }, [form.packageId, travelers, form.discount, packages]);

    const setField = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
    const setCustomerField = (k) => (e) => setCustomerInfo((s) => ({ ...s, [k]: e.target.value }));

    const addTraveler = () => setTravelers([...travelers, { name: "", age: "", gender: "male", isCustomer: false }]);
    const updateTraveler = (index, key, value) => {
        const list = [...travelers];
        list[index][key] = value;
        // If checkbox is customer, auto-fill name
        if (key === "isCustomer" && value) {
            list[index].name = customerInfo.name;
        }
        setTravelers(list);
    };
    const removeTraveler = (index) => setTravelers(travelers.filter((_, i) => i !== index));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.userId || !form.packageId) return toast.error("User and Package are required");
        setIsSubmitting(true);
        try {
            // prepare travelerDetails and travelers count as the server expects
            const travelerDetails = (travelers || []).map((t) => ({
                fullName: t.name || "",
                age: t.age ? Number(t.age) : undefined,
                gender: t.gender || "other",
                passportNumber: t.passportNumber || t.passport || undefined,
            }));

            // ensure payment.amount is a finite number
            const paidAmount = Number(payment?.amount);
            const safePayment = {
                ...payment,
                amount: Number.isFinite(paidAmount) ? paidAmount : Number.isFinite(totalPrice) ? totalPrice : 0,
            };

            const payload = {
                ...form,
                travelers: (travelers || []).length || Number(form.travelers) || 1,
                travelerDetails,
                customerInfo,
                payment: safePayment,
                totalAmount: Number.isFinite(totalPrice) ? totalPrice : (safePayment.amount || 0),
                bookedBy: agent,
            };
            const res = await axios.post(`${API}/bookings/agent/booking/`, payload, { withCredentials: true });
            if (res?.data?.success) {
                toast.success("Booking created");
                // show animated success popup then redirect
                setCreatedBooking(res?.data?.booking || { message: res?.data?.message || "Booking created" });
                // short delay to allow popup to show
                setTimeout(() => router.push("/dashboard"), 2400);
            } else {
                toast.error(res?.data?.message || "Failed to create booking");
                setIsSubmitting(false);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message || "Failed to create booking");
            setIsSubmitting(false);
        }
    };

    // Calculate end date
    const getEndDate = () => {
        const pkg = packages.find((p) => p._id === form.packageId);
        if (!pkg || !form.startDate) return "";
        const start = new Date(form.startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + (pkg.duration || 0));
        return end.toISOString().slice(0, 10);
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
            <h1 className="text-3xl font-bold mb-6 tracking-tight">Create Booking (Agent)</h1>

            {/* Layout */}
            <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Side */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Card Component */}
                    <div className="card">
                        <h3 className="card-title">Booked By</h3>
                        <input
                            disabled
                            value={agent ? `${agent.name} (${agent.role})` : "-"}
                            className="input-class bg-gray-200 dark:bg-gray-700"
                        />
                    </div>

                    {/* Customer Info */}
                    <div className="card">
                        <h3 className="card-title">Customer Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input placeholder="Name" value={customerInfo.name || ""} onChange={setCustomerField("name")} className="input-class" />
                            <input placeholder="Email" value={customerInfo.email || ""} onChange={setCustomerField("email")} className="input-class" />
                            <input placeholder="Phone" value={customerInfo.phone || ""} onChange={setCustomerField("phone")} className="input-class" />
                        </div>

                        {/* Autocomplete */}
                        <input
                            placeholder="Search by email…"
                            value={emailQuery}
                            onChange={(e) => setEmailQuery(e.target.value)}
                            className="input-class mt-3"
                        />

                        {emailMatches.length > 0 && (
                            <ul className="dropdown">
                                {emailMatches.map((u) => (
                                    <li key={u._id} onClick={() => {
                                        setForm((s) => ({ ...s, userId: u._id }));
                                        setCustomerInfo({ name: u.name, email: u.email, phone: u.phone });
                                        setEmailQuery(u.email);
                                        setEmailMatches([]);
                                    }}>
                                        {u.email} — {u.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Package */}
                    <div className="card">
                        <h3 className="card-title">Select Package</h3>

                        <input
                            placeholder="Search package"
                            value={packageQuery}
                            onChange={(e) => setPackageQuery(e.target.value)}
                            className="input-class"
                        />

                        {packageMatches.length > 0 && (
                            <ul className="dropdown">
                                {packageMatches.map((p) => (
                                    <li key={p._id} onClick={() => {
                                        setForm((s) => ({ ...s, packageId: p._id }));
                                        setPackageQuery(p.title || p.name);
                                        setPackageMatches([]);
                                    }}>
                                        {p.title || p.name}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="label">Start Date</label>
                                <input type="date" value={form.startDate || ""} onChange={setField("startDate")} className="input-class" />
                            </div>

                            <div>
                                <label className="label">End Date</label>
                                <input type="date" value={getEndDate()} disabled className="input-class bg-gray-200 dark:bg-gray-800" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="label">Notes</label>
                                <input value={form.notes || ""} onChange={setField("notes")} className="input-class" />
                            </div>
                            <div>
                                <label className="label">Discount</label>
                                <input type="number" value={form.discount ?? ""} onChange={setField("discount")} className="input-class" />
                            </div>
                        </div>
                    </div>

                    {/* Travelers */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="card-title">Travelers</h3>
                            <button type="button" onClick={addTraveler} className="btn-primary">+ Add Traveler</button>
                        </div>

                        {travelers.map((t, i) => (
                            <div key={i} className="traveler-row">
                                <input type="checkbox" checked={!!t.isCustomer}
                                    onChange={(e) => updateTraveler(i, "isCustomer", e.target.checked)} />

                                <input placeholder="Name" value={t.name || ""}
                                    onChange={(e) => updateTraveler(i, "name", e.target.value)}
                                    className="input-class" />

                                <input type="number" placeholder="Age" value={t.age || ""}
                                    onChange={(e) => updateTraveler(i, "age", e.target.value)}
                                    className="input-class" />

                                <select value={t.gender || "male"} onChange={(e) => updateTraveler(i, "gender", e.target.value)} className="input-class">
                                    <option value="male">male</option>
                                    <option value="female">female</option>
                                    <option value="other">other</option>
                                </select>

                                <button type="button" onClick={() => removeTraveler(i)} className="btn-danger">Remove</button>
                            </div>
                        ))}

                    </div>

                    {/* Payment */}
                    <div className="card">
                        <h3 className="card-title">Payment</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                                <label className="label">Amount</label>
                                <input readOnly value={payment.amount ?? 0} className="input-class bg-gray-200 dark:bg-gray-800" />
                            </div>

                            <div>
                                <label className="label">Method</label>
                                <select value={payment.method}
                                    onChange={(e) => setPayment((p) => ({ ...p, method: e.target.value }))}
                                    className="input-class">
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI</option>
                                    <option value="stripe">Stripe</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">Status</label>
                                <select disabled value={payment.status || "pending"} className="input-class bg-gray-200 dark:bg-gray-800">
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">Transaction ID</label>
                                <input value={payment.transactionId || ""} onChange={(e) => setPayment((p) => ({ ...p, transactionId: e.target.value }))} className="input-class" />
                            </div>
                        </div>

                        <div className="mt-4 text-lg font-semibold">
                            Remaining: ₹{Math.max(0, totalPrice - payment.amount)}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="btn-success">
                            {isSubmitting ? "Creating…" : "Create Booking"}
                        </button>
                    </div>

                </div>

                {/* Right Preview */}
                <aside className="preview-card">
                    <h3 className="card-title mb-4">Preview</h3>

                    {/* Package Preview */}
                    <div className="preview-section">
                        <h4 className="font-semibold mb-2">Package</h4>
                        {/* same logic as your code */}
                        {form.packageId ? (() => {
                            const pkg = packages.find((p) => p._id === form.packageId);
                            if (!pkg) return "Package not loaded";

                            return (
                                <div className="space-y-1 text-sm">
                                    <p className="font-semibold">{pkg.title || pkg.name}</p>
                                    <p>Price: ₹{pkg.price}</p>
                                    <p>Start: {form.startDate}</p>
                                    <p>End: {getEndDate()}</p>
                                    <p>Travelers: {travelers.length || 1}</p>
                                    <p>Subtotal: ₹{amount.base}</p>
                                    <p>Discount: ₹{amount.discount}</p>
                                    <p className="font-bold text-lg">Total: ₹{amount.total}</p>
                                </div>
                            );
                        })()
                            :
                            <p>No package selected</p>
                        }
                    </div>

                    {/* Customer Preview */}
                    <div className="preview-section">
                        <h4 className="font-semibold mb-2">Customer</h4>
                        {customerInfo.name ? (
                            <div className="space-y-1 text-sm">
                                <p className="font-semibold">{customerInfo.name}</p>
                                <p>{customerInfo.email}</p>
                                <p>{customerInfo.phone}</p>
                            </div>
                        ) : <p>No customer info</p>}
                    </div>
                </aside>

            </form>
        </div>
    );
}

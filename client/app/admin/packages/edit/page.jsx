"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import PackageImageUploader from "@/app/components/Packages/PackageImageUploader";

const emptyForm = {
  title: "",
  description: "",
  price: "",
  estimatedPrice: "",
  duration: "",
  destination: "",
  status: "active",
  featured: false,
  itinerary: [],
  included: ["Accommodation", "Meals", "Guide", "Trek permits"],
  excluded: ["Flights", "Insurance", "Personal expenses"],
};

const ListManager = ({ label, list, value, onChange, onAdd, onRemove, placeholder }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <span className="text-xs text-gray-500">{list.length} items</span>
    </div>
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
        placeholder={placeholder}
        className="flex-1 block w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-rose-500 dark:focus:border-rose-500 transition-colors duration-200"
      />
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors duration-200"
      >
        Add
      </button>
    </div>
    {list.length > 0 && (
      <ul className="mt-3 space-y-2">
        {list.map((item, i) => (
          <li
            key={i}
            className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {label.includes("Included") ? '✓' : '✗'} {item}
            </span>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="text-gray-400 hover:text-rose-500 transition-colors duration-200"
              aria-label="Remove item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);

  const [temp, setTemp] = useState({
    day: "", desc: "", activities: "", incItem: "", excItem: ""
  });

  // Load package details
  useEffect(() => {
    const load = async () => {
      if (!API_URL || !id) return;
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/package/${id}`, { withCredentials: true });
        const pkg = data?.foundPackage || data?.package || data?.data || data;
        if (!pkg) return;
        const normalized = {
          title: pkg.title || "",
          description: pkg.description || "",
          price: pkg.price ?? "",
          estimatedPrice: pkg.estimatedPrice ?? "",
          duration: pkg.duration ?? "",
          destination: pkg.destination || "",
          status: pkg.status || "active",
          featured: Boolean(pkg.featured),
          itinerary: Array.isArray(pkg.itinerary) ? pkg.itinerary : [],
          included: Array.isArray(pkg.included) ? pkg.included : emptyForm.included,
          excluded: Array.isArray(pkg.excluded) ? pkg.excluded : emptyForm.excluded,
        };
        setForm(normalized);
        setInitialForm(normalized);
        
        // Set existing image
        if (pkg.images && pkg.images.trim() !== "") {
          setImage({
            url: pkg.images,
            isNew: false
          });
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to load package");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_URL, id]);

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialForm), [form, initialForm]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    const priceStr = form.price === null || form.price === undefined ? "" : String(form.price);
    const priceNum = Number(priceStr);
    if (priceStr.trim() === "" || isNaN(priceNum) || priceNum <= 0) errs.price = "Enter a valid price";
    const durStr = form.duration === null || form.duration === undefined ? "" : String(form.duration);
    const durNum = Number(durStr);
    if (durStr !== "" && (isNaN(durNum) || durNum <= 0)) errs.duration = "Duration must be greater than 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCancel = () => {
    if (isDirty && !confirm("Discard unsaved changes?")) return;
    router.push("/admin/packages");
  };

  const addItinerary = () => {
    if (!temp.day || !temp.desc.trim()) return toast.error("Day and description are required");
    if (Number(temp.day) > Number(form.duration)) return toast.error("Day cannot exceed package duration");
    const newEntry = {
      day: Number(temp.day),
      description: temp.desc.trim(),
      activities: temp.activities.split(",").map(a => a.trim()).filter(Boolean),
    };
    setForm(f => ({ ...f, itinerary: [...f.itinerary, newEntry] }));
    setTemp(t => ({ ...t, day: "", desc: "", activities: "" }));
  };

  const removeItinerary = index => setForm(f => ({ ...f, itinerary: f.itinerary.filter((_, i) => i !== index) }));

  const addListItem = (key) => {
    if (!temp[key].trim()) return;
    setForm(f => ({ ...f, [key === "incItem" ? "included" : "excluded"]: [...f[key === "incItem" ? "included" : "excluded"], temp[key].trim()] }));
    setTemp(t => ({ ...t, [key]: "" }));
  };

  const removeListItem = (key, i) => setForm(f => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) }));

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!API_URL) return toast.error("API base URL is missing");
    if (!id) return toast.error("Missing package id");
    if (!validate()) return;

    try {
      setSaving(true);
      
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('price', Number(form.price));
      formData.append('estimatedPrice', form.estimatedPrice ? Number(form.estimatedPrice) : 0);
      formData.append('duration', Number(form.duration) || 0);
      formData.append('destination', form.destination.trim());
      formData.append('status', form.status);
      formData.append('featured', !!form.featured);
      formData.append('itinerary', JSON.stringify(form.itinerary.map(d => ({ ...d, activities: d.activities.filter(Boolean) }))));
      formData.append('included', JSON.stringify(form.included));
      formData.append('excluded', JSON.stringify(form.excluded));
      
      // Add new image file or URL if changed
      if (image && image.isNew && image.file) {
        formData.append('image', image.file);
      } else if (image && image.isNew && image.url && image.isUrl) {
        formData.append('imageUrl', image.url);
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const headers = {
        'Content-Type': 'multipart/form-data',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      await axios.put(`${API_URL}/package/edit-package/${id}`, formData, { 
        withCredentials: true,
        headers,
      });
      toast.success("Package updated");
      router.push("/admin/packages");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update package");
    } finally {
      setSaving(false);
    }
  };

  const sortedItinerary = useMemo(() => [...form.itinerary].sort((a, b) => a.day - b.day), [form.itinerary]);

  const onChange = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Edit Travel Package</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update package details and itinerary</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button type="button" onClick={handleCancel} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors duration-200">Cancel</button>
              <button type="submit" form="pkg-edit-form" disabled={loading || saving || !isDirty} className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-600 transition-colors duration-200 ${loading || saving || !isDirty ? 'bg-rose-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'}`}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {!loading ? (
            <form id="pkg-edit-form" onSubmit={submit} className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <input type="text" value={form.title} onChange={onChange("title")} className="w-full px-3.5 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/60" />
                    {errors.title && <p className="text-rose-500 text-sm">{errors.title}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destination</label>
                    <input type="text" value={form.destination} onChange={onChange("destination")} className="w-full px-3.5 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/60" />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                    <input type="number" value={form.price} onChange={onChange("price")} className="w-full px-3.5 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/60" />
                    {errors.price && <p className="text-rose-500 text-sm">{errors.price}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Price</label>
                    <input type="number" value={form.estimatedPrice} onChange={onChange("estimatedPrice")} className="w-full px-3.5 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/60" />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (Days)</label>
                    <input type="number" value={form.duration} onChange={onChange("duration")} className="w-full px-3.5 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/60" />
                    {errors.duration && <p className="text-rose-500 text-sm">{errors.duration}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <div className="relative mt-1">
                      <select value={form.status} onChange={onChange("status")} className="appearance-none w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/60">
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                      </select>
                      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Featured</label>
                    <div className="flex items-center gap-4 mt-1">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="radio"
                          name="featured"
                          value="true"
                          checked={!!form.featured === true}
                          onChange={(e) => setForm(f => ({ ...f, featured: e.target.value === 'true' }))}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        Yes
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="radio"
                          name="featured"
                          value="false"
                          checked={!!form.featured === false}
                          onChange={(e) => setForm(f => ({ ...f, featured: e.target.value === 'true' }))}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea value={form.description} onChange={onChange("description")} rows={3} className="w-full px-3.5 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/60" />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <PackageImageUploader
                      image={image}
                      onImageChange={setImage}
                      disabled={saving}
                      label="Package Cover Image"
                    />
                  </div>
                </div>
              </div>

              {/* Itinerary */}
              <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Itinerary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input type="number" placeholder="Day" value={temp.day} onChange={e => setTemp(t => ({ ...t, day: e.target.value }))} className="px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/60" />
                  <input type="text" placeholder="Description" value={temp.desc} onChange={e => setTemp(t => ({ ...t, desc: e.target.value }))} className="px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/60" />
                  <input type="text" placeholder="Activities (comma separated)" value={temp.activities} onChange={e => setTemp(t => ({ ...t, activities: e.target.value }))} className="px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/60" />
                  <button type="button" onClick={addItinerary} className="px-3.5 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/60">Add</button>
                </div>
                <ul className="space-y-2 mt-3">
                  {sortedItinerary.map((d, i) => (
                    <li key={i} className="flex items-center justify-between bg-white dark:bg-gray-900 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Day {d.day}: {d.description}</span>
                      <button type="button" onClick={() => removeItinerary(i)} className="text-rose-600 hover:text-rose-700">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Included/Excluded */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ListManager
                  label="Included Items"
                  list={form.included}
                  value={temp.incItem}
                  onChange={e => setTemp(t => ({ ...t, incItem: e.target.value }))}
                  onAdd={() => addListItem("incItem")}
                  onRemove={i => removeListItem("included", i)}
                  placeholder="Add included item"
                />
                <ListManager
                  label="Excluded Items"
                  list={form.excluded}
                  value={temp.excItem}
                  onChange={e => setTemp(t => ({ ...t, excItem: e.target.value }))}
                  onAdd={() => addListItem("excItem")}
                  onRemove={i => removeListItem("excluded", i)}
                  placeholder="Add excluded item"
                />
              </div>
            </form>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Loading package details...</p>
          )}
        </div>
      </div>
    </section>
  );
}

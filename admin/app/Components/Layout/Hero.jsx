"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronDown, FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import { toast } from "react-hot-toast";
import HeroLivePreview from "./HeroLivePreview";

export default function AdminHero() {
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [tags, setTags] = useState([]);
  const [slides, setSlides] = useState([]);

  const [open, setOpen] = useState(null); // Accordion toggle

  useEffect(() => {
    const loadHero = async () => {
      try {
        const res = await axios.get(`${API}/layout`, { params: { type: 'Hero' }, withCredentials: true });

        // If server explicitly returns success:false, treat "not found" as empty state
        if (res?.data && res.data.success === false) {
          const msg = (res.data.message || '').toLowerCase();
          if (msg.includes('not found') || msg.includes('hero not found')) {
            setTags([]);
            setSlides([]);
            return;
          }
          // other server-side error
          return;
        }

        const hero = res.data?.hero || res.data?.layout?.hero || {};
        const fetchedSlides = (hero.images || []).map(i => (typeof i === 'string' ? i : i.url)).filter(Boolean);
        const fetchedTags = (hero.destinations || []).map(d => d.name).filter(Boolean);
        setTags(fetchedTags.length ? fetchedTags : []);
        setSlides(fetchedSlides.length ? fetchedSlides : []);
      } catch (err) {
        // If backend responded with 404 and message 'Hero not found', treat as empty state
        const remoteMsg = err?.response?.data?.message || '';
        if (typeof remoteMsg === 'string' && remoteMsg.toLowerCase().includes('hero not found')) {
          setTags([]);
          setSlides([]);
          return;
        }
        // otherwise silently ignore (admin UI can create)
      }
    };

    loadHero();
  }, []);

  // Save tags
  const saveTag = (index) => {
    // Map tags to hero.destinations and send to /layout
    const payload = { type: 'Hero', hero: { destinations: tags.map(t => ({ name: t })) } };
    axios
      .put(`${API}/layout`, payload)
      .then(() => toast.success(`Tag ${index + 1} saved!`))
      .catch(() => toast.error("Failed"));
  };

  // Save slides
  const saveSlides = () => {
    // Map slides (urls) to hero.images and send to /layout
    const payload = { type: 'Hero', hero: { images: slides.map(s => ({ url: s })) } };
    axios
      .put(`${API}/layout`, payload)
      .then(() => toast.success("Slides saved!"))
      .catch(() => toast.error("Failed"));
  };

  // Add new tag
  const addTag = () => {
    setTags([...tags, ""]);
  };

  // Add new slide from file
  const uploadSlide = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API}/upload`, formData);
    setSlides([...slides, res.data.url]);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold mb-6">Hero Section Settings</h1>

      {/* LIVE PREVIEW */}
      <div className="rounded-xl overflow-hidden shadow-xl mb-8 border">
        <HeroLivePreview tags={tags} slides={slides} />
      </div>

      {/* FAQ STYLE UI */}
      <div className="space-y-4">

        {/* TAGS */}
        <div className="border rounded-lg">
          <button
            onClick={() => setOpen(open === "tags" ? null : "tags")}
            className="w-full flex justify-between items-center p-4 font-medium"
          >
            <span>Quick Destination Tags</span>
            <FiChevronDown className={`transition ${open === "tags" ? "rotate-180" : ""}`} />
          </button>

          {open === "tags" && (
            <div className="p-4 border-t space-y-3">
              {tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    value={tag}
                    onChange={(e) => {
                      const newTags = [...tags];
                      newTags[index] = e.target.value;
                      setTags(newTags);
                    }}
                    className="border p-2 rounded w-full"
                  />
                  <button
                    onClick={() => saveTag(index)}
                    className="p-2 bg-green-600 text-white rounded"
                  >
                    <FiSave />
                  </button>
                  <button
                    onClick={() => setTags(tags.filter((_, i) => i !== index))}
                    className="p-2 bg-red-600 text-white rounded"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}

              <button onClick={addTag} className="px-3 py-2 bg-sky-600 text-white rounded flex items-center gap-2">
                <FiPlus /> Add Tag
              </button>
            </div>
          )}
        </div>

        {/* SLIDES */}
        <div className="border rounded-lg">
          <button
            onClick={() => setOpen(open === "slides" ? null : "slides")}
            className="w-full flex justify-between items-center p-4 font-medium"
          >
            <span>Hero Slideshow Images</span>
            <FiChevronDown className={`transition ${open === "slides" ? "rotate-180" : ""}`} />
          </button>

          {open === "slides" && (
            <div className="p-4 border-t space-y-4">

              {slides.map((img, index) => (
                <div key={index} className="flex items-center gap-4">
                  <img src={img} alt="" className="w-40 h-24 object-cover rounded border" />
                  <button
                    onClick={() => setSlides(slides.filter((_, i) => i !== index))}
                    className="p-2 bg-red-600 text-white rounded"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}

              <label className="block mt-4">
                <input type="file" className="hidden" onChange={uploadSlide} />
                <div className="px-4 py-2 bg-sky-600 text-white rounded cursor-pointer inline-block">
                  Upload New Slide
                </div>
              </label>

              <button
                onClick={saveSlides}
                className="px-4 py-2 bg-green-600 text-white rounded flex gap-2 items-center"
              >
                <FiSave /> Save Slides
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

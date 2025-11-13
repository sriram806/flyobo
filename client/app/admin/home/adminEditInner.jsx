"use client";

import React, { useEffect, useState } from "react";
import { useHomeContent } from '@/app/context/HomeContentContext';

export default function AdminEditInner() {
  const { content, save } = useHomeContent();
  const [local, setLocal] = useState(content || {});
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setLocal(content || {});
  }, [content]);

  const update = (path, value) => {
    setLocal((l) => {
      const copy = { ...l };
      const keys = path.split('.');
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!cur[keys[i]]) cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const onSave = () => {
    try {
      save(local);
      setStatus('Saved to localStorage');
      setTimeout(() => setStatus(null), 2000);
    } catch (e) {
      console.error(e);
      setStatus('Save failed');
    }
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const onImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    update('hero.image', dataUrl);
  };

  const onSaveServer = async () => {
    setStatus('Saving to server...');
    try {
      const payload = {
        type: 'Banner',
        image: local?.hero?.image || local?.banners?.image || null,
        title: local?.hero?.title || local?.banners?.title || '',
        subTitle: local?.hero?.subtitle || local?.banners?.subTitle || local?.hero?.subtitle || ''
      };

      if (!payload.image) {
        setStatus('Please select an image before saving to server');
        return;
      }

      const res = await fetch('/api/v1/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Server save failed');
      setStatus('Saved to server');
      // reflect saved data locally
      save({ banners: data.layout || {}, hero: { title: payload.title, subtitle: payload.subTitle, image: payload.image } });
      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Server save failed');
    }
  };

  if (!content) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4">Edit Home Content</h2>

      <section className="mb-4">
        <h3 className="font-medium">Hero</h3>
        <label className="block text-sm mt-2">Title</label>
        <input className="w-full p-2 border rounded mt-1" value={local.hero?.title || ''} onChange={(e) => update('hero.title', e.target.value)} />
        <label className="block text-sm mt-2">Highlight</label>
        <input className="w-full p-2 border rounded mt-1" value={local.hero?.highlight || ''} onChange={(e) => update('hero.highlight', e.target.value)} />
        <label className="block text-sm mt-2">Subtitle</label>
        <textarea className="w-full p-2 border rounded mt-1" value={local.hero?.subtitle || ''} onChange={(e) => update('hero.subtitle', e.target.value)} />
        <label className="block text-sm mt-2">Hero Image (upload)</label>
        <input type="file" accept="image/*" onChange={onImageChange} className="mt-1" />
        {local.hero?.image && (
          <div className="mt-2">
            <img src={local.hero.image} alt="hero preview" className="w-full max-h-48 object-cover rounded" />
          </div>
        )}
      </section>

      <section className="mb-4">
        <h3 className="font-medium">Newsletter</h3>
        <label className="block text-sm mt-2">Title</label>
        <input className="w-full p-2 border rounded mt-1" value={local.newsletter?.title || ''} onChange={(e) => update('newsletter.title', e.target.value)} />
        <label className="block text-sm mt-2">Description</label>
        <textarea className="w-full p-2 border rounded mt-1" value={local.newsletter?.description || ''} onChange={(e) => update('newsletter.description', e.target.value)} />
        <label className="block text-sm mt-2">Button Text</label>
        <input className="w-full p-2 border rounded mt-1" value={local.newsletter?.button || ''} onChange={(e) => update('newsletter.button', e.target.value)} />
      </section>

      <section className="mb-4">
        <h3 className="font-medium">Referral</h3>
        <label className="block text-sm mt-2">Title</label>
        <input className="w-full p-2 border rounded mt-1" value={local.referral?.title || ''} onChange={(e) => update('referral.title', e.target.value)} />
        <label className="block text-sm mt-2">Subtitle</label>
        <textarea className="w-full p-2 border rounded mt-1" value={local.referral?.subtitle || ''} onChange={(e) => update('referral.subtitle', e.target.value)} />
      </section>

      <section className="mb-4">
        <h3 className="font-medium">Footer</h3>
        <label className="block text-sm mt-2">Copy</label>
        <input className="w-full p-2 border rounded mt-1" value={local.footer?.copy || ''} onChange={(e) => update('footer.copy', e.target.value)} />
      </section>

      <div className="flex items-center gap-3">
        <button onClick={onSave} className="px-4 py-2 bg-sky-600 text-white rounded">Save (local)</button>
        <button onClick={onSaveServer} className="px-4 py-2 bg-green-600 text-white rounded">Save to server (admin)</button>
        <button onClick={() => { localStorage.removeItem('homeContent'); location.reload(); }} className="px-4 py-2 border rounded">Reset</button>
        {status && <div className="text-sm text-gray-600">{status}</div>}
      </div>

      <p className="mt-4 text-xs text-gray-500">Note: This admin editor saves to the browser's localStorage (key: <code>homeContent</code>). To persist changes server-side, wire this form to an API endpoint and have the server update your CMS or configuration storage.</p>
    </div>
  );
}

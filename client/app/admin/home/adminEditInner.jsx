"use client";

import React, { useEffect, useState } from "react";
import { useHomeContent } from '@/app/context/HomeContentContext';
import Loading from "@/app/components/LoadingScreen/Loading";

export default function AdminEditInner() {
  const { content, save } = useHomeContent();
  const [local, setLocal] = useState(content || {});
  const [status, setStatus] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

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
      setStatus('Saved locally');
      setLastSaved(new Date());
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

      const base = process.env.NEXT_PUBLIC_BACKEND_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/api/v1` : 'http://localhost:5000/api/v1');
      const res = await fetch(`${base}/layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Server save failed');
      setStatus('Saved to server');
      setLastSaved(new Date());
      // reflect saved data locally
      save({ banners: data.layout || {}, hero: { title: payload.title, subtitle: payload.subTitle, image: payload.image } });
      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Server save failed');
    }
  };

  if (!content) return <div className="bg-gray-100 dark:bg-gray-800 min-h-screen p-6"><Loading /></div>;

  return (
    <div className="bg-gray-100 dark:bg-gray-800 min-h-screen">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Edit Home Content</h2>
          <div className="flex items-center gap-3">
            <button onClick={onSave} className="px-4 py-2 bg-sky-600 text-white rounded">Save</button>
            <button onClick={onSaveServer} className="px-4 py-2 bg-green-600 text-white rounded">Publish</button>
            <button onClick={() => { localStorage.removeItem('homeContent'); location.reload(); }} className="px-4 py-2 border rounded text-gray-600 dark:text-gray-300">Reset</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white dark:bg-gray-900 border rounded shadow-sm">
            <div className="space-y-6">
              <section>
                <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Hero</h3>
                <label className="block text-sm text-gray-900 dark:text-gray-100">Title</label>
                <input className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded mt-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" value={local.hero?.title || ''} onChange={(e) => update('hero.title', e.target.value)} />
                <label className="block text-sm mt-2 text-gray-900 dark:text-gray-100">Highlight</label>
                <input className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded mt-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" value={local.hero?.highlight || ''} onChange={(e) => update('hero.highlight', e.target.value)} />
                <label className="block text-sm mt-2 text-gray-900 dark:text-gray-100">Subtitle</label>
                <textarea className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded mt-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" value={local.hero?.subtitle || ''} onChange={(e) => update('hero.subtitle', e.target.value)} />
                <label className="block text-sm mt-2 text-gray-900 dark:text-gray-100">Hero Image (upload)</label>
                <input type="file" accept="image/*" onChange={onImageChange} className="mt-1 text-gray-900 dark:text-gray-100" />
                {local.hero?.image && (
                  <div className="mt-2">
                    <img src={local.hero.image} alt="hero preview" className="w-full max-h-48 object-cover rounded" />
                  </div>
                )}
              </section>

              <section>
                <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Newsletter</h3>
                <label className="block text-sm text-gray-900 dark:text-gray-100">Title</label>
                <input className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded mt-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" value={local.newsletter?.title || ''} onChange={(e) => update('newsletter.title', e.target.value)} />
                <label className="block text-sm mt-2 text-gray-900 dark:text-gray-100">Description</label>
                <textarea className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded mt-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" value={local.newsletter?.description || ''} onChange={(e) => update('newsletter.description', e.target.value)} />
                <label className="block text-sm mt-2 text-gray-900 dark:text-gray-100">Button Text</label>
                <input className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded mt-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" value={local.newsletter?.button || ''} onChange={(e) => update('newsletter.button', e.target.value)} />
              </section>

              <section>
                <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Referral</h3>
                <label className="block text-sm text-gray-900 dark:text-gray-100">Title</label>
                <input className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded mt-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" value={local.referral?.title || ''} onChange={(e) => update('referral.title', e.target.value)} />
                <label className="block text-sm mt-2 text-gray-900 dark:text-gray-100">Subtitle</label>
                <textarea className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded mt-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" value={local.referral?.subtitle || ''} onChange={(e) => update('referral.subtitle', e.target.value)} />
              </section>

              <section>
                <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Footer</h3>
                <label className="block text-sm text-gray-900 dark:text-gray-100">Copy</label>
                <input className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded mt-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" value={local.footer?.copy || ''} onChange={(e) => update('footer.copy', e.target.value)} />
              </section>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 border rounded">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Live Preview</h3>
              <div className="text-sm text-gray-500">{status || (lastSaved ? `Last saved ${lastSaved.toLocaleTimeString()}` : 'Not saved')}</div>
            </div>

            <div className="space-y-6">
              <div className="rounded overflow-hidden shadow-sm">
                <div className="h-48 flex items-center justify-center text-white" style={{ background: local.hero?.image ? `url(${local.hero.image}) center/cover no-repeat` : '#0ea5e9' }}>
                  <div className="bg-black bg-opacity-30 w-full h-full flex flex-col items-center justify-center p-4">
                    <div className="text-xl font-bold">{local.hero?.title || 'Hero Title'}</div>
                    {local.hero?.highlight && <div className="mt-1 text-sm text-yellow-300">{local.hero.highlight}</div>}
                    {local.hero?.subtitle && <div className="mt-2 text-sm max-w-xl text-center">{local.hero.subtitle}</div>}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-gray-900 rounded shadow-sm">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Newsletter</div>
                <div className="text-sm text-gray-600 mt-1  dark:text-gray-300">{local.newsletter?.title || 'Stay updated'}</div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{local.newsletter?.description || 'Enter your details to get travel deals.'}</div>
                <div className="mt-3">
                  <button className="px-3 py-1 bg-sky-600 text-white rounded">{local.newsletter?.button || 'Subscribe'}</button>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-gray-900 rounded shadow-sm">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Referral</div>
                <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">{local.referral?.title || 'Refer & Earn'}</div>
                <div className="mt-2 text-sm text-gray-900 dark:text-gray-100">{local.referral?.subtitle || 'Invite friends and earn rewards.'}</div>
              </div>

              <div className="text-xs text-gray-500">{local.footer?.copy || '© Your Travel Company'}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

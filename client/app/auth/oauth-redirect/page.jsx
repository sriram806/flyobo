"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

const OAuthRedirectPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      if (!hash) {
        router.replace('/');
        return;
      }
      const raw = hash.replace('#payload=', '') || hash.replace('#', '');
      const decoded = decodeURIComponent(raw);
      const payload = JSON.parse(decoded);
      // payload expected: { token, user }
      if (payload?.user) {
        // Persist minimal token locally so other tabs can read it if necessary
        try { localStorage.setItem('auth_token', payload.token); } catch (e) {}
        // Dispatch user into redux store
        try { dispatch(setAuthUser(payload.user)); } catch (e) {}
        
        // Redirect manager to admin page
        if (payload.user.role === "manager") {
          router.replace('/admin');
          return;
        }
      }
      // Navigate to home or intended page
      router.replace('/');
    } catch (err) {
      console.error('OAuth redirect parse error', err);
      try { router.replace('/'); } catch (e) {}
    }
  }, [dispatch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mb-4"></div>
        <p>Completing sign-in...</p>
      </div>
    </div>
  );
};

export default OAuthRedirectPage;

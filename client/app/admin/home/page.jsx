"use client";

import React from "react";
import { HomeContentProvider } from '@/app/context/HomeContentContext';

import AdminEditInner from './adminEditInner';

// Wrap the admin editor with HomeContentProvider so useHomeContent works inside the editor.
export default function AdminEditHome() {
  return (
    <HomeContentProvider>
      <AdminEditInner />
    </HomeContentProvider>
  );
}

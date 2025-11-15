"use client";

import React from "react";
import { HomeContentProvider } from '@/app/context/HomeContentContext';

import AdminEditInner from './adminEditInner';

export default function AdminEditHome() {
  return (
    <HomeContentProvider>
      <AdminEditInner />
    </HomeContentProvider>
  );
}

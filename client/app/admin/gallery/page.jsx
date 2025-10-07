"use client";
import React from "react";
import AdminProtected from "@/app/hooks/adminProtected";
import AdminGallery from "@/app/components/Admin/AdminGallery";

export default function AdminGalleryPage() {
  return (
    <AdminProtected>
      <div className="min-h-screen px-4 py-6 lg:px-8">
        <AdminGallery />
      </div>
    </AdminProtected>
  );
}
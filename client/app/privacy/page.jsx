"use client";

import React from "react";
import Header from "@/Components/Layout/Header";
import Footer from "@/Components/Layout/Footer";
import Heading from "@/Components/MetaData/Heading";

export default function PrivacyPage() {
  return (
    <>
      <Heading title={"Privacy Policy | Flyobo"} description={"Privacy Policy"} keywords={"privacy,flyobo"} />
      <Header />
      <main className="max-w-3xl max-h-full mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4">FlyOBO Travelling takes your privacy seriously. This policy explains how we collect, use, and protect your personal data when you use our services.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>We collect information necessary to process bookings and provide support.</li>
          <li>We may use cookies to improve the user experience; see cookie settings in your browser.</li>
          <li>We do not sell personal data. We may share data with service providers to fulfill bookings.</li>
          <li>You can request access, correction, or deletion of your personal data by contacting support@flyobo.com.</li>
        </ul>
        <p className="mt-6">For more details, contact support@flyobo.com or review our terms.</p>
      </main>
      <Footer />
    </>
  );
}

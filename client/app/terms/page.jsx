"use client";

import React from "react";
import Header from "@/Components/Layout/Header";
import Footer from "@/Components/Layout/Footer";
import Heading from "@/Components/MetaData/Heading";

export default function TermsPage() {
  return (
    <>
      <Heading title={"Terms of Service | Flyobo"} description={"Terms of Service"} keywords={"terms,flyobo"} />
      <Header />
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
        <p className="mb-4">These Terms of Service govern your use of FlyOBO Travelling services. By creating an account and using our services, you agree to the following terms:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use the service in compliance with applicable laws and regulations.</li>
          <li>Provide accurate information during account creation and booking.</li>
          <li>Respect intellectual property and content usage rules.</li>
          <li>Follow cancellation and refund policies as disclosed during booking.</li>
        </ul>
        <p className="mt-6">For full details, contact support@flyobo.com or see the Privacy Policy for data handling practices.</p>
      </main>
      <Footer />
    </>
  );
}

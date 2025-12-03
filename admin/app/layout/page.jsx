"use client";

import { useSearchParams } from 'next/navigation';
import Faq from '../Components/Layout/Faq';
import AdminHero from '../Components/Layout/Hero';

export default function Page() {
  const params = useSearchParams();
  const tab = params?.get('tab') || 'list';

  return (
    <>
      <div className="flex">
        <main className="flex-1 pr-5 pl-5">
          {tab === 'hero' && <AdminHero />}
          {tab === 'faq' && <Faq />}
        </main>
      </div>
    </>
  );
}

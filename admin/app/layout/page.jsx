"use client";

import Faq from '@/Components/Layout/Faq';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const params = useSearchParams();
  const tab = params?.get('tab') || 'list';

  return (
    <>
      <div className="flex">
        <main className="flex-1 pr-5 pl-5">
          {tab === 'faq' && <Faq />}
        </main>
      </div>
    </>
  );
}

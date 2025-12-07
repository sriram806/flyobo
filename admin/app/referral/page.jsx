"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import AllReferralAnalytics from '@/Components/Referral/AllReferralAnalytics';
import ReferralSettings from '@/Components/Referral/ReferralSettings';
import ReferralLeaderboard from '@/Components/Referral/ReferralLeaderboard';
import ReferralRewardsManagement from '@/Components/Referral/RewardManagement';
import MaintenancePage from '@/Components/Maintenance/Maintenance';


export default function Page() {
  const params = useSearchParams();
  const tab = params?.get('tab') || 'list';

  return (
    <>
      <div className="flex">
        <main className="flex-1 pr-5 pl-5">
          {tab === 'analytics' && <MaintenancePage />}
          {tab === 'settings' && <ReferralSettings />}
          {tab === 'leaderboard' && <MaintenancePage />}
          {tab === 'management' && <MaintenancePage />}
        </main>
      </div>
    </>
  );
}

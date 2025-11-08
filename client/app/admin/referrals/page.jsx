'use client'

import React, { useState } from 'react'
import ReferralOverview from './ReferralOverview'
import ReferralLeaderboard from './ReferralLeaderboard'
import ReferralRewardsManagement from './ReferralRewardsManagement'

export default function ReferralPage() {
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'leaderboard', or 'rewards'

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'rewards', label: 'Reward Management' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Referral System</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your referral program and rewards
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {activeTab === 'overview' && <ReferralOverview />}
          {activeTab === 'leaderboard' && <ReferralLeaderboard />}
          {activeTab === 'rewards' && <ReferralRewardsManagement />}
        </div>
      </div>
    </div>
  )
}
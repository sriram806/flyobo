import React from 'react'
import Link from 'next/link'
import { FaUsers, FaBoxOpen, FaCalendarCheck, FaImages, FaChartBar, FaAddressBook, FaGift, FaKey, FaBell, FaMoneyBillWave, FaCog, FaFileAlt, FaPlug, FaTools, FaShieldAlt, FaLifeRing } from 'react-icons/fa'

const services = [
  { key: 'users', title: 'Users', subtitle: 'Manage and inspect', count: 6, href: '/dashboard/users', icon: FaUsers },
  { key: 'packages', title: 'Packages', subtitle: '10 items', count: 10, href: '/dashboard/packages', icon: FaBoxOpen },
  { key: 'bookings', title: 'Bookings', subtitle: 'Manage bookings', count: 0, href: '/dashboard/bookings', icon: FaCalendarCheck },
  { key: 'gallery', title: 'Gallery', subtitle: 'Manage and inspect', count: 0, href: '/dashboard/gallery', icon: FaImages },
  { key: 'analytics', title: 'Analytics', subtitle: 'Manage and inspect', count: 0, href: '/dashboard/analytics', icon: FaChartBar },
  { key: 'contacts', title: 'Contacts / Messages', subtitle: 'Manage and inspect', count: 0, href: '/dashboard/contacts', icon: FaAddressBook },
  { key: 'referrals', title: 'Referrals', subtitle: 'Manage and inspect', count: 0, href: '/dashboard/referrals', icon: FaGift },
  { key: 'otp', title: 'OTP Service', subtitle: 'Manage and inspect', count: 0, href: '/dashboard/otp', icon: FaKey },
  // 8 additional services
  { key: 'notifications', title: 'Notifications', subtitle: 'Manage notifications', count: 0, href: '/dashboard/notifications', icon: FaBell },
  { key: 'payments', title: 'Payments', subtitle: 'Payment reports', count: 0, href: '/dashboard/payments', icon: FaMoneyBillWave },
  { key: 'settings', title: 'Settings', subtitle: 'Platform settings', count: 0, href: '/dashboard/settings', icon: FaCog },
  { key: 'reports', title: 'Reports', subtitle: 'Audit & logs', count: 0, href: '/dashboard/reports', icon: FaFileAlt },
  { key: 'integrations', title: 'Integrations', subtitle: 'Connected services', count: 0, href: '/dashboard/integrations', icon: FaPlug },
  { key: 'tools', title: 'Developer Tools', subtitle: 'Admin utilities', count: 0, href: '/dashboard/tools', icon: FaTools },
  { key: 'security', title: 'Security', subtitle: 'Auth & roles', count: 0, href: '/dashboard/security', icon: FaShieldAlt },
  { key: 'support', title: 'Support', subtitle: 'Help & tickets', count: 0, href: '/dashboard/support', icon: FaLifeRing },
]

const PlatformServices = () => {
  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Platform Services</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Quick access to backend services and administration pages.</p>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-300">Status: <span className="text-green-400 font-medium">Connected</span></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.key} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="rounded-md w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-900 shadow-sm">
                  <Icon size={20} className="text-sky-500 dark:text-sky-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{s.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{s.subtitle}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{typeof s.count === 'number' ? `${s.count} items` : s.count}</div>
                <Link href={s.href} className="text-sm text-sky-500 hover:underline">Open</Link>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default PlatformServices

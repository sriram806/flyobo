import React from 'react'
import Link from 'next/link'
import { FaUsers, FaBoxOpen, FaCalendarCheck, FaImages, FaChartBar, FaAddressBook, FaGift, FaKey, FaBell, FaMoneyBillWave, FaCog, FaFileAlt, FaPlug, FaTools, FaShieldAlt, FaLifeRing, FaPlaneDeparture } from 'react-icons/fa'
import { MdOpenInNew } from "react-icons/md";

const services = [
  { key: 'users', title: 'Users', subtitle: 'Manage and inspect Users', count: 6, href: '/users?tab=analytics', icon: FaUsers },
  { key: 'packages', title: 'Packages', subtitle: 'Manage and inspect Packages', count: 10, href: '/packages?tab=analytics', icon: FaBoxOpen },
  { key: 'bookings', title: 'Bookings', subtitle: 'Manage bookings Bookings', count: 0, href: '/bookings?tab=analytics', icon: FaCalendarCheck },
  { key: 'gallery', title: 'Gallery', subtitle: 'Manage and inspect Gallery', count: 0, href: '/gallery', icon: FaImages },
  { key: 'destinations', title: 'Destinations', subtitle: 'Manage and inspect Destinations', count: 0, href: '/destinations?tab=analytics', icon: FaPlaneDeparture },
  { key: 'contacts', title: 'Contacts ', subtitle: 'Manage and inspect Contacts', count: 0, href: '/contact', icon: FaAddressBook },
  { key: 'referrals', title: 'Referrals', subtitle: 'Manage and inspect Referrals', count: 0, href: '/referral?tab=analytics', icon: FaGift },
  { key: 'faq', title: 'Faq', subtitle: 'Manage and inspect Faq', count: 0, href: '/layout?tab=faq', icon: FaKey },
  // 8 additional services ravali inak vastavi 
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
                <Link href={s.href} className="text-sm text-sky-500 hover:underline"><MdOpenInNew size={25} fontSize={20} /></Link>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default PlatformServices

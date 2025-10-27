"use client";

import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { Gift, Users, Star, DollarSign } from "lucide-react";

const ReferralBanner = () => {
  const user = useSelector((state) => state?.auth?.user);

  return (
    <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
              <Gift className="h-8 w-8 text-yellow-300" />
              <h3 className="text-2xl md:text-3xl font-bold">
                Refer & Earn
              </h3>
              <Star className="h-6 w-6 text-yellow-300" />
            </div>
            
            <p className="text-blue-100 text-lg mb-4">
              Invite friends to Flyobo and earn amazing rewards for every successful referral!
            </p>
            
            {/* Benefits */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full text-sm">
                <DollarSign className="h-4 w-4" />
                <span>₹100 per referral</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full text-sm">
                <Users className="h-4 w-4" />
                <span>₹50 signup bonus</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full text-sm">
                <Gift className="h-4 w-4" />
                <span>Instant rewards</span>
              </div>
            </div>
          </div>
          
          {/* Right Action */}
          <div className="flex flex-col items-center gap-4">
            {user ? (
              <Link
                href="/profile?tab=referral"
                className="bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                View My Referrals
              </Link>
            ) : (
              <Link
                href="/register"
                className="bg-white text-blue-600 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Join & Start Earning
              </Link>
            )}
            
            <div className="text-center">
              <p className="text-xs text-blue-200">
                No limits • Instant payouts • Share with unlimited friends
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats row */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-yellow-300">₹100</p>
              <p className="text-xs text-blue-200">Per Referral</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-300">₹50</p>
              <p className="text-xs text-blue-200">Welcome Bonus</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-300">∞</p>
              <p className="text-xs text-blue-200">No Limits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralBanner;